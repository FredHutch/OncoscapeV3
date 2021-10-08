import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import * as d3 from 'd3';
 
import * as _ from 'lodash';
import introJs from 'intro.js';

import { GraphConfig } from './../../../model/graph-config.model';
import { DataDecorator } from './../../../model/data-map.model';
import { Legend } from './../../../model/legend.model';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { SavedPointsWrapper } from './../../visualization/savedpoints/savedpoints.model';
import { ChartFactory } from '../chart/chart.factory';
import { DataService } from 'app/service/data.service';
import { ComputeWorkerUtil } from 'app/service/compute.worker.util';
import { ScatterSelectionLassoController } from 'app/controller/scatter/scatter.selection.lasso.controller';
import { WorkspaceComponent } from '../workspace.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { genomeConstants, genomeCompute } from 'app/component/visualization/genome/genome.compute';
import { CollectionTypeEnum } from 'app/model/enum.model';
import { DataTable } from './../../../model/data-field.model';
import { VisualizationView } from './../../../model/chart-view.model';
import { first, sample } from 'rxjs/operators';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';
import { SurvivalWidgetComponent } from './survival-widget.component';
import { CopynumberWidgetComponent } from './copynumber-widget.component';
import { DiffexpWidgetComponent } from './diffexp-widget.component';
import { COMPUTE_TSNE_COMPLETE } from 'app/action/compute.action';
import { CommonSidePanelModel} from './commonSidePanelModel';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-workspace-common-side-panel',
  templateUrl: './common-side-panel.component.html',
  styleUrls: ['./common-side-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CommonSidePanelComponent implements AfterViewInit, OnChanges, OnDestroy {
  public static instance: CommonSidePanelComponent;
  public commonSidePanelModel:CommonSidePanelModel;

  // TEMP DEL ME
  @ViewChild('survivalSvgContainer') survivalSvgContainer: ElementRef;

  @ViewChild('svgContainer_Survival') newSurvivalWidget: SurvivalWidgetComponent;
  @ViewChild('svgContainer_Copy_Number') newCopynumberWidget: CopynumberWidgetComponent;
  @ViewChild('svgContainer_Differential_Expression') newDiffexpWidget: DiffexpWidgetComponent;


 // @ViewChild('cohortChosen') cohortChosen: ElementRef;
  @ViewChild('selectedCohortTextField') selectedCohortText: ElementRef;

  @Input()
  datasetDescription: DatasetDescription;

  @Output() hide = new EventEmitter<any>();

  private wutil  = new ComputeWorkerUtil();  // Not for remote cpu calls, just for data access utility functions.
  private oncoBandsData:Array<Array<any>> = [];

  public autoUpdate = true;

  public updateSurvival = _.debounce(this.update, 600);

  // These are things in config which trigger reloading or reoptimizing data for copynumber widget.
  // Everything else in config can be left alone for these purposes.
  public lastCopynumberProcessedCohortName:string = null;

  public getCnaDataForGene(geneName:string):any {
    if (this.commonSidePanelModel.cnaData) {
      let r = this.commonSidePanelModel.cnaData.find(v=>v.m == geneName); 
      if(r) {
        return r;
      }
    }
    return null;
  }

  public _config: GraphConfig;
  get config(): GraphConfig {
    return this._config;
  }

  @Input()
  set config(configValue: GraphConfig) {
    let self = this;
    if (configValue === null) {
      return;
    }

    if (this._config == null || 
      this._config.database != configValue.database  ) 
    {
      this.commonSidePanelModel.definedCohorts = []; // was null
      this.commonSidePanelModel.patientMap = null;
      this.commonSidePanelModel.sampleMap = null;
      this.commonSidePanelModel.patientData = null;

      this.commonSidePanelModel.cnaData = null;
      this.commonSidePanelModel.cnaSampleMapData = null;

      this.commonSidePanelModel.lastCopynumberProcessedDatabase = null;
      this.lastCopynumberProcessedCohortName = null;
      this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString = null;
      this.visuallyClearWidgets();
    }

    // TEMPNOTE: this seems unneeded.
    // if (this._config == null || 
    //   this._config.visualization != configValue.visualization) 
    // {
      this.lastCopynumberProcessedCohortName = null;
     // this.lastCopynumberProcessedMarkerFilterAsString = null;
    // }

    if (configValue.cohortName != this.lastCopynumberProcessedCohortName){
      this.lastCopynumberProcessedCohortName = null;
    }
    if (configValue.markerFilter.join(' ') != this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString){
      this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString = null;
    }
    this._config = configValue;
    this.commonSidePanelModel.graphConfig = this._config;

    if(this.newSurvivalWidget){
      this.newSurvivalWidget.processConfigChange(configValue);
    }
    if(this.newCopynumberWidget){
      this.newCopynumberWidget.processConfigChange(configValue);
    }
    if(this.newDiffexpWidget){
      this.newDiffexpWidget.processConfigChange(configValue);
    }

    if(!this.commonSidePanelModel.definedCohorts) {
      this.dataService.getCustomCohorts(this.config.database).then(retrievedCustomCohorts => {
        this.commonSidePanelModel.definedCohorts =  retrievedCustomCohorts;
        self.populateCohortsHtmlTable(self.commonSidePanelModel.definedCohorts);
    });
  }
    this.processConfigChangeAfterGenomeLoaded();
}

  public getSavedPointsList(database:string):Promise<any> {
    return this.dataService.getSavedPointsList(database);
  }

  public putSavedPointsWrapper(database:string, wrapper:SavedPointsWrapper):Promise<any> {
    return this.dataService.putSavedPointsWrapper(this.config.database, wrapper);
  }


  colorOfAll(): string { return this.commonSidePanelModel.cohortColors[0]};

  colorOfManualSelection():string {
    let pos =  this.commonSidePanelModel.definedCohorts.length // Includes "All" and custom cohorts
    return this.commonSidePanelModel.cohortColors[pos]; 
  }

  colorOfSavedCohort(existingCohort) {
    if (existingCohort ==null) {
      // It is All Patients and Samples, use first color.
      this.commonSidePanelModel.cohortColors[0];
    }
    let pos =  this.commonSidePanelModel.definedCohorts.findIndex(dc => dc.n == existingCohort.n);
    return this.commonSidePanelModel.cohortColors[pos]; 
  }

  colorOfSavedCohortByName(name) {
    if (name == 'All') {
      // It is All Patients and Samples, use first color.
      return this.commonSidePanelModel.cohortColors[0];
    }
    let pos =  this.commonSidePanelModel.definedCohorts.findIndex(dc => dc.n == name);
    if (pos) {
      return this.commonSidePanelModel.cohortColors[pos];
    } else {
      return "#888888"; // gray
    }
  }

  setColorCellForSelectedCohort(color:string): void {
    document.getElementById('colorCellForSelectedCohort').setAttribute('bgcolor', color);
  }

  setAddCohortBtnVisibility(show:boolean): void {
    document.getElementById('cellForAddingCohort').setAttribute('style', show ? 'display:block;' : 'display:none;');
  }

  // This method used by "*" icon button in timeline, and in spreadhseet.
  public createCohortFromPids(pids:Array<string>){
    let n = pids.length;
    if (n==0) {
      window.alert("There are no patients selected. Click on the patient IDs in the left column.")
      return;
    }

    var cohortName = prompt(`Please enter a name for the new cohort of ${n} patients.`, "");

    if (cohortName != null && cohortName.trim() != "") {
      let newCohort:any = this.createCohortFromPatientSelectionIds(pids);

      newCohort.n = cohortName;
      WorkspaceComponent.instance.addCohort({
        database: this.config.database,
        cohort: newCohort
      });
  
      window.setTimeout(() => {this.drawWidgets()},350); 
    }
  }
  
  public setSelectionPatientIds(patientIds:Array<string>, existingCohort, selectionModifiers:SelectionModifiers) {
    // If existingCohort is null, this is coming from manual selection.
    // If it is not null, it is coming from All, or a custom saved cohort.
    // If it is the string "Cohort", this is a followup call from the controller, so ignore it. 
    // Because we have already updated the common side panel.
    // If it's the string "Legend", we clicked on a legend item.

    if(patientIds == null) {
      window.alert('Expected list of patient IDs, but it was null.');
      return;
    }

    console.log('setSelectionPatientIds, count='+patientIds.length);

    let extendModifier:boolean = false;
    let inverseModifier:boolean = false;
    if(selectionModifiers){
      if(selectionModifiers.extend){
        extendModifier = selectionModifiers.extend;
      }
      if(selectionModifiers.inverse){
        inverseModifier = selectionModifiers.inverse;
      }
    }

    // Process modifiers, if any.
    if (extendModifier || inverseModifier){
      let oldSelectionIds = this.commonSidePanelModel.selectionIds;
      if(extendModifier){
        let allIds:Array<string> = oldSelectionIds.concat(patientIds);
        this.commonSidePanelModel.selectionIds = Array.from(new Set(allIds));
      } else {
        // Deselect. Take original list and remove all matches in the new list.
        this.commonSidePanelModel.selectionIds = oldSelectionIds.filter(n => !patientIds.includes(n));
      }
    } else {
      this.commonSidePanelModel.selectionIds = patientIds;
    }

    if((patientIds.length == 0 || (existingCohort && existingCohort != "Legend")) && !extendModifier && !inverseModifier) {
      if(existingCohort == "Cohort") {
        // Do nothing, this is a followup from selectioncontroller.
      } else{
        let displayName = "All Patients + Samples";
        if(patientIds.length > 0) { 
          displayName = existingCohort.n;
          this.commonSidePanelModel.lastSelectedDefinedCohort = existingCohort;
        } else {
          this.commonSidePanelModel.lastSelectedDefinedCohort = null;
          existingCohort = this.commonSidePanelModel.definedCohorts[0]; // Set back to All, if we are deselecting.
        } 
        this.selectedCohortText.nativeElement.value = `${displayName} (${existingCohort.pids.length})`;
        this.setColorCellForSelectedCohort(this.colorOfSavedCohort(existingCohort));
        this.setAddCohortBtnVisibility(false);
        if (OncoData.instance.currentSelectionController){
          OncoData.instance.currentSelectionController.setSelectionViaCohortDirect(existingCohort);
        }
        
      }
    } else {

      if(existingCohort != null) {  // Just for Legend case, not Selection.
        let source:string = existingCohort == "Legend" ? "Legend" : "Selection";
        if (OncoData.instance.currentSelectionController) {
          let aCohort = this.createCohortFromPatientSelectionIds(this.commonSidePanelModel.selectionIds);
          OncoData.instance.currentSelectionController.setSelectionViaCohortViaSource(aCohort, source);
        }
      }

      this.commonSidePanelModel.lastSelectedDefinedCohort = null;
      let d = `(${this.commonSidePanelModel.selectionIds.length}@${Date().toString().slice(16,24)})`;
      this.selectedCohortText.nativeElement.value = "Selection " + d;
      this.setColorCellForSelectedCohort(this.colorOfManualSelection());
      this.setAddCohortBtnVisibility(true);

    }
  }

  handleSavedCohortClick(index: number) {
    if(index <= this.commonSidePanelModel.definedCohorts.length) {
      // svg._groups[0][0].getElementsByClassName('km-curve')[0]
      let mouseEvent:any = event;
      let c = this.commonSidePanelModel.definedCohorts[index];
      let selectionModifiers:SelectionModifiers = new SelectionModifiers();
      selectionModifiers.extend = mouseEvent.shiftKey;
      selectionModifiers.inverse = mouseEvent.altKey;

      window.setTimeout(() => {
        this.setSelectionPatientIds(c.pids, c, selectionModifiers);
      }, 20);
    } else {
      alert(`Could not find defined cohort with index of ${index}.`);
    }
  }

  populateCohortsHtmlTable(cohorts) {
    let tableAsAny:any = document.getElementById('savedCohortsTable');
    let MyTable:HTMLTableElement = tableAsAny;
    let innerTBody ="";
    for(let i=0; i<cohorts.length; i++) {
      let nameDescription = cohorts[i].n ;
      if (nameDescription != "All Patients"){
        nameDescription = `${nameDescription} (${cohorts[i].pids.length})`;
      }
      //
      let deleteCellContents = "";
      if (i > 0) { // Do not offer option to "delete" the All Patients cohort.
        deleteCellContents = `
        <mat-icon class="material-icons common-side-cohort-list-delete"  style="font-size: 16px;"
        onclick="window.reachableOncoData.currentCommonSidePanel.handleAddCohortClick(${i});"
        role="img" aria-hidden="true">add</mat-icon>        
        <mat-icon class="material-icons common-side-cohort-list-delete"   style="font-size: 16px;"
        onclick="window.reachableOncoData.currentCommonSidePanel.handleSubtractCohortClick(${i});"
        role="img" aria-hidden="true">remove</mat-icon>
        <mat-icon class="material-icons common-side-cohort-list-delete" style="font-size: 16px;"
        onclick="window.reachableOncoData.currentCommonSidePanel.handleDeleteCohortClick(${i});"
        role="img" aria-hidden="true">delete</mat-icon>
        `
      }
      innerTBody = innerTBody + `
      <tr >
      <td width="10" bgcolor="${this.commonSidePanelModel.cohortColors[i]}" >&nbsp;</td>
                <td >&nbsp;</td>
                <td width="100%" height="23" class="common-side-cohort-list-item"
                onclick="window.reachableOncoData.currentCommonSidePanel.handleSavedCohortClick(${i}); ">
                ${nameDescription}</td>
      <td nowrap style="font-size: 12px; vertical-align: middle;" >${deleteCellContents}</td>
      </tr>`;      
    };
    window.setTimeout(()=> {MyTable.innerHTML = `<tbody>${innerTBody}</tbody>`}, 20);
  }


  handleAddCohortClick(index: number) {
    alert("Add button not yet implemented. To add to the current selection, hold SHIFT key and click this cohort's name.");
  }

  handleSubtractCohortClick(index: number) {
    alert("Subtract button not yet implemented. To subtract from the current selection, hold ALT key and click this cohort's name.");

  }

  handleDeleteCohortClick(index: number) {
    if(window.confirm("Are you sure you want to DELETE this cohort? This cannot be undone.")) {
      let self = this;
      if(index >0 && index <= this.commonSidePanelModel.definedCohorts.length) {
        this.commonSidePanelModel.lastSelectedDefinedCohort = null;
        let c = this.commonSidePanelModel.definedCohorts[index];
        WorkspaceComponent.instance.delCohort({
          database: self.config.database,
          cohort: c
        });
        window.setTimeout(() => {self.drawWidgets()},350);     
      } else {
        alert(`Could not find defined cohort with index of ${index}.`);
      }
    }
  }

  createCohortFromPatientSelectionIds(selectionIds:Array<string>) {
    // compute a Set of sampleIds. add to cohort.
    // WARNING: we are assuming one sample per patient!! MJ TODO TBD
    let sampleSet = new Set([]);
    let newCohort;
    try {
      selectionIds.forEach(id => {
        let sid = this.commonSidePanelModel.patientMap[id];
        if(sid) {
          sampleSet.add(sid);
        }
      });
      let sampleIds = Array.from(sampleSet);

      newCohort = {
        n: 'new' + Math.random() + '_' + Date.now(),
        pids: selectionIds,
        sids: sampleIds,
        conditions:[],
        fromSelection: true
      };
    } catch (err) {
      console.error('createCohortFromPatientSelectionIds error...');      
      console.dir(err);
    }
    return newCohort;
  }

  addCohortClicked(e):void {
    let self = this;

    let newCohort:any = this.createCohortFromPatientSelectionIds(self.commonSidePanelModel.selectionIds);
    newCohort.n = this.selectedCohortText.nativeElement.value;
    WorkspaceComponent.instance.addCohort({
      database: self.config.database,
      cohort: newCohort
    });

    window.setTimeout(() => {self.drawWidgets()},350);
  }

  public applySelectedCohortNameFilter(filterValue: string) {
    // filterValue = filterValue.trim();
    // filterValue = filterValue.toLowerCase();
    // this.dataSource.filter = filterValue;
    //=====.log(Date.now().toString());
    //document.activeElement.blur()
  }

  drawWidgets(): void {
    let self = this;
    this.dataService.getCustomCohorts(this.config.database).then(retrievedCustomCohorts => {
      this.commonSidePanelModel.definedCohorts =  retrievedCustomCohorts;
      self.populateCohortsHtmlTable(self.commonSidePanelModel.definedCohorts);
    });
    
    if(this.newSurvivalWidget){
      window.setTimeout(() => this.newSurvivalWidget.drawSurvivalWidget(), 50);
    }
    if(this.newCopynumberWidget){
      window.setTimeout(() => this.newCopynumberWidget.drawCopynumbers(), 50);
    }
    if(this.newDiffexpWidget){
      window.setTimeout(() => this.drawDiffexp(), 50);
    }
  }

  visuallyClearWidgets(): void {
    if(this.newSurvivalWidget){
      this.newSurvivalWidget.clearSvg();
    }
    if(this.newCopynumberWidget){
      this.newCopynumberWidget.clearSvg();
    }
    if(this.newDiffexpWidget){
      this.newDiffexpWidget.clearSvg();
    }
  }

  async drawDiffexp(): Promise<any> {
    let self = this;
    let HANDCODEDRNATABLENAME = "rna";
    let firstRnaTable = OncoData.instance.dataLoadedAction.tables.find(v => v.ctype == CollectionTypeEnum.MRNA);
    if(firstRnaTable == null) {
      console.warn('Need to ensure all mRNA tables import as MRNA, not MATRIX.');
      firstRnaTable = OncoData.instance.dataLoadedAction.tables.find(v => v.ctype == CollectionTypeEnum.MATRIX);
    }
    if (firstRnaTable){
      HANDCODEDRNATABLENAME = firstRnaTable.tbl;
    }


    let debugRnaLoadKey = OncoData.instance.dataLoadedAction.dataset + '_hasShownSkipLoadRna';
    // if(window[debugRnaLoadKey] == null) {
    //   window.alert("******** SKIP LOADING RNA *****");
    // }
    // window[debugRnaLoadKey]=true;

    // 262144 is CollectionTypeEnum.MATRIX. Use that if we don't have
    // a window.reachableOncoData.dataLoadedAction.tables with ctype == CollectionTypeEnum.MRNA
    if(WorkspaceComponent.instance.hasLoadedTable(HANDCODEDRNATABLENAME) == false){
      WorkspaceComponent.instance.requestLoadedTable(HANDCODEDRNATABLENAME);
      window.setTimeout(() => this.drawDiffexp(), 50);  
      return null;
    }
    
    if(true) { // =======this.commonSidePanelModel.tableNameUsedForCopynumber) {         
      // continue
    } else {
      console.log('Not drawing diffexp widget, because config.table is not of type required.');
      return;
    }

    let el = document.querySelector('#svgContainer_Differential_Expression');
    let   svg:any = d3.select(el.getElementsByTagName('svg')[0]);
    this.newDiffexpWidget.drawSvg(svg, {tableName:HANDCODEDRNATABLENAME}); 
  }


  public static setSurvival = new EventEmitter<{
    legend: Array<Legend>;
    graph: number;
  }>();
  
  private tablesThatCouldBeUsedForCopynumber = [];

  private async processConfigChangeAfterGenomeLoaded(){
    let self = this;

    if(this.newSurvivalWidget){
      this.newSurvivalWidget.processConfigChange(this.config);
    }
    if(this.newCopynumberWidget){
      this.newCopynumberWidget.processConfigChange(this.config);
    }
    if(this.newDiffexpWidget){
      this.newDiffexpWidget.processConfigChange(this.config);
    }

    this.setupAllGenes().then(sagResult => {

      let getAllTablesPromise:Promise<any> = null;
      if(this.commonSidePanelModel.tableNameUsedForCopynumber == null || 
        this.commonSidePanelModel.lastCopynumberProcessedDatabase != self._config.database  
        ) {  
          // Need to get list of tables in this database, see if one
          // is of type gistic_threshold, for copynumber widget.
          getAllTablesPromise = this.dataService.getDatasetTables(this._config.database);
      }

      Promise.all([getAllTablesPromise]).then (getTablesResult => {
        if(getTablesResult[0] == null) {
          console.log('Error? getTablesResult is null, meaning we did not find all tables again.');
        } else {
          let tableArray:Array<DataTable> = getTablesResult[0];
          let thresholdCopyNumberTables = tableArray.filter(table => 
            (table.ctype == CollectionTypeEnum.GISTIC_THRESHOLD)
          );
          let nonThresholdCopyNumberTables = tableArray.filter(table => 
            (table.ctype == CollectionTypeEnum.GISTIC) ||
            (table.ctype == CollectionTypeEnum.CNV) ||
            (table.tbl.toLowerCase() == 'nn_data_cna') // Hardcoded hack for NN glioma. -MJ TBD
          );

          let copyNumberTables = thresholdCopyNumberTables.concat(nonThresholdCopyNumberTables);

          this.tablesThatCouldBeUsedForCopynumber = copyNumberTables;
          if(copyNumberTables.length > 0) {
            console.log(`====> There is a copy number table for copynumber: [${copyNumberTables[0].tbl}].`);
            this.commonSidePanelModel.tableNameUsedForCopynumber = copyNumberTables[0].tbl;
          } else {
            console.log(`====> There is no copy number table for copynumber.`);
            this.commonSidePanelModel.tableNameUsedForCopynumber = null;
          }
        }
        self.dataService.getPatientData('notitia-' + self._config.database, 'patient')
          .then(result => {
            this.commonSidePanelModel.patientData = result.data;
            this.commonSidePanelModel.patientMap = result.patientMap;
            this.commonSidePanelModel.sampleMap = result.sampleMap;
            self.updateSurvival();
            self.drawWidgets();  // copynumbers widget goes into a loop unitl it's marked ready for drawing. This lets survival widget draw right away.

            if(this.newCopynumberWidget) {
              // window.alert('*** SKIPPING CNA ***');
              this.newCopynumberWidget.loadCNAAndFilterIfNeeded(this.newCopynumberWidget, this.config).then(function(v) {
                console.log('MJ loaded cna data (if needed) within processConfigChangeAfterGenomeLoaded.');
              });
            }

          })
      });
    });
  }

  public _legends: Array<Legend> = [];
  @Input()
  public set legends(value: Array<Legend>) {
    if (value === null) {
      console.log(`TEMPNOTE: Input for legend-panel was null.`);
      return;
    }
    this._legends = value;
    this.updateSurvival();
  }

  public select(): void {}

  public deselect(): void {}

  ngAfterViewInit(): void {
    console.warn('commonside ngAfterViewInit');
    this.wireCspToWidgets();

  }

  wireCspToWidgets(){
    if(this.newSurvivalWidget){
      this.newSurvivalWidget.commonSidePanelModel = CommonSidePanelComponent.instance.commonSidePanelModel;
    }
    if(this.newCopynumberWidget){
      this.newCopynumberWidget.commonSidePanelModel = CommonSidePanelComponent.instance.commonSidePanelModel;
    }
    if(this.newDiffexpWidget){
      this.newDiffexpWidget.commonSidePanelModel = CommonSidePanelComponent.instance.commonSidePanelModel;
    }
  }

  ngOnDestroy() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('trkchanges');
    for (const propName in changes) {
      console.log(`ngOnChanges ${propName} changed.`);
    }    
    this.commonSidePanelModel.dataService = this.dataService;
    this.commonSidePanelModel.datasetDescription = this.datasetDescription;
    console.log('datasetDescription updated');
    this.wireCspToWidgets();

    if(window["tourSeen_"+ this.commonSidePanelModel.graphConfig.database] == null) {
      let self = this;
      window.setTimeout(
        self.startTour, 100);
      window["tourSeen_"+ this.commonSidePanelModel.graphConfig.database] = true;
    }
  }

  introJsFunction:any;

  public startTour(){
    // TBD: why is "this" the window object now?
    let startTourSelf = CommonSidePanelComponent.instance; // this;

    introJs().addHints();

    let steps:Array<any> = [
      {
        title: 'Navigation',
        intro: `This tour highlights our tools for exploring molecular and clinical data. <br>
        <br>
        First, navigating a scatter plot:<br><br>
        <img width="232" src="/assets/videos/OncoTour_ScatterMovements.gif" />
`
      },
      {
        title: 'Selections',
        intro: `
        <ul>
        <li>To select points, hold Shift, then click-drag like a lasso.<br></li>
        <li>To deselect all points, click on the background.</li>
        </ul><br>
        <img width="232" src="/assets/videos/OncoTour_Selections.gif" />
        `
      },
      {
        title: 'Color Data',
        intro: `
        Set a color legend, then use it to access subsets.<br><br>
        <img width="232" src="/assets/videos/OncoTour_Color.gif" />
        `
      },
      {
        title: 'Cohorts',
        intro: `
        Create a cohort from any selection.<br><br>
        <img width="232" src="/assets/videos/OncoTour_Cohorts.gif" />
        `

      }  //,

      // {
      //   element: document.querySelector('#svgContainer_Survival'),
      //   intro: 'When you select points or a cohort, their survival information appears as a new plot line.'
      // }
    ];

    this.introJsFunction = introJs().setOptions({
      steps: steps
    }).onexit(function () {
      console.log("...currentstep??");
      window.setTimeout(function(){
        console.log('... about to call startTourReminder');
        startTourSelf.startTourReminder();
      }, 50);
      // try introJS()._currentstep
      //return confirm("To restart the tour, click 'Take A Tour' on the blue menu bar. Are you sure you want to stop the tour?");
    }).onafterchange(function(targetEl:HTMLElement){

    }).start();    
  }

  private startTourReminder(){
    console.log('... inside startTourReminder');
    let steps:Array<any> = [
      {
        title: 'Done',
        element: document.querySelector('#takeTourBtn'),
        intro: 'If you want to start this tour again, click this link.'
      }
    ];
    this.introJsFunction = introJs().setOptions({
      steps: steps
    }).start();
  }

  public update(): void {
    if (!this.autoUpdate) {
      return;
    }

    try {
    // const legends = this._legends.map(legend => this.legendFormatter(legend));
    // this.allLegends = [].concat(...decorators, ...legends);
    this.cd.detectChanges();
    } catch (err) {
      console.error(`TEMPNOTE: error in legend update, probably bad _legends. ${err}`);
    }
  }

  onSetLegends(e: { legend: Array<Legend>; graph: number }): void {
    if (this.config.graph !== e.graph) {
      return;
    }
    this.autoUpdate = false;
    // this.allLegends = e.legend;
    this.cd.detectChanges();
  }

  async setupAllGenes(): Promise<any> {
    if(this.commonSidePanelModel.genesData == null) {
      let config_alignment:string = '19';
      let gg = await this.wutil.getGenomePositions(config_alignment);
      this.oncoBandsData = gg[0];
      this.commonSidePanelModel.genesData = gg[1];
    }
    return null;
  }



  public notifyGraphsOfVariantChanges(reason:string){
    console.log(`notifyGraphsOfVariantChanges because ${reason}.`);
    OncoData.instance.variantsEdgeArray = null;
    // TODO: check each view, send update.
    ChartScene.instance.views.map( v=> {
      if(v.chart){
        v.chart.notifiedOfVariantChanges(reason);
      }
    });
  }

  constructor(public cd: ChangeDetectorRef, public dataService: DataService,) {
    OncoData.instance.currentCommonSidePanel = this;

    let thisCommonSidePanel:CommonSidePanelComponent = this;
    CommonSidePanelComponent.instance = this;
    this.commonSidePanelModel = new CommonSidePanelModel();
    this.commonSidePanelModel.width = 268; //was 262. full sidebar width is 275.



    CommonSidePanelComponent.setSurvival.subscribe(this.onSetLegends.bind(this));
  }
}
