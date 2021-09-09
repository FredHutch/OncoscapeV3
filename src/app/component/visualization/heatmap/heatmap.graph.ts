import { EventEmitter } from '@angular/core';
import { GraphEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { Vector2 } from 'three';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum, WorkspaceLayoutEnum } from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { HeatmapConfigModel, HeatmapDataModel } from './heatmap.model';
import { AbstractVisualization } from '../visualization.abstract.component';
import { Vector3 } from 'three';
import { TooltipOptions } from './../../../controller/tooltip/tooltip.controller';
import { TooltipController } from '../../../controller/tooltip/tooltip.controller';

export class HeatmapGraph extends AbstractVisualization {
  // Emitters
  public onRequestRender: EventEmitter<GraphEnum> = new EventEmitter();
  public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{
    type: GraphConfig;
  }>();
  public onSelect: EventEmitter<{ type: EntityTypeEnum; ids: Array<string> }> = new EventEmitter<{
    type: EntityTypeEnum;
    ids: Array<string>;
  }>();

  // Chart Elements
  // private labels: HTMLElement;
  // private events: ChartEvents;
  // private view: VisualizationView;
  private data: HeatmapDataModel;
  //private config: HeatmapConfigModel;
  // private isEnabled: boolean;
  public set config(config: HeatmapConfigModel) { this._config = config; }
  public get config(): HeatmapConfigModel { return this._config as HeatmapConfigModel; }

  // Objects
  pointSize = 1;
  particles: THREE.Points;
  geometry = new THREE.BufferGeometry();
  material = new THREE.PointsMaterial({
    size: this.pointSize,
    vertexColors: true
  });

  public meshes: THREE.Object3D[];
  public decorators: DataDecorator[];
  private points: THREE.Points;
  private group: THREE.Group;

  // // Private Subscriptions
  // private sMouseMove: Subscription;
  public $MouseDown: Subscription;
  // private sMouseUp: Subscription;
  public $MouseMove: Subscription;

  create(entity: EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, labels, events, view);

    this.labels = labels;
    this.events = events;
    this.view = view;
    this.isEnabled = false;
    this.view.controls.enableRotate = false;
    this.meshes = [];
    this.view.controls.reset();

    return this;
  }

  destroy() {
    super.destroy();
    this.removeObjects();
    this.enable(false);
  }


  // Label Options
  onShowLabels(): void {
    console.log(`TEMPNOTE: showlabels in heatmap @ ${Date.now()}`);
    this.labels.innerHTML =
      '<div style="position:fixed;bottom:10px;left:50%; font-size: 15px;">Samples</div>' +
      '<div style="position:fixed;right:10px;top:50%; transform: rotate(90deg); font-size: 15px;">Genes</div>';
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    console.error('Method not implemented.');
  }

  updateData(config: GraphConfig, data: any) {
    this.config = config as HeatmapConfigModel;
    this.data = data;
    this.removeObjects();
    this.addObjects();
  }

  preRender(
    views: Array<VisualizationView>,
    layout: WorkspaceLayoutEnum,
    renderer: THREE.WebGLRenderer
  ) {}

  enable(truthy: boolean) {
    if (this.isEnabled === truthy) {
      return;
    }
    this.isEnabled = truthy;
    this.view.controls.enabled = this.isEnabled;
    this.labelController.enable = this.isEnabled;
    this.tooltipController.enable = this.isEnabled;
    if (truthy) {
      this.$MouseDown = this.events.chartMouseDown.subscribe(this.onMouseDown.bind(this));
      this.$MouseMove = this.events.chartMouseMove.subscribe(this.onMouseMove.bind(this));
    } else {
      this.$MouseDown.unsubscribe();
      this.$MouseMove.unsubscribe();
      this.labels.innerHTML = '';
      this.tooltips.innerHTML = '';
    }
  }

  removeObjects() {
    if (this.points !== null) {
      this.view.scene.remove(this.group);
      this.view.scene.remove(this.points);
    }
  }

  drawDendogram(result: any, horizontal: boolean): void {
    const dendrogram = new THREE.Group();
    this.group.add(dendrogram);

    // Was using light blue 0x029be5, but with red-blue color scheme, should become gray/black
    if (horizontal) {
      dendrogram.rotateZ(Math.PI * 0.5);
      for (let n = 0; n < result.dendo.icoord.length; n += 1) {
        const x = result.dendo.icoord[n];
        const y = result.dendo.dcoord[n];
        dendrogram.add(
          ChartFactory.linesAllocate(
            0xc0c0c0,
            [
              new Vector2(x[0] * 0.2 - 1, y[0] + 1),
              new Vector2(x[1] * 0.2 - 1, y[1] + 1),
              new Vector2(x[2] * 0.2 - 1, y[2] + 1),
              new Vector2(x[3] * 0.2 - 1, y[3] + 1)
            ],
            {}
          )
        );
      }
    } else {
      for (let n = 0; n < result.dendo.icoord.length; n += 1) {
        const x = result.dendo.icoord[n];
        const y = result.dendo.dcoord[n];
        dendrogram.add(
          ChartFactory.linesAllocate(
            0xc0c0c0,
            [
              new Vector2(x[0] * 0.2 - 1, -y[0] - 1),
              new Vector2(x[1] * 0.2 - 1, -y[1] - 1),
              new Vector2(x[2] * 0.2 - 1, -y[2] - 1),
              new Vector2(x[3] * 0.2 - 1, -y[3] - 1)
            ],
            {}
          )
        );
      }
    }
  }

  myComposeTooltipFromIndex(i:number): string {
    return `Just a tooltip for #${i}.<b>${Date.now()}</b>`;
  }

  addObjects() {
    // Create a group for the dendograms etc, but do not put the points in the group.
    this.group = new THREE.Group();
    this.view.scene.add(this.group);

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    let squareSize = 9.5;
    if(this.config.removeWhitespace == true) {
      squareSize  = 12;
    }

    this.data.colors.forEach((sampleColumn, i) => {
      sampleColumn.forEach((gene, j) => {
        positions.push(i * 2, j * 2, 0);
        const c = ChartFactory.getColor(gene);
        colors.push(c.r, c.g, c.b);
      });
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    const material = new THREE.PointsMaterial({ size: squareSize, vertexColors: true });
    this.points = new THREE.Points(geometry, material);
    this.points.userData = {};
    this.points.userData.checkIndex = true;
    this.points.userData.matrixSettings = {
      numSampleColumns: this.data.colors.length,
      numGenes: this.data.colors[0].length,
      squareSize: squareSize
    };
    this.points.userData.composeTooltipFromIndex = this.myComposeTooltipFromIndex;

    this.view.scene.add(this.points);

    if (this.tooltipController) {
      this.tooltipController.targets = [this.points]; 
    }

    this.drawDendogram(this.data.y, true);
    this.drawDendogram(this.data.x, false);

    const borderGroup = new THREE.Group();
    this.group.add(borderGroup);  
    let numCols =   this.data.colors.length;
    let numRows = this.data.colors[0].length;
    borderGroup.add(
      ChartFactory.linesAllocate(
        0x000000,
        [
          new Vector2(-1, -1),
          new Vector2(numCols* 2-1, -1),
          new Vector2(numCols*2-1, numRows*2-1),
          new Vector2(-1, numRows*2-1),
          new Vector2(-1, -1)
        ],
        {}
      )
    );

    this.onRequestRender.next();
    requestAnimationFrame(v => {
      this.onShowLabels();
    });
  }

  onMouseMove(e: ChartEvent): void {
    //console.log(`TEMPNOTE: mouse move @ ${Date.now()}. ${JSON.stringify(e)}.`);
    let x = e.event.clientX;
    if (this._config.graph === GraphEnum.GRAPH_B) {
      return;
      // x -= this.view.viewport.width;
    }
    this.tooltip = `x: ${e.mouse.x.toFixed(4)}< br />y : ${e.mouse.y.toFixed(4)}`;
    let mousex = ( e.mouse.x / window.innerWidth ) * 2 - 1;
    let mousey = - ( e.mouse.y / window.innerHeight ) * 2 + 1;


    // console.log(`MJ mousex,y = ${mousex}, ${mousey}.`);

    // this.tooltips.innerHTML = TooltipController.generateHtml(
    //   {
    //     position: new Vector3(x + 15, e.event.clientY - 20, 0),
    //     userData: { tooltip: this.tooltip, color: this.tooltipColor }
    //   },
    //   this.tooltipOptions
    // );    
    //super.onMouseMove(e);

    // TEMPNOTE: This should be on wheel event, but have to find where to do that.
    const zoom:number = this.view.camera.position.z;
    if(zoom > 910) {  // if > 4900, squares merge and Moire disappears.
      // TBD: Show Moire warning, as squares are too small.
    }
  }

  onMouseDown(e: ChartEvent): void {
    console.log(`TEMPNOTE: mouse down @ ${Date.now()}. ${JSON.stringify(e)}.`);
    let x = e.event.clientX;
    // if (this._config.graph === GraphEnum.GRAPH_B) {
    //   x -= this.view.viewport.width;
    // }
    this.tooltip = `x: ${e.mouse.x.toFixed(4)}< br />y : ${e.mouse.y.toFixed(4)}`;
    console.log(this.tooltip);
  }


     

  createLine(node) {
    console.log(`TEMPNOTE: heatmap createLine.`);
    // console.log(`TEMPNOTE: heatmap createLine node= ${JSON.stringify(node)}`);
  }

  constructor() {
    super();
  }
}
