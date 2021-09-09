import { environment } from '../../../../environments/environment';
// MJ import { OrbitControls } from 'three-orbitcontrols-ts';
import * as TWEEN from '@tweenjs/tween.js';
import { ChartSelection } from './../../../model/chart-selection.model';
import { EventEmitter, Injectable } from '@angular/core';
import { GraphEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import {
  AmbientLight,
  Camera,
  HemisphereLight,
  Line,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  DirectionalLight,
  SpotLight,
  WebGLRendererParameters
} from 'three';
import { AbstractScatterVisualization } from './../../visualization/visualization.abstract.scatter.component';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum, WorkspaceLayoutEnum } from './../../../model/enum.model';
import { WorkspaceConfigModel } from './../../../model/workspace.model';
import { EdgesGraph } from './../../visualization/edges/edges.graph';
import { EdgeConfigModel } from './../../visualization/edges/edges.model';
import { ChartEvent, ChartEvents } from './chart.events';
import { ChartFactory } from './chart.factory';
import { ThreeToSvg } from './three_to_svg';
import { OncoSVGRenderer } from './OncoSVGRenderer';
import { GlobalGuiControls } from 'app/globalGuiControls';
import { OncoData } from 'app/oncoData';

var THREE = require('three');
var gggg =  new OncoSVGRenderer();
console.log(gggg._color);

// Object['unfreeze'] = function (o) {
//   var oo = undefined
//   if (o instanceof Array) {
//     oo = []
//     var clone = function (v) {
//       oo.push(v)
//     }
//     o.forEach(clone)
//   }
//   else if (o instanceof String) {
//     oo = new String(o).toString()
//   }
//   else if (typeof o == 'object') {
//     oo = {}
//     for (var property in o) {
//       oo[property] = o[property]
//     }
//   }
//   return oo
// }
// console.log(`MJ before setting projector and svg`);
// var THREE = Object['unfreeze'](require('three'))

var OrbitControls = require('three-orbit-controls')(THREE);

@Injectable()
export class ChartScene {
  public static instance: ChartScene;

  // Events
  public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{
    type: GraphConfig;
  }>();
  public onSelect: EventEmitter<ChartSelection> = new EventEmitter<ChartSelection>();

  // Instances
  public labelsA: HTMLElement;
  public labelsB: HTMLElement;
  public labelsE: HTMLElement;
  private container: HTMLElement;
  private events: ChartEvents;
  public renderer: WebGLRenderer;
  public views: Array<VisualizationView>;
  private centerLine: Line;

  private workspace: WorkspaceConfigModel;
  public set workspaceConfig(value: WorkspaceConfigModel) {
    if (!value.hasOwnProperty('layout')) {
      return;
    }
    this.workspace = value;
    this.events.workspaceConfig = value;
    this.onResize();
    this.render();
  }
  public config(e: { type: GraphConfig }) {
    this.onConfigEmit.next(e);
  }
  public select(e: ChartSelection) {
    this.onSelect.next(e);
  }

  private globalGuiControls:GlobalGuiControls;

  public initGlobalGuiControls(){
    this.globalGuiControls.init();
  }
      
  public init(container: HTMLElement, labelsA: HTMLElement, labelsB: HTMLElement, labelsE: HTMLElement) {
    let self = this; 
    this.globalGuiControls = new GlobalGuiControls();
  
    this.labelsA = labelsA;
    this.labelsB = labelsB;
    this.labelsE = labelsE;
    window.addEventListener('resize', this.onResize.bind(this));
    
    const dimension: ClientRect = container.getBoundingClientRect();
    this.container = container;

    this.renderer = new WebGLRenderer({
      // precision: 'lowP', 
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
    // this.renderer.setSize(dimension.width, dimension.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = false;
    this.renderer.localClippingEnabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.views = [
      {
        viewport: {
          x: 0,
          y: 0,
          width: Math.floor(dimension.width * 0.5),
          height: dimension.height
        },
        config: { visualization: VisualizationEnum.NONE },
        chart: null,
        camera: new PerspectiveCamera(22, 1, 1, 30000) as Camera,
        scene: new Scene(),
        renderer: this.renderer,
        controls: null
      },
      {
        viewport: {
          x: Math.floor(dimension.width * 0.5),
          y: 0,
          width: Math.floor(dimension.width * 0.5),
          height: dimension.height
        },
        config: { visualization: VisualizationEnum.NONE },
        chart: null,
        camera: new PerspectiveCamera(22, 1, 1, 30000) as Camera,
        scene: new Scene(),
        renderer: this.renderer,
        controls: null
      },
      {
        viewport: {
          x: 0,
          y: 0,
          width: dimension.width,
          height: dimension.height
        },
        config: { visualization: VisualizationEnum.NONE },
        chart: null,
        camera: null, // new OrthographicCamera(-300, 300, 300, -300) as Camera,
        scene: new Scene(),
        renderer: this.renderer,
        controls: null
      }
    ].map<any>((view, i) => {
      // Edge View Settings
      if (view.camera === null) {
        const aspect = view.viewport.width / view.viewport.height;
        const left = (-aspect * view.viewport.height) / 2;
        const right = Math.abs(left);
        const bottom = -view.viewport.height / 2;
        const top = Math.abs(bottom);

        view.camera = new OrthographicCamera(left, right, top, bottom) as Camera;
        view.camera.position.fromArray([0, 0, 1000]);
        view.camera.lookAt(new Vector3(0, 0, 0));
        view.scene.add(view.camera);
        view.scene.add(new AmbientLight(0xaaaaaa, 0.3));

        return view;
      } else {
        const camera = view.camera as PerspectiveCamera;
        camera.aspect = view.viewport.width / view.viewport.height;
        camera.updateProjectionMatrix();
      }

      // View
      view.camera.position.fromArray([0, 0, 1000]);
      view.camera.lookAt(new Vector3(0, 0, 0));
      view.scene.add(view.camera);

      // Controls
      
      view.controls = new OrbitControls(view.camera, this.renderer.domElement);
      view.controls.enabled = false;
      view.controls.enableKeys = false;
      view.controls.zoomSpeed = 1.6;
      
      view.controls.addEventListener('change', () => {
        if(window['globalOncoscapeMenuState'] != 1) {
          self.renderControlsChangeWrapper(self, view)
        }
      });
      let thisControl = view.controls;
      // saveState is not in the three-orbitcontrols-ts@0.1.2 npm package, for some reason.
      view.controls['saveState'] = () => {
        thisControl.target0.copy(thisControl.target);
        thisControl.position0.copy(thisControl.object.position);
        // Check whether the camera has zoom property
        if(thisControl._checkOrthographicCamera && thisControl._checkPerspectiveCamera){
          if (thisControl._checkOrthographicCamera(thisControl.object) || thisControl._checkPerspectiveCamera(thisControl.object)){
            thisControl.zoom0 = thisControl.object.zoom;
          }
        } else {
          console.warn('MJ saveState does not see checks.');          
        }
      }

      // Store lastAngles, so in OrbitControls onChange, we can see if they have changed.
      // If not change in angles, it is purely a Zooming event.
      let oc = view.controls; // (view.controls as OrbitControls);
      console.log(`AFTER CREATE, Az ${oc.getAzimuthalAngle().toPrecision(6)} Po: ${oc.getPolarAngle().toPrecision(6)}  `);
      oc['lastAngles'] = {
        azimuthal: oc.getAzimuthalAngle().toPrecision(8),
        polar: oc.getPolarAngle().toPrecision(8),
      }

      // Lighting
      view.scene.add(new HemisphereLight(0x999999, 0xffffff, 1));
      // view.scene.add(new SpotLight(0XFFFFFF, 1, 600));
      return view;
    });

    this.events = new ChartEvents(this.container);
    this.events.chartFocus.subscribe(this.onChartFocus.bind(this));

    this.render();
  }

  renderControlsChangeWrapper = (chartScene:any, view:any) => {
    let thisCamera:PerspectiveCamera = view.controls.object;
    this.invalidatePrerender();
    chartScene.render();
  }

  // Prerendering is for the edges. Thus we only need to prerender
  // if zoom, rotate, pan, etc. has happened, or we have recalculated
  // objects in graph A or B. We do not  need to prerender just because
  // we change coloring (or shape?) in A or B.
  private _needToPrerender:boolean = true;
  invalidatePrerender(){
    this._needToPrerender = true;
  }

  render = () => {
    let view;
    this.renderer.clear();

    this.views.forEach(v => {
      this.renderer.setViewport(v.viewport.x, v.viewport.y, v.viewport.width, v.viewport.height);
      this.renderer.render(v.scene, v.camera);
    });

    if(this._needToPrerender){
      view = this.views[2];
      if (view.chart !== null) {
        view.chart.preRender(this.views, this.workspace.layout, this.renderer);
      }
      this._needToPrerender = false;
    }

    // Center Line
    try {
      view.scene.remove(this.centerLine);
    } catch (e) {}

    try {
      if (this.workspace.layout !== WorkspaceLayoutEnum.SINGLE) {
        this.centerLine =
          this.workspace.layout === WorkspaceLayoutEnum.HORIZONTAL
            ? ChartFactory.lineAllocate(0x039be5, new Vector2(0, -1000), new Vector2(0, 1000))
            : ChartFactory.lineAllocate(0x039be5, new Vector2(-1000, 0), new Vector2(1000, 0));
        view.scene.add(this.centerLine);
        this.renderer.setViewport(view.viewport.x, view.viewport.y, view.viewport.width, view.viewport.height);
        this.renderer.render(view.scene, view.camera);
      }
    } catch (e) {}
    // tslint:disable-next-line:semicolon
  };

  applyThreeDOption= (config: GraphConfig, option:string, value:any) => {
    let viewIndex= config.graph - 1;
    let view = this.views[viewIndex];
    if(config.isScatterVisualization){
      let viewChartAsScatterViz = <AbstractScatterVisualization>  view.chart;
      viewChartAsScatterViz.processThreeDOption(option, value);
    }
  }  

  renderToSvg = (canvas: any) => {
    let svgThing = new ThreeToSvg();
    svgThing.init(canvas);
    let result = svgThing.svgSnapshot(ChartScene.instance.views);
    return result;
  };


  // Called by onResize
  private processViewsOnResize(dimension:ClientRect){
    this.views.forEach((view, i) => {
      // This is the edges
      if (i === 2) {
        view.viewport.x = 0;
        view.viewport.y = 0;
        view.viewport.width = dimension.width;
        view.viewport.height = dimension.height;
        return;
      } else {
        switch (this.workspace.layout) {
          case WorkspaceLayoutEnum.SINGLE:
            if (i === 0) {
              view.viewport.x = 0;
              view.viewport.y = 0;
              view.viewport.width = dimension.width;
              view.viewport.height = dimension.height;
            } else {
              view.viewport.x = 0;
              view.viewport.y = 0;
              view.viewport.width = 0;
              view.viewport.height = 0;
            }
            break;
          case WorkspaceLayoutEnum.HORIZONTAL:
            view.viewport.x = i === 0 ? 0 : Math.floor(dimension.width * 0.5);
            view.viewport.y = 0;
            view.viewport.width = Math.floor(dimension.width * 0.5);
            view.viewport.height = dimension.height;
            break;
          case WorkspaceLayoutEnum.VERTICAL:
            view.viewport.x = 0;
            view.viewport.y = i === 0 ? 0 : Math.floor(dimension.height * 0.5);
            view.viewport.width = dimension.width;
            view.viewport.height = Math.floor(dimension.height * 0.5);
            break;
          case WorkspaceLayoutEnum.OVERLAY:
            view.viewport.x = i === 0 ? 0 : 10;
            view.viewport.y = 0;
            view.viewport.width = dimension.width;
            view.viewport.height = dimension.height;
            break;
        }
      }
      const camera = view.camera as PerspectiveCamera;
      camera.aspect = view.viewport.width / view.viewport.height;
      camera.updateProjectionMatrix();
    });
    if (this.workspace.layout === WorkspaceLayoutEnum.OVERLAY) {
      this.views[0].camera = this.views[1].camera;
    }
    this.render();
  }

  private onResize() {
    let self = this;
    self.invalidatePrerender();
    const dimension: ClientRect = self.container.getBoundingClientRect();
    // 2021-03-15 - The renderer started intermittently being null when the site loads.
    if(self.renderer){
      self.renderer.setSize(dimension.width, dimension.height);
      self.processViewsOnResize(dimension);
    } else {
      // We make one more attempt. 
      console.warn('Null renderer in onResize.');
      window.setTimeout( () => {
        if(self.renderer){
          self.renderer.setSize(dimension.width, dimension.height);
          self.processViewsOnResize(dimension);
        } else {
          console.error('Second null renderer in onResize. Giving up.');
        }
      }, 250)
    }
  }

  private onChartFocus(e: ChartEvent) {
    if (this.views[1].chart !== null && this.views[0].chart !== null) {
      this.views[0].chart.enable(e.chart === GraphEnum.GRAPH_A);
      this.views[1].chart.enable(e.chart === GraphEnum.GRAPH_B);
    }
  }

  public updateDecorators(graph: GraphEnum, config: GraphConfig, decorators: Array<DataDecorator>): void {
    const view =
      graph === GraphEnum.GRAPH_A ? this.views[0] : graph === GraphEnum.GRAPH_B ? this.views[1] : this.views[2];
    if (view.chart !== null) {
      view.chart.updateDecorator(config, decorators);
      this.render();
    }
  }

  public updateData(
    graph: GraphEnum,
    config: GraphConfig,
    data: any,
    chartObjectInterface: ChartObjectInterface
  ): void {
    if(chartObjectInterface == null){
      // Got data nut not attachedto one visualization.
      // For example, TableLoader results, for diffexp widget.
      return;
    }

    this.invalidatePrerender();
    let view: VisualizationView;
    switch (graph) {
      case GraphEnum.EDGES:
        view = this.views[2];
        if (view.config.visualization !== config.visualization) {
          if (view.chart !== null) {
            view.chart.destroy();
          }
          const e = config as EdgeConfigModel;
          view.config = config;
          view.chart = chartObjectInterface.create(config.entity, this.labelsE, this.events, view);
          // view.chart.
          view.chart.onRequestRender.subscribe(this.render.bind(this));
          view.chart.onConfigEmit.subscribe(this.config.bind(this));
          (view.chart as EdgesGraph).updateEdges = true;
          // this.getChartObject(config.visualization)
          //         .create(this.labelsE, this.events, view);
          //     view.chart.onRequestRender.subscribe(this.render);
          //     view.chart.onConfigEmit.subscribe(this.config);
          //     (view.chart as EdgesGraph).updateEdges = true;
          // }
        }
        break;
      case GraphEnum.GRAPH_A:
      case GraphEnum.GRAPH_B:
        view = graph === GraphEnum.GRAPH_A ? this.views[0] : this.views[1];
        if (view.config.visualization !== config.visualization) {
          const entityChanged = view.config.entity === config.entity;
          view.config.visualization = config.visualization;
          let decorators = [];
          if (view.chart !== null) {
            decorators = view.chart.decorators;
            view.chart.onRequestRender.unsubscribe();
            view.chart.onConfigEmit.unsubscribe();
            view.chart.onSelect.unsubscribe();
            view.chart.destroy();
            view.controls.minDistance = 0;
            view.controls.maxDistance = Infinity;
            // const camera = view.camera as PerspectiveCamera;
            // camera.fov = 90;
            // camera.position.set(0, 0, 1000);
            // camera.lookAt(new Vector3(0, 0, 0));
            // camera.aspect = view.viewport.width / view.viewport.height;
            // camera.updateProjectionMatrix();
          }

          let mostRecentSelectionController = OncoData.instance.currentSelectionController;
          view.chart = chartObjectInterface.create(
            config.entity,
            config.graph === GraphEnum.GRAPH_A ? this.labelsA : this.labelsB,
            this.events,
            view
          );
          if(config.graph != GraphEnum.GRAPH_A){
            // This should only be set for GRAPH_A. Ugly.
            OncoData.instance.currentSelectionController = mostRecentSelectionController;
          }

          if (!entityChanged) {
            view.chart.decorators = decorators;
          } else {
            view.chart.decorators = [];
          }

          view.chart.onRequestRender.subscribe(this.render);
          view.chart.onConfigEmit.subscribe(this.config.bind(this));
          view.chart.onSelect.subscribe(this.select);
          view.controls.enableRotate = false;
          view.controls.reset();
          view.chart.enable(true);

          try {
            (graph === GraphEnum.GRAPH_A ? this.views[1] : this.views[0]).chart.enable(false);
          } catch (e) {}

          if (this.workspace.layout === WorkspaceLayoutEnum.SINGLE) {
            try {
              this.views[0].chart.enable(true);
            } catch (e) {}
            try {
              this.views[1].chart.enable(false);
            } catch (e) {}
          }
        }
        break;
    }
    view.chart.updateData(config, data);
    this.render();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }
  constructor() {
    ChartScene.instance = this;
    console.log('created reachableChartScene');
    window['reachableChartScene'] = this;
    this.animate();
  }
}
