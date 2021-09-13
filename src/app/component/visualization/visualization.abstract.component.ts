import { SelectionToolConfig } from './../../model/selection-config.model';
import { ChartSelection } from './../../model/chart-selection.model';
import * as THREE from 'three';
import { EventEmitter } from '@angular/core';
import { EntityTypeEnum, GraphEnum } from 'app/model/enum.model';
import { GraphData } from 'app/model/graph-data.model';
import { Subscription } from 'rxjs';
import { Vector3, Camera } from 'three';
import { TooltipController, ComplexTooltipData } from '../../controller/tooltip/tooltip.controller';
import { LabelController } from './../../controller/label/label.controller';
import { TooltipOptions } from './../../controller/tooltip/tooltip.controller';
import { VisualizationView } from './../../model/chart-view.model';
import { ChartObjectInterface } from './../../model/chart.object.interface';
import { DataDecorator, DataDecoratorTypeEnum } from './../../model/data-map.model';
import { WorkspaceLayoutEnum } from './../../model/enum.model';
import { GraphConfig } from './../../model/graph-config.model';
import { ChartEvent, ChartEvents } from './../workspace/chart/chart.events';
import { EdgeConfigModel } from './edges/edges.model';
import { OncoData } from 'app/oncoData';
import { AbstractScatterVisualization } from './visualization.abstract.scatter.component';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { TooltipOverride } from 'app/model/dataset-table-info.model';

declare var $: any;
export class AbstractVisualization implements ChartObjectInterface {
  // Common Objects
  public canRegenLinks: boolean = false;
  public _data: GraphData;
  public _config: GraphConfig;
  // public selectionToolConfig: SelectionToolConfig;
  public decorators: Array<DataDecorator>;
  public $MouseMove: Subscription;
  public $MouseDown: Subscription;
  public $MouseUp: Subscription;
  public $KeyPress: Subscription;
  public $KeyDown: Subscription;
  public $KeyUp: Subscription;
  public $onShowLabels: Subscription;
  public $onHideLabels: Subscription;
  public $onShowTooltip: Subscription;
  public $onHideTooltip: Subscription;
  public html: HTMLElement;
  public tooltips: HTMLElement;
  public tooltip: string | ComplexTooltipData;
  public tooltipColor: string;
  public labels: HTMLElement;
  public events: ChartEvents;
  public view: VisualizationView;
  public isEnabled: boolean;
  public isVisible: boolean;
  public meshes: THREE.Object3D[];
  public entity: EntityTypeEnum;
  protected labelController: LabelController;
  protected tooltipOptions: TooltipOptions;
  protected tooltipController: TooltipController;

  public 
  // Emitters
  public onRequestRender: EventEmitter<GraphEnum> = new EventEmitter();
  public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{
    type: GraphConfig;
  }>();
  public onSelect: EventEmitter<ChartSelection> = new EventEmitter<ChartSelection>();

  public adjustGraphDetailsBasedOnZoomChange(oldZoom:number, newZoom:number, addHistory:boolean) {
    // For example, GenomeGraph keeps the gene circles the same size as we zoom in/out.
    
  }

  public static rgbIntToHex = function (rgb) { 
    var hex = '000000' + Number(rgb).toString(16);
    return '#' + hex.substr(-6);
  };

  public tooltipSnippetFromColorDecorator(id:any, tooltipOverride:TooltipOverride):string {
    if(this.decorators) {
      let colorDecorator = this.decorators.find(v => v.type == DataDecoratorTypeEnum.COLOR);
      if(colorDecorator){
          if(id){
              let pid = null;
              let match = colorDecorator.values.find(v=> {
                  if (this.entity == EntityTypeEnum.SAMPLE){
                    pid = v.pid;  
                    return v.sid == id;
                  }
                  if (this.entity == EntityTypeEnum.PATIENT){
                    pid = v.pid;  
                    return v.pid == id;
                  }
                  if (this.entity == EntityTypeEnum.GENE){
                    pid = v.pid;  
                    return v.mid == id;
                  }
                  return false
              });
              if(match) {
                  // Use colorDecoratorlegend to look up color,
                  // and thus label.
                  /*
                  labels: (3) ["dead", "alive", "not reported"]
                  values: (4) ["#3949ab", "#ffb300", "#f44336", "#dddddd"]
                  */
                  let color:string = "#aabbcc";
                  let colorString:string = match.value.toString();
                  if(colorString.startsWith("#")==false){
                      // Convert from int to #hex
                      color = AbstractVisualization.rgbIntToHex(match.value);
                  } else {
                      color = colorString;
                  }
                  let idx = colorDecorator.legend.values.indexOf(color);
                  if(idx > -1) {
                    // Turn "sample vital status" into "vital status"
                    let name = colorDecorator.legend.name.split(' ').slice(1,1000).join(' ');

                    // If the field name is in an override, use the fancy "title" from the override as the displayed name.
                    if(tooltipOverride && (this.entity == tooltipOverride.entity)){
                      let tooltipField = tooltipOverride.fields.find(f => f.name == name);
                      if(tooltipField) {
                        name = tooltipField.title;
                      }
                      
                    }

                    let label = colorDecorator.legend.labels[idx];
                    let pd = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData;
                    let patientKeyValue = pd.find(p => p.p == pid);
                    label = patientKeyValue ? patientKeyValue[colorDecorator.field.key] : label;
                    return `<table border="0"><tr><td width="5" bgcolor="${color}">&nbsp;</td><td><b>${name}:</b> ${label}</td></tr></table>`;
                  } else {
                    return ' ERROR_TSFCD '
                  }

              }
          }
      }
      return "";
    }
  }


  public tooltipColorFromDecorator(id:any, originalColor:any){
    let color = originalColor;
    if(this.decorators) {
      let colorDecorator = this.decorators.find(v => v.type == DataDecoratorTypeEnum.COLOR);
      if(colorDecorator){
          if(id){
              let match = colorDecorator.values.find(v=> {
                  if (this.entity == EntityTypeEnum.SAMPLE){
                      return v.sid == id;
                  }
                  if (this.entity == EntityTypeEnum.PATIENT){
                      return v.pid == id;
                  }
                  if (this.entity == EntityTypeEnum.GENE){
                      return v.mid == id;
                  }
                  return false
              });
              if(match) {
                  let colorString:string = match.value.toString();
                  if(colorString.startsWith("#")){
                      // Convert from //#
                      color = parseInt(colorString.substring(1), 16)
                  } else {
                      color = match.value;
                  }
              }
          }
      }
      return color;
    }
  }


  public getTargets(): {
    point: Vector3;
    id: string;
    idType: EntityTypeEnum;
  }[] {
    return null;
  }

  public getTargetsFromMeshes(
    entityType: EntityTypeEnum
  ): Array<{ point: THREE.Vector3; id: string; idType: EntityTypeEnum }> {
    return this.meshes.map(mesh => {
      return { point: mesh.position, id: mesh.userData.id, idType: entityType };
    });
  }

  public notifyEdgeGraphOfSelectionChange(weKnowNothingIsInSelection:boolean) {
    console.warn('NYI: notifyEdgeGraphOfSelectionChange from base viz class. ' + this._config.graph );    
  }

  public regenLinks(){
    
  }

  public notifiedOfVariantChanges(reason:string){
    console.log(`In genome, notifiedOfVariantChanges because ${reason}.`);
  }

  // Allows GenomeGraph to return list of variants that should be edges.
  // This is consumed by edges.graph.
  public filterGenesForEdges(
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum,
    key: string
  ){
    return [];
  }

  enable(truthy: boolean) {
    if (this.isEnabled === truthy) {
      return;
    }

    this.isEnabled = truthy;
    this.labelController.enable = this.isEnabled;
    this.tooltipController.enable = this.isEnabled;
    this.view.controls.enabled = this.isEnabled;
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

  updatedEdgeConfig(edgeConfig: EdgeConfigModel) {
    // Subclasses which filter by edge connection, etc., 
    // need to know update changes there. For example,
    // GenomeGraph will display gene sizes based on the number of
    // variants matching the edge connections setting.
    // But most subclasses will leave this empty.
    console.log('TEMPNOTE: updatedEdgeConfig in abstract vis.');
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    this.decorators = decorators;
  }
  updateData(config: GraphConfig, data: any) {
    this._config = config as GraphConfig;
    this._data = data;
  }
  // updateSelectionTool(selectionToolConfig: SelectionToolConfig): void {
  //   this.selectionToolConfig = selectionToolConfig;
  // }

  public createdOrbitControlsChangeFunction;

  create(entity:EntityTypeEnum, html: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    if(window['computedFeedbackForForm'] == null) {
      window['computedFeedbackForForm'] = {};
      // MJ TBD find better place to put this.
    }
    this.entity = entity;
    this.html = html;
    this.html.innerText = '';
    this.events = events;
    this.view = view;
    this.isEnabled = false;
    this.meshes = [];
    this.decorators = [];

    this.labels = <HTMLDivElement>document.createElement('div');
    this.labels.className = 'graph-overlay';
    this.html.appendChild(this.labels);

    this.tooltipOptions = new TooltipOptions();
    this.tooltip = '';
    this.tooltips = <HTMLDivElement>document.createElement('div');
    this.tooltips.id = 'visTooltipsDiv' + view.config.graph; // visTooltipsDiv1 or visTooltipsDiv2
    this.tooltips.className = 'xtooltiptext' ; // 'graph-tooltip';
    this.html.appendChild(this.tooltips);

    view.camera.position.set(0, 0, 1000);
    view.camera.lookAt(new Vector3(0, 0, 0));
    view.scene.add(view.camera);

    this.labelController = new LabelController(view, events);
    this.tooltipController = new TooltipController(view, events, this, this.tooltips as HTMLDivElement);

    let self = this;

    this.$onShowLabels = this.labelController.onShow.subscribe(this.onShowLabels.bind(this));
    this.$onHideLabels = this.labelController.onHide.subscribe(this.onHideLabels.bind(this));
    this.$onShowTooltip = this.tooltipController.onShow.subscribe(this.onShowTooltip.bind(this));
    this.$onHideTooltip = this.tooltipController.onHide.subscribe(this.onHideTooltip.bind(this));

    let f =  (evt) => {
      self.onOrbitControlsChange(self, self.view, evt)
    };
    self.view.controls.addEventListener('change', f);
    self.createdOrbitControlsChangeFunction = f;

    this.lastZoomDistance = view.camera.position.length(); // MJ
    this.originalZoomDistance = this.lastZoomDistance;
    return this;
  }

  public lastZoomDistance:number = 1;
  public originalZoomDistance:number = 1;


  onOrbitControlsChange(graph:AbstractVisualization, view:VisualizationView, evt) {
    if(view && view.camera){
      if(OncoData.instance.inHistoryUndoRedo == false) {
        let orbitControls = view.controls;
        // console.log(`Az ${oc.getAzimuthalAngle().toPrecision(6)} Po: ${oc.getPolarAngle().toPrecision(6)}  `);
        let dist:number = view.controls.target.distanceTo(view.controls.object.position)
        let sanity = view.camera.position.length();
        let zoom:number = this.originalZoomDistance / dist;

        let lastAngles = orbitControls['lastAngles'];
        if (lastAngles.azimuthal == orbitControls.getAzimuthalAngle().toPrecision(6) &&
            lastAngles.polar == orbitControls.getPolarAngle().toPrecision(6)) {
          // Angles are the same as last change, so this change is just zooming?
          // Need to check against last target too.
          if (dist.toPrecision(11) != graph.lastZoomDistance.toPrecision(11)){  // dist was zoom
            let oldZoomDistance = graph.lastZoomDistance;
            graph.lastZoomDistance = dist; // dist was zoom
            
            //console.log(` old Z:${oldZoomDistance} newZ:${dist}`);
            graph.adjustGraphDetailsBasedOnZoomChange( oldZoomDistance, dist, true);
          }
        } else {
          // console.log('just rotation change');
          lastAngles.azimuthal = orbitControls.getAzimuthalAngle().toPrecision(6);
          lastAngles.polar = orbitControls.getPolarAngle().toPrecision(6);
        }
      } else {
        // console.log('Avoiding orbit changes while in undo.');
      }
    }
  }


  destroy() {
    this.view.controls.removeEventListener('change', this.createdOrbitControlsChangeFunction);

    // TEMPNOTE: Adding "if" wrappers so we can call this super.destroy() from any child,
    // even if it has not set up each of these objects.
    if (this.$MouseDown) {
      this.$MouseDown.unsubscribe();
    }
    if (this.$MouseMove) {
      this.$MouseMove.unsubscribe();
    }
    if (this.$MouseUp) {
      this.$MouseUp.unsubscribe();
    }
    if (this.$KeyPress) {
      this.$KeyPress.unsubscribe();
    }
    if (this.$KeyDown) {
      this.$KeyDown.unsubscribe();
    }
    if (this.$KeyUp) {
      this.$KeyUp.unsubscribe();
    }
    if (this.$onHideLabels) {
      this.$onHideLabels.unsubscribe();
    }
    if (this.$onShowLabels) {
      this.$onShowLabels.unsubscribe();
    }
    if (this.$onShowTooltip) {
      this.$onShowTooltip.unsubscribe();
    }
    if (this.$onHideTooltip) {
      this.$onHideTooltip.unsubscribe();
    }
    if (this.labelController) {
      this.labelController.destroy();
    }
    if (this.tooltipController) {
      this.tooltipController.destroy();
    }
    this.enable(false);
  }

  preRender(views: VisualizationView[], layout: WorkspaceLayoutEnum, renderer: THREE.Renderer): void {}

  public onKeyDown(e: KeyboardEvent): void {}
  public onKeyUp(e: KeyboardEvent): void {}
  public onKeyPress(e: KeyboardEvent): void {}
  public onMouseDown(e: ChartEvent): void {}
  public onMouseUp(e: ChartEvent): void {}
  public onMouseMove(e: ChartEvent): void {
    // console.log('lowlevel onMouseMove, this._config.graph=' + this._config.graph.toString());
    if(window['globalOncoscapeMenuState'] == 1) {
      console.log('MENU ON, inside visabstract mousemove');
      return;
    }

    let self = this;
    let xoffset = 0;
    let x = e.event.clientX;
    if (this._config.graph === GraphEnum.GRAPH_B) {
      x -= this.view.viewport.width;
      xoffset = this.view.viewport.width;
    }
    let y = e.event.clientY;
    this.tooltipController.manualMouseMove(e, xoffset);
    if (this.tooltip === '') {
      return;

    } else {

    }

    if((e.event.buttons == 0) && this.tooltipController.mouseIsInside == false){
      this.tooltips.innerHTML = TooltipController.generateHtml(
        this.view,
        this.entity,
        {
          position: new Vector3(x + 15, e.event.clientY - 20, 0),
          userData: { tooltip: this.tooltip, color: this.tooltipColor }
        },
        this.tooltipOptions
      );
    } else {

    }
  }

  public onShowTooltip(e: { text: string; color: string; event: ChartEvent; complexTooltip: ComplexTooltipData}): void {
    // console.log('mjtooltip onShowTooltip')
    if(e.complexTooltip == null) {
      this.tooltip = e.text;
    } else {
      this.tooltip = e.complexTooltip;
    }
    this.tooltipColor = e.color;
    // ===>this.onMouseMove(e.event);
  }

  public onHideTooltip(): void {
    this.tooltip = '';
    this.tooltips.innerText = '';
  }

  public onShowLabels(): void {}
  public onHideLabels(): void {
    this.labels.innerHTML = '';
  }

  constructor() {}
}
