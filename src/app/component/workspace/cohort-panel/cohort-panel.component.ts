import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  Cohort,
  CohortCondition,
  CohortField
} from './../../../model/cohort.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataService } from './../../../service/data.service';
import {MatProgressBarModule} from '@angular/material'
import { DataTable } from './../../../model/data-field.model';
import { CollectionTypeEnum } from 'app/model/enum.model';
import { DiffexpWidgetComponent } from  '../common-side-panel/diffexp-widget.component';
import { DiffexpResults } from  '../common-side-panel/diffexpResults';
import { OncoData, LoadedTable } from 'app/oncoData';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { AppComponent } from 'app/app.component';

declare var $: any;

@Component({
  selector: 'app-workspace-cohort-panel',
  styleUrls: ['./cohort-panel.component.scss'],
  templateUrl: './cohort-panel.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None
})
export class CohortPanelComponent implements AfterViewInit {
  progressMode = 'determinate';
  progressValue = 0;
  bufferValue = 0;
  dataOptions:Array<DataTable> = [];

  @Input()
  cohorts: Array<Cohort> = [];
  tables: Array<DataTable> = [];

  @Output()
  addCohort: EventEmitter<{
    database: string;
    cohort: Cohort;
  }> = new EventEmitter();
  @Output()
  delCohort: EventEmitter<{
    database: string;
    cohort: Cohort;
  }> = new EventEmitter();
  @Output()
  queryCohort: EventEmitter<{
    database: string;
    cohort: Cohort;
  }> = new EventEmitter();
  @Output()
  hide: EventEmitter<any> = new EventEmitter();

  fields: Array<CohortField>;
  defaultCondition: CohortCondition;
  activeCohort: Cohort;
  cohortA: Cohort; // for A/B comparisons of two cohorts.
  cohortB: Cohort;
  selectedCompareTable: DataTable;

  private _config: GraphConfig;
  get config(): GraphConfig {
    return this._config;
  }

  @Input()
  set config(config: GraphConfig) {
    if (config === null) {
      return;
    }
    this._config = config;
    this.dataService.getQueryBuilderConfig(config.database).then(result => {
      const fields = result.fields;
      this.fields = Object.keys(fields).map(
        key =>
          fields[key].type === 'number'
            ? { key: key, name: fields[key].name, type: fields[key].type }
            : {
                key: key,
                name: fields[key].name,
                type: fields[key].type,
                options: fields[key].options
              }
      );
      const field = this.fields[0];
      this.defaultCondition = {
        field: field,
        pids: [],
        condition: 'where',
        min: null,
        max: null,
        value: field.type === 'category' ? field.options[0] : null
      };
      this.resetForm();
    });
  }

  ngAfterViewInit(): void {
    // Load tables.
    let molecularTableFlag = CollectionTypeEnum.MOLECULAR;
    let self = this;
    this.dataService.getDatasetTables(this._config.database)
    .then(result => {
      console.log('info here');
      let tableArray:Array<DataTable> = result;
      let molecularTables = tableArray.filter(table => table.ctype & molecularTableFlag);
      console.dir(molecularTables.map(mt => mt.tbl));
      self.tables = molecularTables;
      self.cd.detectChanges();
    });


  }

  closeClick() {
    this.hide.emit();
  }

  isValid(): boolean {
    return true;
  }

  saveClick() {
    if (this.activeCohort.n === '') {
      alert('Please specify a cohort name');
      return;
    }
    if (this.cohorts.find(v => v.n === this.activeCohort.n)) {
      alert('Please specify a unique cohort name');
      return;
    }
    this.addCohort.emit({
      cohort: this.activeCohort,
      database: this.config.database
    });
  }

  naiveDiffExpClick() {
    if(this.tables == null || this.tables.length == 0) {
      alert('There are no molecular tables in this data set which can be used here for a comparison of the cohorts.');
      return;
    }

    if (this.cohortA == null || this.cohorts.filter(c => c.n == this.cohortA.n).length == 0) {
      alert('Please choose a first cohort for the comparison.');
    } else {
      if (this.cohortB == null || this.cohorts.filter(c => c.n == this.cohortB.n).length == 0) {
        alert('Please choose a second cohort for the comparison.');
      } else {
        if (this.selectedCompareTable == null) {
          alert('PLease select a table from the "Use Table" list.');
        } else {
          console.log(`Starting naive comparison of "${this.cohortA.n}" and "${this.cohortB.n}, using table ${this.selectedCompareTable.tbl}.".`);
          this.calculateNaiveDiffExp(this._config, this.selectedCompareTable);
        }

        
      }
    }
  }



  showAlertFromDiffexpResults(deResults:DiffexpResults){
    if(deResults.error != null){
    
      alert(deResults.error);
    } else {
      let r = deResults.formatAsTextLines(20);
      prompt("Analysis is complete. Genes with the greatest differences are:", r)
    }
  }

  calculateNaiveDiffExp(config: GraphConfig, table:DataTable)  {
    let myComputationResult = null;

    let tableName = table.tbl;
    let self = this;
    let storedMapData;
    self.progressMode = 'buffer';
    self.progressValue = 0;
    let dataNeedsLoading = WorkspaceComponent.instance.hasLoadedTable(tableName) == false;
    if(dataNeedsLoading==false){
      let loadedTable = WorkspaceComponent.instance.getLoadedTable(tableName);
      myComputationResult = DiffexpWidgetComponent.gutsOfNaiveDiffExp(loadedTable.map, loadedTable.data, self.cohortA, self.cohortB);
      this.showAlertFromDiffexpResults(myComputationResult);
    } else {
      this.dataService.getTable(config.database, tableName+'Map' ).then(mapResult => {
        console.log(`Result of then in calculateNaiveDiffExp.`);
        mapResult.toArray().then(mapData => {
          storedMapData = mapData;
          //console.log(`map data is ${mapData.length} rows.`);
          this.dataService.getTable(config.database, tableName ).then(result => {
            result.toArray().then((expressionData) => {
              let thisLoadedTable:LoadedTable = {
                map: storedMapData,
                data: expressionData
              }
              WorkspaceComponent.instance.setLoadedTable(tableName, thisLoadedTable);

              self.progressMode = 'determinate';
              self.progressValue = 30;
              window.setTimeout(function(){self.cd.detectChanges();}, 50);

              myComputationResult = DiffexpWidgetComponent.gutsOfNaiveDiffExp(storedMapData, expressionData, self.cohortA, self.cohortB);

              self.progressValue = 0;
              self.progressMode = 'determinate';

              self.cd.detectChanges();
              this.showAlertFromDiffexpResults(myComputationResult)
            });
          });
            });
      });
    }
  }



  deleteClick(cohort: Cohort): void {
    this.delCohort.emit({ database: this.config.database, cohort: cohort });
    this.cohortA = null;
    this.cohortB = null;
  }

  resetForm(): void {
    this.activeCohort.n = '';
    this.activeCohort.conditions.push(this.defaultCondition);
    this.cd.detectChanges();
  }

  fieldAnd(item: any): void {
    const newField = Object.assign({}, item);
    newField.condition = 'and';
    this.activeCohort.conditions.push(newField);
    this.cd.detectChanges();
  }

  fieldOr(item: any): void {
    const insIndex = this.activeCohort.conditions.indexOf(item);
    const newField = Object.assign({}, item);
    newField.condition = 'or';
    this.activeCohort.conditions.splice(insIndex + 1, 0, newField);
    this.cd.detectChanges();
  }

  fieldDel(item: any): void {
    const delIndex = this.activeCohort.conditions.indexOf(item);
    this.activeCohort.conditions.splice(delIndex, 1);
    this.cd.detectChanges();
  }

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private dataService: DataService
  ) {
    this.activeCohort = { n: '', pids: [], sids: [], conditions: [] };
    this.cohortA = null;
    this.cohortB = null;
  }
}
