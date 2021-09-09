
import {merge} from 'rxjs/operators';
import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ComponentFactoryResolver, EventEmitter,
  Input, OnDestroy, Output, ViewEncapsulation
} from '@angular/core';
import { MatSelectChange, MatCheckboxChange, MatButtonToggle } from '@angular/material';
import { EdgeConfigModel } from 'app/component/visualization/edges/edges.model';
import { EdgesGraph } from 'app/component/visualization/edges/edges.graph';
import { DataField } from 'app/model/data-field.model';
import { GraphEnum, ConnectionTypeEnum } from 'app/model/enum.model';
import { ModalService } from 'app/service/modal-service';
import { Subject ,  Subscription } from 'rxjs';
import { DataFieldFactory, DataTable } from './../../../model/data-field.model';
import { VariantCheckbox, DataDecorator, DataDecoratorTypeEnum } from './../../../model/data-map.model';
import { WorkspaceLayoutEnum } from './../../../model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { WorkspaceConfigModel } from './../../../model/workspace.model';
import { ChartScene } from '../chart/chart.scene';
import { ThemePalette } from '@angular/material/core';
import { AbstractVisualization } from 'app/component/visualization/visualization.abstract.component';
import { AbstractScatterVisualization } from 'app/component/visualization/visualization.abstract.scatter.component';
import { GenomeGraph } from 'app/component/visualization/genome/genome.graph';
import { OncoData } from 'app/oncoData';

declare var $: any;

@Component({
  selector: 'app-workspace-edge-panel',
  templateUrl: './edge-panel.component.html',
  styleUrls: ['./edge-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EdgePanelComponent implements OnDestroy {

  variantCheckbox: VariantCheckbox = {
    name: 'All Variants',
    completed: false,
    color: 'primary',
    subtasks: [
      {name: 'Mutation', completed: false, color: '#9C27B0'},
      {name: 'Amplification', completed: false, color: '#3F51B5'} ,
      {name: 'Gain', completed: false, color: '#3fa5b5'} ,
      {name: 'Loss', completed: false, color: '#f26602'},
      {name: 'Deletion', completed: false, color: '#ff0000'},
    ]
  };

  // Use these if we are grouping variants into a hierarchy
  allComplete: boolean = false;
  updateAllComplete() {
    this.allComplete = this.variantCheckbox.subtasks != null && this.variantCheckbox.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.variantCheckbox.subtasks == null) {
      return false;
    }
    return this.variantCheckbox.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.variantCheckbox.subtasks == null) {
      return;
    }
    this.variantCheckbox.subtasks.forEach(t => t.completed = completed);
  }


  setVariantCheckbox(e: MatCheckboxChange) {
    let subtask = this.variantCheckbox.subtasks.find(v => v.name == e.source.name);
    if(subtask) {
      subtask.completed = e.checked;
      this.showLinksSelected();

      let genomeGraph = (ChartScene.instance.views[1].chart as GenomeGraph);
      if(genomeGraph){
        genomeGraph.recalcGeneSizesAndRender(this.variantCheckbox);
      }
    }
  }

  addConnections(){
    // If at least one side (markers, samples) has a selection,
    // loop through all checked variant subtasks in this.task,
    // and create connections of that variant.
    console.log('Check in addConnections for selections.');
    if(this.notEnoughSelectedToConnect() == false) {
      console.log('YES, called notEnoughSelectedToConnect');
      this.showLinksSelected();
    }
  }

  private hasShownAlertForSelectingBothSides:boolean = false;
  showLinksSelected(){
    // If at least one side (markers, samples) has a selection,
    // loop through all checked variant subtasks in this.task,
    // and create connections of that variant.
    if(this.notEnoughSelectedToConnect() && this.hasShownAlertForSelectingBothSides==false) {
      alert('Select nodes on both sides, before trying to show links between them.');
      this.hasShownAlertForSelectingBothSides = true;
    } else {
      let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
      if(edgesGraph){
        edgesGraph.hideAllLinks();
        edgesGraph.markLinkVisibilityOfSelected(true, this.variantCheckbox);
      }
    }
  }

  hideLinksSelected(){
    // // If at least one side (markers, samples) has a selection,
    // // delete all links where they exist and are selected.
    // if(this.notEnoughSelectedToConnect()) {
    //   alert('Select nodes, on one or both graphs, before trying to hide links between them.');
    // } else {
    //   let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
    //   if(edgesGraph){
    //     edgesGraph.markLinkVisibilityOfSelected(false, this.variantCheckbox);
    //   }
    // }
  }

  hideLinksUnselected(){
    let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
    if(edgesGraph){
      alert('NYI'); //edgesGraph.hideLinksOfUnselected(this.variantCheckbox);
    }
  }

  hideAllLinks(){
    let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
    if(edgesGraph){
      edgesGraph.hideAllLinks();
    }
  }

  notEnoughSelectedToConnect(){
    // If at least one side (markers, samples) has a selection, return false.
    let notEnoughSelected:boolean = true;
    let leftHasSelection 
    let leftChart = (ChartScene.instance.views[0].chart as AbstractScatterVisualization);
    if(leftChart){
      console.log(`Left selections = ${leftChart.selectionController.highlightIndexes.size}.`);
      notEnoughSelected = leftChart.selectionController.highlightIndexes.size == 0;
    } else {
      let rightChart = (ChartScene.instance.views[1].chart as AbstractScatterVisualization);
      if(rightChart){
        console.log(`Right selections = ${rightChart.selectionController.highlightIndexes.size}.`);
        notEnoughSelected = rightChart.selectionController.highlightIndexes.size == 0;
      }
    }
    console.log('checking notEnoughSelectedToConnect = ' + notEnoughSelected);
    return notEnoughSelected;
  }

  edgeConfig: EdgeConfigModel = new EdgeConfigModel();
  _workspaceConfig: WorkspaceConfigModel;
  _graphAConfig: GraphConfig;
  _graphBConfig: GraphConfig;
  $graphAChange: Subject<GraphConfig> = new Subject();
  $graphBChange: Subject<GraphConfig> = new Subject();
  $graphChange: Subscription;

  showEdgeConnect = true;
  showEdgeColor = true;
  showEdgeGroup = true;

  @Input() set graphAConfig(v: GraphConfig) {
    this._graphAConfig = v;
    this.$graphAChange.next(v);
  }
  @Input() set graphBConfig(v: GraphConfig) {
    this._graphBConfig = v;
    this.$graphBChange.next(v);
  }
  get workspaceConfig(): WorkspaceConfigModel { return this._workspaceConfig; }
  @Input() set workspaceConfig(value: WorkspaceConfigModel) {
    this._workspaceConfig = value;
  }
  @Input() tables: Array<DataTable>;
  @Input() fields: Array<DataField>;
  @Output() workspaceConfigChange: EventEmitter<{ config: WorkspaceConfigModel }> = new EventEmitter();
  @Output() edgeConfigChange: EventEmitter<EdgeConfigModel> = new EventEmitter();
  @Output() decoratorAdd: EventEmitter<{ config: GraphConfig, decorator: DataDecorator }> = new EventEmitter();
  @Output() decoratorDel: EventEmitter<{ config: GraphConfig, decorator: DataDecorator }> = new EventEmitter();

  layoutSelected: string;
  edgeSelected: DataField;
  colorSelected: DataField;
  groupSelected: DataField;
  layoutOptions: Array<string>;
  edgeOptions: Array<DataField>;
  colorOptions: Array<DataField>;
  groupOptions: Array<DataField>;

  @Input() decorators: Array<DataDecorator>;

  // edgePanelSetConfig(value: GraphConfig): void {
  //   const ecm: EdgeConfigModel = (value as EdgeConfigModel);
  //   ecm.database = this.graphAConfig.database;
  //   ecm.entityA = this.graphAConfig.entity;
  //   ecm.entityB = this.graphBConfig.entity;
  //   value.visualization = VisualizationEnum.EDGES;
  //   // this.configChange.emit(value);
  // }

  layoutOptionChange(e: MatSelectChange): void {
    ChartScene.instance.invalidatePrerender();

  }

  edgeOptionChange(e: MatSelectChange): void {
    ChartScene.instance.invalidatePrerender();
    console.log(`MJ edgeOptionChange`);
    console.log(`MJ e.value = [${JSON.stringify(e.value)}]`);
    const optionLabel = e.value;
    const option = this.edgeOptions.find(v => v.label === optionLabel);
    this.edgeConfig.field = option;
    this.edgeConfig.markerFilterA = this._graphAConfig.markerFilter;
    this.edgeConfig.sampleFitlerA = this._graphAConfig.sampleFilter;
    this.edgeConfig.patientFilterA = this._graphAConfig.patientFilter;
    this.edgeConfig.markerFilterB = this._graphBConfig.markerFilter;
    this.edgeConfig.sampleFitlerB = this._graphBConfig.sampleFilter;
    this.edgeConfig.patientFilterB = this._graphBConfig.patientFilter;
    this.groupOptions = this.colorOptions = DataFieldFactory.getConnectionColorFields(
      this.fields,
      this.tables,
      this._graphAConfig.entity,
      this._graphBConfig.entity);
    this.cd.detectChanges();
    this.edgeConfigChange.emit(this.edgeConfig);
  }

  colorOptionChange(e: MatSelectChange): void {
    ChartScene.instance.invalidatePrerender();
    const colorLabel = e.value;
    const field = this.colorOptions.find(v => v.label === colorLabel);
    if (field.key === 'None') {
      this.decoratorDel.emit({
        config: this.edgeConfig,
        decorator: { type: DataDecoratorTypeEnum.COLOR, values: null, field: null, legend: null }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.edgeConfig,
        decorator: { type: DataDecoratorTypeEnum.COLOR, field: field, legend: null, values: null }
      });
    }
  }

  groupOptionChange(e: MatSelectChange): void {
    ChartScene.instance.invalidatePrerender();
    const colorLabel = e.value;
    const field = this.colorOptions.find(v => v.label === colorLabel);
    if (field.key === 'None') {
      this.decoratorDel.emit({
        config: this.edgeConfig,
        decorator: { type: DataDecoratorTypeEnum.GROUP, values: null, field: null, legend: null }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.edgeConfig,
        decorator: { type: DataDecoratorTypeEnum.GROUP, field: field, legend: null, values: null }
      });
    }
  }

  graphConfigChange(graphConfig: GraphConfig): void {
    ChartScene.instance.invalidatePrerender();
    let graphToUse:number = 1;
    try {
      graphToUse = graphConfig.graph;
      // console.log('TEMPNOTE: graphToUse is okay.');
    } catch (err) {
      console.error('TEMPNOTE: GraphEnum is null. Bad values for GRAPH_A and _B. Returning nothing.');
      //return;
    }

    // MJ copied this here from edgeOptionChange.
    console.log('==== get colorOptions');
    if(this._graphAConfig && this._graphBConfig ){
    this.groupOptions = this.colorOptions = DataFieldFactory.getConnectionColorFields(
      OncoData.instance.dataLoadedAction.fields, // this.fields,
      OncoData.instance.dataLoadedAction.tables, // this.tables,
      this._graphAConfig.entity,
      this._graphBConfig.entity);
    }

    if (graphToUse === GraphEnum.GRAPH_A) {
      this.edgeConfig.markerFilterA = this._graphAConfig.markerFilter;
      this.edgeConfig.sampleFitlerA = this._graphAConfig.sampleFilter;
      this.edgeConfig.patientFilterA = this._graphAConfig.patientFilter;
      if (this.edgeConfig.entityA !== graphConfig.entity) {
        this.edgeConfig.entityA = graphConfig.entity;
        this.edgeOptions = DataFieldFactory.getConnectionDataFields(this.fields, this.tables,
          this.edgeConfig.entityA, this.edgeConfig.entityB);
        // dispatch hide edges config
        this.edgeConfig.field = DataFieldFactory.defaultDataField;
        this.edgeConfigChange.emit(this.edgeConfig);
      }
    }
    if (graphToUse === GraphEnum.GRAPH_B) {
      this.edgeConfig.markerFilterB = this._graphBConfig.markerFilter;
      this.edgeConfig.sampleFitlerB = this._graphBConfig.sampleFilter;
      this.edgeConfig.patientFilterB = this._graphBConfig.patientFilter;
      if (this.edgeConfig.entityB !== graphConfig.entity) {
        this.edgeConfig.entityB = graphConfig.entity;
        this.edgeOptions = DataFieldFactory.getConnectionDataFields(this.fields, this.tables,
          this.edgeConfig.entityA, this.edgeConfig.entityB);
        // dispatch hide edges config
        this.edgeConfig.field = DataFieldFactory.defaultDataField;
        this.edgeConfigChange.emit(this.edgeConfig);
      }
    }
    // console.log('TEMPNOTE: end of graphToUse usage.');

    const connectionType = ConnectionTypeEnum.createFromEntities(this.edgeConfig.entityA, this.edgeConfig.entityB);

    switch (connectionType) {
      case ConnectionTypeEnum.GENES_GENES:
        this.showEdgeConnect = true;
        this.showEdgeColor = false;
        this.showEdgeGroup = false;
        break;
      case ConnectionTypeEnum.GENES_PATIENTS:
        this.showEdgeConnect = true;
        this.showEdgeColor = true;
        this.showEdgeGroup = true;
        break;
      case ConnectionTypeEnum.GENES_SAMPLES:
        this.showEdgeConnect = true;
        this.showEdgeColor = true;
        this.showEdgeGroup = true;
        break;
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
        this.showEdgeConnect = true;
        this.showEdgeColor = true;
        this.showEdgeGroup = true;
        break;
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        this.showEdgeConnect = true;
        this.showEdgeColor = true;
        this.showEdgeGroup = true;
        break;
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        this.showEdgeConnect = true;
        this.showEdgeColor = true;
        this.showEdgeGroup = true;
        break;
      default:
        this.showEdgeConnect = false;
        this.showEdgeColor = false;
        this.showEdgeGroup = false;
        break;
    }

    this.layoutSelected = this.layoutOptionChange[0];
    this.edgeSelected = this.edgeOptions[0];
    this.colorSelected = this.colorOptions[0];
    this.groupSelected = this.groupOptions[0];
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.$graphChange.unsubscribe();
  }

  constructor(public ms: ModalService, private cd: ChangeDetectorRef) {
    this.layoutOptions = [
      WorkspaceLayoutEnum.HORIZONTAL, WorkspaceLayoutEnum.VERTICAL, WorkspaceLayoutEnum.OVERLAY
    ];
    this.colorOptions = [
      DataFieldFactory.defaultDataField
    ];
    this.groupOptions = [
      DataFieldFactory.defaultDataField
    ];

    this.$graphChange = this.$graphAChange.pipe(merge(
      this.$graphBChange)).subscribe(this.graphConfigChange.bind(this));

    OncoData.instance.edgeMainVariantCheckbox = this.variantCheckbox;
  }
}
