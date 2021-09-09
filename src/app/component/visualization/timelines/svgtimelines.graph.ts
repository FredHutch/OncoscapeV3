import { TimelinesConfigModel, TimelinesDataModel } from 'app/component/visualization/timelines/timelines.model';
import { TemplateRef} from '@angular/core';

import { ChartFactory } from 'app/component/workspace/chart/chart.factory';
import { GraphConfig } from 'app/model/graph-config.model';
import { ScaleLinear } from 'd3';
import { scaleLinear } from 'd3-scale';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { OncoData } from 'app/oncoData';
import { AppComponent } from '../../../../app/app.component';
import { ILabel, LabelController, LabelOptions } from '../../../controller/label/label.controller';

import { VisualizationView } from '../../../model/chart-view.model';
import { ChartObjectInterface } from '../../../model/chart.object.interface';
import { DataDecorator } from '../../../model/data-map.model';
import { EntityTypeEnum } from '../../../model/enum.model';
import { ChartEvent, ChartEvents } from '../../workspace/chart/chart.events';
import { AbstractVisualization } from '../visualization.abstract.component';
import { TimelinesStyle } from './timelines.model';
import { GlobalGuiControls } from 'app/globalGuiControls';
import { TooltipController, ComplexTooltipData } from '../../../controller/tooltip/tooltip.controller';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { Id } from 'aws-sdk/clients/servicecatalog';
import define from "./new_timeline/index.js";
import {Runtime, Library, Inspector} from "./new_timeline/runtime.js";
import { TimelineSelectionController } from 'app/controller/selection/timeline.selection.controller';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { CommonSidePanelComponent } from 'app/component/workspace/common-side-panel/common-side-panel.component';

export class axisDataForGrouping {
  public groupingName: string;
  public minY: number = 0;
  public maxY: number = 0;
  public numPatients: number = 0;
  public patients:Array<any>
}

export class SvgTimelinesGraph extends AbstractVisualization {

  public set data(data: TimelinesDataModel) {
    this._data = data;
  }
  public get data(): TimelinesDataModel {
    return this._data as TimelinesDataModel;
  }
  public set config(config: TimelinesConfigModel) {
    this._config = config;
  }
  public get config(): TimelinesConfigModel {
    return this._config as TimelinesConfigModel;
  }

  public patients: Array<THREE.Group>;
  public attrs: THREE.Group;
  public lines: THREE.LineSegments;
  public objs: Array<THREE.Object3D>;
  public meshes: Array<THREE.Object3D>;
  public decorators: DataDecorator[];
  public clipPlanes: Array<THREE.Object3D> = [];
  public database: string;
  public yAxis: Array<ILabel>;
  public xAxis: Array<ILabel>;
  public grid: THREE.LineSegments;
  public bgTime: HTMLElement;
  public bgPatient: HTMLElement;
  public labelYAxis: LabelOptions;
  public labelXAxis: LabelOptions;

  public timelineSvgDiv: HTMLElement;
  public d3SVGElement : d3.Selection<SVGElement, {}, HTMLElement, any>;

  public observableRuntimeModule:any;

  private axisDataForGroups:Array<axisDataForGrouping> = [];

  public recreate() {
    this.removeObjects();
    this.addObjects(this.config.entity);
  }

  private runtime:Runtime = null;
  private leftPanelOffset = 292;

  // mark true once we've seen this once.
  private sawFirstRowSelectionChangedCounter:boolean = false;

  public selectionController: TimelineSelectionController;
  private selectSubscription: Subscription;
  // Create - Initialize Mesh Arrays
  create(entity: EntityTypeEnum, html: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, html, events, view);
    let self = this;

    this.selectionController = new TimelineSelectionController(this.entity, view, events);
    this.selectionController.enable = true;
    console.log("created TimelineSelectionController");

    this.selectSubscription = this.selectionController.onSelect.subscribe((data) => {
      let ids: Array<number> = data.ids; // ids are 3 times bigger than real index. We'll divide by 3.
      let source: any = data.source; // we EXPECT this isalways "Selection", not "Cohort".
      // const values: Array<DataDecoratorValue> = ids
      //   .map(v => v / 3)
      //   .map(v => {
      //     return {
      //       pid: this._data.pid[v],
      //       sid: this._data.sid[v],
      //       mid: null,
      //       key: EntityTypeEnum.SAMPLE,
      //       value: true,
      //       label: ''
      //     };
      //   });
      // const dataDecorator: DataDecorator = {
      //   type: DataDecoratorTypeEnum.SELECT,
      //   values: values,
      //   field: null,
      //   legend: null,
      //   pidsByLabel: null
      // };
      // WorkspaceComponent.addDecorator(this._config, dataDecorator);
      // this._lastSelectionPatientIds = ids.map(v => self._data.pid[v/3]);

      // this.recalculateLegendTotals();

      // window.setTimeout(() => self.signalCommonSidePanel(this._lastSelectionPatientIds, source, EntityTypeEnum.SAMPLE), 50);

    });

    //let leftPanelOffset = document.getElementsByClassName('graphPanel')[0].getBoundingClientRect().width;
    console.warn("GUESS for leftPanelOffset=" + this.leftPanelOffset);



    this.setupRuntime();




    return this;
  }

  private setupRuntime() {
    let self = this;

    
    if(this.runtime) {
      this.runtime.dispose();
    }

    // First remove any existing timeline
    var timelines = document.getElementsByClassName('timeline-svg-div');
    while(timelines[0]) {
      timelines[0].parentNode.removeChild(timelines[0]);
    }​

    self.timelineSvgDiv = <HTMLDivElement>document.createElement('div');
    self.timelineSvgDiv.className = 'timeline-svg-div'; // NYI

    let wrapperTableHtml =`
    <table border="0"><tr>
    <tr><td id="oncoSortTools"></td></tr>
    <tr><td id="oncoSvgTable"></td></tr>

    <tr></td><td><div style="display:none;" id="onco3"></div></td></tr>
    <tr><td >

    <div>
      <div style="float:left" >&nbsp;Zoom:&nbsp;</div>
      <div style="float:left" id="divStretcher"></div>
      <div style="float:left"  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Track Height:&nbsp;</div>
      <div style="float:left" id="divTrackHeight"></div>
      <div style="float:left"  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Log:&nbsp;</div>
      <div style="float:left" id="divUseLogScale"></div>
    </div>
    </td></tr>
 
    <tr><td><div id="oncoMore" style="max-height:32px; overflow-y:auto"></div></td></tr>
    </table>`;
    self.timelineSvgDiv.innerHTML = wrapperTableHtml;
    self.html.appendChild(self.timelineSvgDiv);

    this.runtime = new Runtime(Object.assign(new Library, {width: 640}));

    self.observableRuntimeModule = this.runtime.module(define, name => {
      console.log('log ' +name)
      if(name == "svgTable" || name == "viewof svgTable") {
        return Inspector.into("#oncoSvgTable")();
      }
      if(name == "viewof sortTools") {   // name == "tooltip" || 
      return Inspector.into("#oncoSortTools")();
      }
    
      if(name == "viewof dynamicTrackHeight") {
      return Inspector.into("#divTrackHeight")();
      }
      if(name == "viewof stretcher") {
        return Inspector.into("#divStretcher")();
        }
      if(name == "viewof use_logscale") {
        return Inspector.into("#divUseLogScale")();
      }
          
      if(name=="rowSelectionChangedCounter"){
        console.log('adding handlerfor rowSelectionChangedCounter ')
        return {fulfilled(value) { 
          if(self.sawFirstRowSelectionChangedCounter){
            self.handleManualSelectionChange();
          } else {
            self.sawFirstRowSelectionChangedCounter = true;
          }
        }};
      }      

      if(name=="currentEventMousedOver"){
        console.log('adding handlerfor currentEventMousedOver ')
        return {fulfilled(value) { self.showOrHideTooltip(value); }};
      }

      if(name== "somethingYouMustSeeForDebugging") { // (name == "eventTypes" ||   name == "theAttrs") {
        return Inspector.into("#oncoMore")();
      }
    
      return Inspector.into("#onco3")();
    });

    this.observableRuntimeModule.redefine("dataLoadedAction", function(){
      return OncoData.instance.dataLoadedAction;
    });
    // vb3 holds height of main timeline area
    let desiredMainSvgHeight = Math.max(100, window.innerHeight - 290);
    let desiredMainSvgWidth = Math.max(100, window.innerWidth - (this.leftPanelOffset + 160));
    console.log();
    this.observableRuntimeModule.redefine("vb3", desiredMainSvgHeight);
    this.observableRuntimeModule.redefine("rightSideWidth", desiredMainSvgWidth );

    this.observableRuntimeModule.redefine("onOncoscapeEventClicked", function(){return(
      self.handleOncoscapeEventClicked
    )});
    this.observableRuntimeModule.redefine("onOncoscapeRowSelectionChanged", function(){return(
      self.handleOncoscapeRowSelectionChanged
    )});
    this.observableRuntimeModule.redefine("onOncoscapeIdGroupClicked", function(){return(
      self.handleOncoscapeIdGroupClicked
    )});
    this.observableRuntimeModule.redefine("onOncoscapeCreateCohortFromTimelineSelection", function(){return(
      self.handleOncoscapeCreateCohortFromTimelineSelection
    )});

    //
  }

  private handleOncoscapeEventClicked(event){
    console.log('ONCOSCAPE, handleOncoscapeEventClicked for...');
    console.log(event.detail.pid);
    console.dir(event.detail.report);

    let title= 'Event ' + event.detail.pid;
    let guts= event.detail.report;

    AppComponent.myApp.showContentDialog(title, guts);
      
  }

  private handleOncoscapeCreateCohortFromTimelineSelection (event){
    console.log('ONCOSCAPE, onOncoscapeCreateCohortFromTimelineSelection for...');
    console.log(event.detail);
    CommonSidePanelComponent.instance.createCohortFromPids(event.detail.ids);
  }
  
  private handleOncoscapeRowSelectionChanged (event){
    console.log('ONCOSCAPE, onOncoscapeRowSelectionChanged for...');
    console.log(event.detail);
  }

  private handleOncoscapeIdGroupClicked (event){
    console.log('ONCOSCAPE, onOncoscapeIdGroupClicked for...');
    //console.warn(event.detail.pid);
    console.log(event.detail.pid);
  }

  // in order to SET row selection, 
  // must redefine "arrayIdsToSelect"".
  // Give array of  IDs, or __all_true or __all_false;

  public externallySelectArrayOfIDs(ids:string[]){
    this.observableRuntimeModule.redefine("arrayIdsToSelect", ids );
  }

  public externallyDeselectAllRows(){
    this.observableRuntimeModule.redefine("arrayIdsToSelect", ["__all_false"] );
  }

  currentSelectionLinkedToCounter(){
    // let rr = mutable rowSelectionChangedCounter;
    let selection = [];
    d3.selectAll(".timeline-svg-id-rect.timeline-svg-id-rect-selected")
      .each(function(d)  {
        selection.push(d["id"]);
      });
    selection.sort();
    return selection;
  }

  handleManualSelectionChange(){
    let self = this;
    if(this.observableRuntimeModule){
      console.log('FIND currentSelectionLinkedToCounter');
      let selectedPids = this.currentSelectionLinkedToCounter();

      console.dir(selectedPids);
      window.setTimeout(() => self.signalCommonSidePanel(selectedPids, 'Selection', EntityTypeEnum.PATIENT), 50);
    } else {
      console.log('module not ready for currentSelectionLinkedToCounter');      
    }
  }

  public signalCommonSidePanel(patientIdsForCommonSurvival, selectionSource, entityType:EntityTypeEnum) {
    if (OncoData.instance.currentCommonSidePanel){
      OncoData.instance.currentCommonSidePanel.setSelectionPatientIds(patientIdsForCommonSurvival, 
        selectionSource == "Cohort" ? "Cohort" : 
        (selectionSource == "Legend" ? "Legend" : null), null);
        OncoData.instance.currentCommonSidePanel.drawWidgets();
    }
  }

  showOrHideTooltip(currentEventMousedOver){

    if(currentEventMousedOver) {
      //  contains:
      // timelineEvent:thisEvent,
      // mouseEvent: the mouse move event
      let event = currentEventMousedOver.timelineEvent;
      let mouseMoveEvent = currentEventMousedOver.mouseEvent;

      this.tooltip= this.complexTooltipFromEvent(event);
      this.tooltipColor = event.color;
      let yFudge = 20; // Don't know why tooltip is around 30px too low, so fudge factor.

      this.tooltips.innerHTML = TooltipController.generateHtml(
        this.view,
        this.entity,
        {
          position: new Vector3(mouseMoveEvent.x+15, mouseMoveEvent.y-yFudge, 0), //x + 15, e.event.clientY - 20, 0),
          userData: { tooltip: this.tooltip, color: this.tooltipColor }
        },
        this.tooltipOptions
      );
      console.log('tooltip should appear.');
    } else {
      //hide
      this.onHideTooltip();
    }
  }

  destroy() {
    super.destroy();
    this.removeObjects();
  }

  enable(truthy: boolean) {
    if (this.isEnabled === truthy) {
      return;
    }

    this.isEnabled = truthy;
    //this.labelController.enable = this.isEnabled;
    this.tooltipController.enable = this.isEnabled;
    this.view.controls.enabled = false; // No 3D
    
    if (truthy) {
      this.$MouseMove = this.events.chartMouseMove.subscribe(this.onMouseMove.bind(this));
      this.$MouseDown = this.events.chartMouseDown.subscribe(this.onMouseDown.bind(this));
      this.$MouseUp = this.events.chartMouseUp.subscribe(this.onMouseUp.bind(this));
      this.$KeyPress = this.events.chartKeyPress.subscribe(this.onKeyPress.bind(this));
      this.$KeyDown = this.events.chartKeyDown.subscribe(this.onKeyDown.bind(this));
      this.$KeyUp = this.events.chartKeyUp.subscribe(this.onKeyUp.bind(this));
    } else {
      this.$MouseMove.unsubscribe();
      this.$MouseDown.unsubscribe();
      this.$MouseUp.unsubscribe();
      this.$KeyPress.unsubscribe();
      this.$KeyDown.unsubscribe();
      this.$KeyUp.unsubscribe();
      this.labels.innerHTML = '';
      this.tooltips.innerHTML = '';
    }
    
  }

  public onMouseDown(e: ChartEvent): void {
    console.log('TIMELINE mouse down')
  }

  public onMouseUp(e: ChartEvent): void {
    console.log('TIMELINE mouse up')
  }

  public onMouseMouse(e: ChartEvent): void {
    console.log('TIMELINE mouse move')
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    super.updateDecorator(config, decorators);
    /*
    ChartFactory.decorateDataGroups(this.objs, this.decorators);
    this.tooltipController.targets = this.objs;
    */
  }

  updateObservableBitsIfReady(config: GraphConfig, data: any){
    let self = this;
    let ready =  OncoData.instance.currentCommonSidePanel && OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData;

    if(ready){ 

      self.observableRuntimeModule.redefine("dataLoadedAction", function(){
        return OncoData.instance.dataLoadedAction;
      });

      self.observableRuntimeModule.redefine("tlConfig", self.config);
      self.observableRuntimeModule.redefine("rawPatientsFromJson", OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData);
      self.observableRuntimeModule.redefine("loadedRawData", data.result);

      self.observableRuntimeModule.redefine("eventTypes",
        OncoData.instance.dataLoadedAction.events.map(v => `${v.type}:${v.subtype}`).sort()
      );
      console.log("== updateObservableBitsIfReady done.");
    } else {
      window.setTimeout(() => {
        self.updateObservableBitsIfReady(config, data);
      }, 250);

    } 
  }

  updateData(config: GraphConfig, data: any) {
    super.updateData(config, data);
    this.setupRuntime();

    // Update patients, events, and config.
    if(this.observableRuntimeModule) {
      if(config) {
        this.updateObservableBitsIfReady(config, data);
      } else {
        console.log('== config not ready');
      }

    } else{
      console.warn("==  obsv Module not ready for data==");
    }
    window['computedFeedbackForForm'][config.graph.toString()+'_128'] = data.computedFeedbackForForm;
    config['firmColors'] = data.computedFeedbackForForm.firmColors;
    this.removeObjects();
    this.addObjects(this.config.entity);
    this.view.controls.enabled = false; // Get rid of 3D behavior
    console.log('TBD: get rid of view altogether for svg timeline');
  }

  removeObjects(): void {
    // DO NOT CALL THIS. NEED TO MOVE SVG CODE INTO CreateObjects FIRST.
    /*
    if(this.runtime){
      console.log("== Remove objects in timeline.");
      this.runtime.dispose();
      this.runtime = null;
      this.observableRuntimeModule = null;
    }
    */
  }

  addObjects(entity: EntityTypeEnum): void {
    console.log('addObjects TBD!');
  }

  complexTooltipFromEvent(event: any): ComplexTooltipData {
    const data = event.data;
    let keysForReduce: Array<string> = Object.keys(data);
    keysForReduce.unshift('');
    let shmooltip =
      '<div>' +
      keysForReduce.reduce((p, c, idx, srcArray) => {
        if (p == 'event_type'||p=='event_date (stop_date)'||p=='event_date_diff'||p=='rel_date (start_date)') {
          return '';
        }
        if (c !== 'type') {
          if (data[c].toString().trim().length > 0) {
            if (c === 'id') {
              let evtIndex = ', event#' + event.i; // wasevent.originalIndex
              p += `<nobr>${c}: ${data[c].toString().toLowerCase()}${evtIndex}</nobr><br />`;
            } else {
              p += `<nobr>${c}: ${data[c].toString().toLowerCase()}</nobr><br />`;
            }
          }
        }
        return p;
      });
    ;
    if (event.end == null || event.start == event.end) {
      shmooltip += `<hr><nobr>start/end: ${event.start}</nobr><br />` ;
    } else {
      shmooltip += `<hr><nobr>start: ${event.start} end: ${event.end}</nobr><br />` ;
    }
    //shmooltip += `patient row: ${event.barLayoutRowNumber}<br />` ;

    // Put patient vitals here.... tooltip += `<hr><nobr>start: ${event.originalStart} end: ${event.originalEnd}</nobr><br />` ;
    shmooltip += '</div>';

    let complexTooltip = new ComplexTooltipData(
      EntityTypeEnum.EVENT,
      event.originalIndex,
      EntityTypeEnum.PATIENT,
      event.p,
      event,
      shmooltip
    );
    complexTooltip.id= event.i; /// MJ: Should change from index per patient to unique event id.
    return (complexTooltip);
  }

  formatAttrTooltip(attr: any, pidIndex:number, pid:number): string {
    return `Patient:&nbsp;${pid}<br />` +
      attr.prop + ':&nbsp;' + attr.values[pidIndex].label;
  }

  hiddenOffsetY = 3;

  onShowLabels(): void {
  }


}
