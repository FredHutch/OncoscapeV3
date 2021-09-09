import { SelectionToolConfig } from './../../../model/selection-config.model';
import { EventEmitter } from '@angular/core';
import {
  GraphEnum,
  EntityTypeEnum,
  WorkspaceLayoutEnum
} from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import * as _ from 'lodash';
import * as THREE from 'three';
import { LabelController } from './../../../controller/label/label.controller';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import {
  VariantCheckbox,
  DataDecorator,
  DataDecoratorTypeEnum
} from './../../../model/data-map.model';
import { ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { EdgeConfigModel, EdgeDataModel } from './edges.model';
import { GlobalGuiControls } from 'app/globalGuiControls';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { AbstractScatterVisualization } from 'app/component/visualization/visualization.abstract.scatter.component';
import { AbstractVisualization } from 'app/component/visualization/visualization.abstract.component';
import { OncoData } from 'app/oncoData';
import { TooltipOverride } from 'app/model/dataset-table-info.model';

export class EdgesGraph implements ChartObjectInterface {
  // Chart Elements
  public canRegenLinks: boolean = false;
  private data: EdgeDataModel;
  private config: EdgeConfigModel;
  private view: VisualizationView;

  public entity: EntityTypeEnum;
  public meshes: Array<THREE.Mesh>;
  public decorators: DataDecorator[] = [];
  public lines: Array<THREE.Line> = [];
  private drawEdgesDebounce: Function;
  public updateEdges: Boolean = false;
  public filterGenesForEdges(
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum,
    key: string
  ){
    return [];
  }
  public updatedEdgeConfig(edgeConfig: EdgeConfigModel) {}
  public regenLinks() {
  }

  public tooltipSnippetFromColorDecorator(id:any, tooltipOverride:TooltipOverride){
    return "";
  };

  public tooltipColorFromDecorator(id:any, color:any){
    return color;
  };

  // Emitters
  public onRequestRender: EventEmitter<GraphEnum> = new EventEmitter();
  public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{
    type: GraphConfig;
  }>();
  public onSelect: EventEmitter<{
    type: EntityTypeEnum;
    ids: Array<string>;
  }> = new EventEmitter<{ type: EntityTypeEnum; ids: Array<string> }>();

  getTargets(): { point: THREE.Vector3; id: string; idType: EntityTypeEnum }[] {
    return [];
  }

  public filterObjectsInFrustum(
    targets: Array<{
      point: THREE.Vector3;
      id: string;
      idType: EntityTypeEnum;
    }>,
    view: VisualizationView
  ): Array<{ point: THREE.Vector3; id: string; idType: EntityTypeEnum }> {
    const camera = view.camera as THREE.PerspectiveCamera;
    camera.updateMatrixWorld(true);
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    const cameraViewProjectionMatrix: THREE.Matrix4 = new THREE.Matrix4();
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    return targets.filter(target => frustum.containsPoint(target.point));
  }

  enable(truthy: Boolean) {
    // throw new Error('Method not implemented.');
  }

  updateAllOpacity(newOpacity:number) {
    if(this.view && this.view.scene) {
      this.view.scene.children.forEach((v:THREE.Line,i) => {
        if (i>1) { // skip camera 0 and light 1. All the rest are lines.
          v.material["opacity"] = newOpacity;
        }
      });
    }
  }


  // if the v.b matches a value (e.g., "gene "TTN"), highlight it.
  updateGraphBMatchOpacity(newOpacity:number, bMatchVal:string) {
    if(this.view && this.view.scene) {
      this.view.scene.children.forEach((v:THREE.Line,i) => {
        if (i>1) { // skip camera 0 and light 1. All the rest are lines.
          if(v.userData){
            if(v.userData.b == bMatchVal){
              v.material["opacity"] = newOpacity;
            }
          } else {
            // console.log(`No userData in updateGraphBMatchOpacity at v=${i}. Might be the vertical line.`);
          }
        }
      });
    }
  }

  // Set opacity for all edges. We do this if 
  // GlobalGuiControls.instance.edgeHideUnhovered is true,
  // to hide all edges (then highlight the hovered ones).
  updateGraphAllBOpacity(newOpacity:number ) {
    if(this.view && this.view.scene) {
      this.view.scene.children.forEach((v:THREE.Line,i) => {
        if (i>1) { // skip camera 0 and light 1. All the rest are lines.
          v.material["opacity"] = newOpacity;
        }
      });
    }
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    this.decorators = decorators;
    this.drawEdgesDebounce();
  }

  updateData(config: GraphConfig, data: any) {
    this.config = config as EdgeConfigModel;
    this.data = data;
    this.processNewData();
    this.drawEdgesDebounce();
  }
  updateSelectionTool(config: SelectionToolConfig) {}
  public createMap2D(
    objects: Array<{
      point: THREE.Vector3;
      id: string;
      idType: EntityTypeEnum;
    }>,
    view: VisualizationView
  ): Object {
    const viewport = view.viewport;
    const width = viewport.width;
    const height = viewport.height;
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const offset =
      view.config.graph === GraphEnum.GRAPH_A
        ? new THREE.Vector3(-view.viewport.x, -view.viewport.y, 0)
        : new THREE.Vector3(view.viewport.x, view.viewport.y, 0);
    return objects.reduce((p, obj) => {
      const position = obj.point.clone().project(view.camera);
      position.x = position.x * halfWidth - halfWidth;
      position.y = position.y * halfHeight;
      position.z = 0;
      p[obj.id] = position.add(offset);
      return p;
    }, {});
  }

  getEdgesTargetsFromMeshes(
    view: VisualizationView,
    entityType: EntityTypeEnum
  ): Array<{ point: THREE.Vector3; id: string; idType: EntityTypeEnum }> {
    return view.chart.getTargetsFromMeshes(entityType);
  }

  getTargetsFromMeshes(
    entityType: EntityTypeEnum
  ): Array<{ point: THREE.Vector3; id: string; idType: EntityTypeEnum }> {
    console.log('=== edges getTargetsFromMeshes');
    return this.meshes.map(mesh => {
      return { point: mesh.position, id: mesh.userData.id, idType: entityType };
    });
  }

  addEdgesFromVariantArray(isCNA:boolean, edges:Array<any>, variants:Array<{m:string,s:string,t:string}>){
    let cfg = this.config;
    variants.map(v => {
      let edge = {
        a: cfg.entityA === EntityTypeEnum.GENE ? v.m : v.s,
        b: cfg.entityB === EntityTypeEnum.GENE ? v.m : v.s,
        c: 0x81d4fa,
        i: v.t
      }
      edges.push(edge);
    });
  }

  public softRequestLinkRegen() {
    // Find first view which has canregenLinks==true.
    // Send it a regenLinks call.
    let view = ChartScene.instance.views.find(v => v.chart.canRegenLinks);
    if(view) {
      view.chart.regenLinks();
    }
  }

  private processNewData(){
    // Start with all possible links, then filter by active genes.
    let views = ChartScene.instance.views;
    if(this.data && this.data.result && this.data.result.length) { // Will be null when we first start up.
      this.calculateTargets();
      if (this.data.result.length == 1 && this.data.result[0] == 'getLocally') {
        this.variantsFilteredByGeneSet = views[1].chart.filterGenesForEdges(
          this.config.entityA, this.config.entityB, null //this.config.field.key
        );

      } else {
        // use whatever edges.compute returned.
        this.variantsFilteredByGeneSet = this.data.result;
      }

      this.haveEverProcessedNewData = true;
      console.log('processNewData complete');
    }
  }

  private calculateTargets(){
    let views = ChartScene.instance.views;
    this.entityATargets = views[0].chart.getTargets();
    this.entityBTargets = views[1].chart.getTargets();
    if (this.entityATargets === null) {
      this.entityATargets = this.getEdgesTargetsFromMeshes(views[0], this.config.entityA);
    }
    if (this.entityBTargets === null) {
      this.entityBTargets = this.getEdgesTargetsFromMeshes(views[1], this.config.entityB);
    }
  }

  private haveEverProcessedNewData = false;

  //MJ: For now (Oct 2020), assume variantCheckbox has only one level of child checkboxes.
  public markLinkVisibilityOfSelected(shouldBeVisible:boolean, variantCheckbox:VariantCheckbox){
    if(this.haveEverProcessedNewData == false){
      // Kludge. MJ: need to place to call out to "compute" edges.
      // This kludge assumes we will always process locally.
      console.log('==================>markLinksVisible');
      this.data.result = ['getLocally'];
      this.processNewData();
    }

    if(variantCheckbox == null) {
      variantCheckbox = OncoData.instance.edgeMainVariantCheckbox;
    }

    console.log('==== Going to filter out unselected nodes.');
    let variantsOfRightType:Array<any> = this.variantsFilteredByGeneSet;
    // Filter out unselected nodes.
    // 0. If neither side has selection, add no edges.
    // 1. If left nodes re selected, and right aren't, just filter left side.
    // 2. Similar if only right nodes are selected.
    // 3. If both sides have selection, filter by both.
    let variantsOfRightTypeIfSelected : any[] = [];

    let leftVis = ChartScene.instance.views[0].chart as AbstractScatterVisualization;
    let rightVis = ChartScene.instance.views[1].chart as AbstractScatterVisualization;
    if(leftVis == null || rightVis ==null) {
      return;
    }
    let leftHighlightIndexSet = leftVis.selectionController.highlightIndexes;
    let rightHighlightIndexSet = rightVis.selectionController.highlightIndexes;
    if (leftHighlightIndexSet.size == 0 || rightHighlightIndexSet.size==0){
      return; // Need selections on both sides.
    }
    
    // Build Set for includes, Set for excludes. (Excludes NYI)
    // childBoxes: [
    //   {name: 'Mutation', completed: true, color: '#9C27B0'},
    //   {name: 'Amplification', completed: true, color: '#3F51B5'} ,
    //   {name: 'Gain', completed: true, color: '#3fa5b5'} ,
    //   {name: 'Loss', completed: true, color: '#f26602'},
    //   {name: 'Deletion', completed: true, color: '#ff0000'},
    // Map 'Amplification' to 'Amp'.
    let setIncludes = new Set(variantCheckbox.subtasks
      .filter(v =>v.completed).map(v => v.name == 'Amplification' ? 'Amp' : v.name));
    function matchesIncludedVariant(v):boolean {
      if(v.isCNA) {
        return setIncludes.has(v.i);
      } else {
        return setIncludes.has('Mutation');
      }
    }

    let leftIdsSet = new Set();
    let rightIdsSet = new Set();


    try {
      leftHighlightIndexSet.forEach((value, valueAgain, leftHighlightIndexSet) => {
        leftIdsSet.add(this.entityATargets[value/3].id);
      });
      rightHighlightIndexSet.forEach((value, valueAgain, rightHighlightIndexSet) => {
        rightIdsSet.add(this.entityBTargets[value/3].id);
      });
    } catch (err) {
      alert("Error in markLinkVisibilityOfSelected, adding to ID sets.")
    }

    if (leftHighlightIndexSet.size > 0 && rightHighlightIndexSet.size > 0){
      // select only edges where both sides are highlighted.
      variantsOfRightTypeIfSelected = variantsOfRightType.filter (v => {
        return matchesIncludedVariant(v) && leftIdsSet.has(v.a) && rightIdsSet.has(v.b);
      })
    // } else {
    //   if (leftHighlightIndexSet.size > 0){
    //     // Only left side is highlighted.
    //     variantsOfRightTypeIfSelected = variantsOfRightType.filter (v => {
    //       return matchesIncludedVariant(v) && leftIdsSet.has(v.a);
    //     })
    //   } else {
    //     // Only right side is highlighted.
    //     variantsOfRightTypeIfSelected = variantsOfRightType.filter (v => {
    //       return matchesIncludedVariant(v) && rightIdsSet.has(v.b);
    //     })
    //   }
    }
    variantsOfRightTypeIfSelected.map( v=> {
      v.visible = shouldBeVisible;
    });
    ChartScene.instance.invalidatePrerender();
    ChartScene.instance.render();
  }

  public hideAllLinks(){
    if(this.haveEverProcessedNewData == false){
      this.data.result = ['getLocally'];
      this.processNewData();
    }
    let variantsOfRightType:Array<any> = this.variantsFilteredByGeneSet;
    variantsOfRightType.map( v=> {
      v.visible = false;
    });
    ChartScene.instance.invalidatePrerender();
    ChartScene.instance.render();
  }


  public variantsFilteredByGeneSet:Array<any>  = null;
  private entityATargets:Array<any>;
  private entityBTargets:Array<any>;

  drawEdges(views: Array<VisualizationView>, layout, renderer) {
    console.log('drawedges');
    if (views == null) {
      console.log('TEMPNOTE: drawEdges called without view.');
      return;
    }

    if (layout === WorkspaceLayoutEnum.SINGLE) {
      this.decorators = [];
      return;
    }

    if (this.data.result.length === 0) {
      // Clear Scene + Add Center Line
      this.view.scene.children = this.view.scene.children.splice(0, 2);
      this.view.scene.add(
        ChartFactory.lineAllocate(
          0x039be5,
          new THREE.Vector2(0, -1000),
          new THREE.Vector2(0, 1000)
        )
      );
      renderer.clear();
      views.forEach(view => {
        renderer.setViewport(
          view.viewport.x,
          view.viewport.y,
          view.viewport.width,
          view.viewport.height
        );
        renderer.render(view.scene, view.camera);
      });
      return;
    }
    this.calculateTargets();

    let aTargetsFrustumFiltered = this.filterObjectsInFrustum(this.entityATargets, views[0]);
    let bTargetsFrustumFiltered = this.filterObjectsInFrustum(this.entityBTargets, views[1]);

    this.view.scene.children = this.view.scene.children.splice(0, 2);
    if (views[0].chart === null || views[1].chart === null) {
      return;
    }

    const obj2dMapA = this.createMap2D(aTargetsFrustumFiltered, views[0]);
    const obj2dMapB = this.createMap2D(bTargetsFrustumFiltered, views[1]);
    // const obj2dMapA = LabelController.createMap2D(visibleObjectsA, views[0]);
    // const obj2dMapB = LabelController.createMap2D(visibleObjectsB, views[1]);

    /*
    const ea =
      this.config.entityA === 'Samples'
        ? 'sid'
        : this.config.entityA === 'Patients'
          ? 'pid'
          : 'mid';
    const eb =
      this.config.entityB === 'Samples'
        ? 'sid'
        : this.config.entityB === 'Patients'
          ? 'pid'
          : 'mid';
*/
    const colorDecorator = this.decorators.find(
      d => d.type === DataDecoratorTypeEnum.COLOR
    );
    const hasColorDecorator = colorDecorator !== undefined;
    const colorMap = hasColorDecorator
      ? colorDecorator.values.reduce((p, c) => {
          p[c.pid] = c;
          p[c.sid] = c;
          return p;
        }, {})
      : {};

    const groupDecorator = this.decorators.find(
      d => d.type === DataDecoratorTypeEnum.GROUP
    );
    const hasGroupDecorator = groupDecorator !== undefined;
    const groupMap = hasGroupDecorator
      ? groupDecorator.values.reduce((p, c) => {
          c.value = parseInt(c.value, 10);
          p[c.pid] = c;
          p[c.sid] = c;
          return p;
        }, {})
      : {};

    let groupY = [];
    if (hasGroupDecorator) {
      const vph = this.view.viewport.height;
      const vphHalf = this.view.viewport.height * 0.5;
      const binCount = Math.max(...groupDecorator.values.map(v => v.value));
      const binHeight = vph / (binCount + 1);
      groupY = Array.from({ length: binCount }, (v, k) => k + 1).map(
        v => v * binHeight - vphHalf - binHeight * 0.5
      );
    }
 
    let startTime = Date.now();
    let opacity = GlobalGuiControls.instance.edgeOpacity * GlobalGuiControls.instance.edgeOpacity; // square it to stretch out the lower end.
    let globalEdgeZ = GlobalGuiControls.instance.zOfEdges;
    let stringColor:string =  GlobalGuiControls.instance.edgeColor;
    let c= new THREE.Color(stringColor);
    let edgeColorAsInt = c.getHex();;

    let mismatchReported:boolean = false;
    
    this.variantsFilteredByGeneSet
    .filter(v => v && v.visible == true)
    .map(v => {
        if (!obj2dMapA.hasOwnProperty(v.a) || !obj2dMapB.hasOwnProperty(v.b)) {
          if(mismatchReported == false) {
            // This seems likely to be slow for large point clouds.
            if(!obj2dMapA.hasOwnProperty(v.a) ){
              console.log(`Mismatch in variantsOfRightTypeIfSelected.map, ${v.a} not seen in obj2dMapA.`);
            }
            if(!obj2dMapB.hasOwnProperty(v.b) ){
              console.log(`Mismatch in variantsOfRightTypeIfSelected.map, ${v.b} not seen in obj2dMapB.`);
            }
            mismatchReported = true;
          }
          return null;
        }

        let color = edgeColorAsInt;
        if(hasColorDecorator){
          color = colorMap.hasOwnProperty(v.a)
          ? colorMap[v.a].value
          : colorMap.hasOwnProperty(v.b)
            ? colorMap[v.b].value
            : 0xeeeeee;
        } else {
          // no color decorator. Try to use default colors for mut, and CNA.
          if(v.c) { color = v.c;}
        }

        const yPos = !hasGroupDecorator
          ? 0
          : groupMap.hasOwnProperty(v.a)
            ? groupY[groupMap[v.a].value]
            : groupMap.hasOwnProperty(v.b)
              ? groupY[groupMap[v.b].value]
              : 0;

        let line;
        if (hasGroupDecorator) {
          line = ChartFactory.lineAllocateCurve(
            color,
            obj2dMapA[v.a],
            obj2dMapB[v.b],
            new THREE.Vector2(0, yPos),
            groupDecorator.field.key,
            globalEdgeZ
          );
        } else {
          line = ChartFactory.lineAllocate(
            color,
            obj2dMapA[v.a],
            obj2dMapB[v.b],
            v,
            globalEdgeZ
          );
        }

        
        line.material.transparent = true;
        line.material.opacity = opacity; // 0.3;

        line.userData = v;
        return line;
      })
      .filter(v => v !== null)
      .forEach(edge => this.view.scene.add(edge));

      if(GlobalGuiControls.instance.edgeAutoOpacity) {
        let approxNumEdges:number = this.view.scene.children.length;
        let defaultOpacity:number = 0.45;
        if (approxNumEdges > 200) {
          defaultOpacity = 0.37;
        }
        if (approxNumEdges > 800) {
          defaultOpacity = 0.22;
        }
        if (approxNumEdges > 2000) {
          defaultOpacity = 0.18;
        }
        if (approxNumEdges > 3000) {
          defaultOpacity = 0.15;
        }
        if (approxNumEdges > 5000) {
          defaultOpacity = 0.1;
        }
        console.log(`defaultOpacity: ${defaultOpacity}.`);
        GlobalGuiControls.instance.edgeOpacity = defaultOpacity;
        this.updateAllOpacity( defaultOpacity * defaultOpacity );
      }
    let timeDiff = Date.now() - startTime;
    console.log(`TEMPNOTE: edge data.result loop = ${timeDiff} ms.`);
    // Center Line
    this.view.scene.add(
      ChartFactory.lineAllocate(
        0x039be5,
        new THREE.Vector2(0, -1000),
        new THREE.Vector2(0, 1000)
      )
    );

    renderer.clear();
    views.forEach(view => {
      renderer.setViewport(
        view.viewport.x,
        view.viewport.y,
        view.viewport.width,
        view.viewport.height
      );
      if(view.config.graph == GraphEnum.EDGES){
        startTime = Date.now();
        renderer.render(view.scene, view.camera);
        timeDiff = Date.now() - startTime;
        let numEdges = view.scene.children.length;
        console.log(`Edges rendered: ${numEdges} in ${timeDiff} ms, rate = ${numEdges / timeDiff} edges/ms.`);
      } else {
        renderer.render(view.scene, view.camera);
      }
    });
  }

  public setPrerenderDebounce(val:number) {
    this.drawEdgesDebounce = _.debounce(
      this.drawEdges, 
      GlobalGuiControls.instance.edgeDelayBeforeRender); 
  }

  preRender(
    views: Array<VisualizationView>,
    layout: WorkspaceLayoutEnum,
    renderer: THREE.WebGLRenderer
  ) {
    if (this.view.scene.children.length > 2) {
      this.view.scene.children = this.view.scene.children.splice(0, 2);
    }
    this.drawEdgesDebounce(views, layout, renderer);
  }

  public notifiedOfVariantChanges(reason:string){
  }

  create(
    entity: EntityTypeEnum,
    labels: HTMLElement,
    events: ChartEvents,
    view: VisualizationView
  ): ChartObjectInterface {
    // this.labels = labels;
    // this.events = events;
    this.view = view;
    this.drawEdgesDebounce = _.debounce(this.drawEdges, GlobalGuiControls.instance.edgeDelayBeforeRender); //150, was 600
    return this;
  }

  destroy() {
    // throw new Error('Method not implemented.');
  }

  constructor() {
    this.data = new EdgeDataModel();
    this.processNewData();
  }
}
