import { SelectionSphereController } from './../../../controller/selection/selection.sphere.controller';
import { GenomicEnum, ShapeEnum } from 'app/model/enum.model';
import * as THREE from 'three';
import { Vector3, Raycaster, Geometry } from 'three';
import { LabelController, LabelOptions } from './../../../controller/label/label.controller';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { VariantCheckbox, DataDecorator, DataDecoratorTypeEnum, DataDecoratorValue } from './../../../model/data-map.model';
import { EntityTypeEnum, WorkspaceLayoutEnum } from './../../../model/enum.model';
import { GraphEnum } from 'app/model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { EdgeConfigModel } from './../edges/edges.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory, DataDecoratorRenderer } from './../../workspace/chart/chart.factory';
import { AbstractVisualization } from './../visualization.abstract.component';
import { GenomeConfigModel, GenomeDataModel } from './genome.model';
import { DataService } from 'app/service/data.service';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { DataLoadedAction } from './../../../action/data.action';
import { GlobalGuiControls } from 'app/globalGuiControls';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { EdgesGraph } from '../edges/edges.graph';
import { CommonSidePanelComponent } from 'app/component/workspace/common-side-panel/common-side-panel.component';
import { OncoData } from 'app/oncoData';
import { initMillisecond } from 'ngx-bootstrap/chronos/units/millisecond';
import { AbstractScatterSelectionController } from './../../../controller/scatter/abstract.scatter.selection.controller';
import { ScatterSelectionLassoController } from './../../../controller/scatter/scatter.selection.lasso.controller';
import { Subscription } from 'rxjs';
import { Self } from '@angular/core';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';

export class GenomeGraph extends AbstractVisualization {
  public meshes: THREE.Object3D[] = [];
  private pointsAsArray3DObject: Array<THREE.Object3D>;
  public tads: Array<THREE.Object3D> = [];
  public chromosomes: Array<THREE.Object3D> = [];
  public meres: Array<THREE.Object3D> = [];
  public bands: Array<THREE.Object3D> = [];
  public selectionController: AbstractScatterSelectionController;
  private selectSubscription: Subscription;

  public set data(data: GenomeDataModel) {
    this._data = data;
  }
  public get data(): GenomeDataModel {
    return this._data as GenomeDataModel;
  }
  public set config(config: GenomeConfigModel) {
    this._config = config;
  }
  public get config(): GenomeConfigModel {
    return this._config as GenomeConfigModel;
  }


  // Just for selection controller support...
  private pointsMaterial: THREE.ShaderMaterial;
  private pointsGeometry = new THREE.BufferGeometry();
  private points: THREE.Points;
  private positionsFrame: Number;
  private positionsPrev: Float32Array;
  private positions: Float32Array;
  private colors: Float32Array;
  // private alphas: Float32Array;
  private shapes: Float32Array;
  private sizes: Float32Array;
  private selected: Float32Array;
  private ids: Array<string>;

  public notifyEdgeGraphOfSelectionChange(weKnowNothingIsInSelection:boolean) {
    let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
    if(edgesGraph){
      edgesGraph.softRequestLinkRegen();
    }
  }

  public regenLinks(){
    let eg = ChartScene.instance.views[2].chart as EdgesGraph;
    if(eg) {
      eg.hideAllLinks();
      eg.markLinkVisibilityOfSelected(true, null);
    }
    ChartScene.instance.render();
  }

  private makePoints(arrayOf3DObjects:Array<THREE.Object3D>){
    console.log('entered makepoints');
    this.ids = arrayOf3DObjects.map(v => v.userData.tooltip);

    let arrayPositionsCount:number = arrayOf3DObjects.length; 
    this.positionsPrev = new Float32Array(arrayPositionsCount * 3);
    this.positions = new Float32Array(arrayPositionsCount * 3);
    this.selected = new Float32Array(arrayPositionsCount);

    arrayOf3DObjects.forEach((point, index) => {
      let sprite:THREE.Sprite = point as THREE.Sprite;
      this.selected[index] = 0.0;

      // Gene is sprite inside group of sprite and line.
      // Position is parent (group) position, plus position? offset of sprite.

      let parentPos:Vector3 = sprite.parent.position;
      let spritePos:Vector3 = sprite.position;
      let x:number = parentPos.x + spritePos.x;
      let y:number = parentPos.y + spritePos.y;
      this.positionsPrev[index * 3 + 0] = x;
      this.positionsPrev[index * 3 + 1] = y;
      this.positionsPrev[index * 3 + 2] = 0;
      this.positions[index * 3 + 0] = x;
      this.positions[index * 3 + 1] = y;
      this.positions[index * 3 + 2] = 0;

      // for (let i = 0; i < 3; i++) {
      //   this.positionsPrev[index * 3 + i] = point[i];
      //   this.positions[index * 3 + i] = point[i];
      // }
    });

    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsGeometry.setAttribute('gPositionFrom', new THREE.BufferAttribute(this.positionsPrev, 3));
    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.pointsGeometry.setAttribute('gSelected', new THREE.BufferAttribute(this.selected, 1));

    let uniforms = Object.assign(
      { uAnimationPos: { value: this.positionsFrame } ,
        uMarkerBaseSize: {value: 10.0}}
      // AbstractScatterVisualization.textures
    );

    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      // vertexShader: vertShader, //vertShaderNoAttenuation, // vertShader,
      // fragmentShader: fragShader,
      // alphaTest: 0.5
    });

    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    this.points.userData['ids'] = this.ids;
  }


  // public onKeyPress(e: KeyboardEvent): void {}
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Meta') {
      if (this.isEnabled) {
        console.log('To fix: onKeyDown Meta, Genome');
        // this.view.renderer.domElement.style.setProperty('cursor', 'crosshair');
        // this.view.controls.enabled = false;
        // this.tooltipController.enable = false;
        // this.selectionController.setup(this.config, this.onRequestRender, this.onSelect, this.points);
        // this.selectionController.enable = true;
      }
    }
  }
  onKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Meta') {
      if (this.isEnabled) {
        console.log('To fix: onKeyUp Meta, Genome');
        // this.view.renderer.domElement.style.setProperty('cursor', 'default');
        // this.view.controls.enabled = true;
        // this.tooltipController.enable = true;
        // this.selectionController.enable = false;
        // this.selectionController.teardown();
      }
    }
  }

  // Override default, so we can adjust for the line from center to gene.
  public getTargetsFromMeshes(
    entityType: EntityTypeEnum
  ): Array<{ point: THREE.Vector3; id: string; idType: EntityTypeEnum }> {
    console.log(`in genome getTargetsFromMeshes`);
    return this.meshes.map((mesh,i) => {
      let _line:THREE.Line = mesh.children[0] as THREE.Line;
      let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0]; // unscaled!
      let adjustedPosition = new THREE.Vector3(
        mesh.position.x + (_lineStartPos.x * mesh.scale.x),
        mesh.position.y + (_lineStartPos.y * mesh.scale.y),
        0
      );
      if(mesh.userData.id == 'PIK3R1'){
        console.log(`#${i} PIK3R1 ${adjustedPosition.x.toPrecision(6)}, ${adjustedPosition.y.toPrecision(6)}.`);
      }
      return { point: adjustedPosition, id: mesh.userData.id, idType: entityType };
    });
    return null;
  }

  private _lastMouseDownEvent:ChartEvent;
  private _lastMouseDownMesh:THREE.Mesh;  // if true, we are dragging. TODO: make isDragging when we move to dragging list of genes.
  private _lastMouseDownMeshIndex:number =-1;;
  private _lastMouseDownMeshCirclePos:THREE.Vector3; // we will change .position of _lastMouseDownMesh as we move.
  private _lastMouseDownToCirclePos:THREE.Vector3; // we will change .position of _lastMouseDownMesh as we move.

  public onMouseUp(e: ChartEvent): void {
    this._lastMouseDownMesh = null;
    this._lastMouseDownMeshIndex = -1;
    console.log('Mouseup, _lastMouseDownMesh is now null.');

  }

  private _plane: THREE.Plane;
  private _intersectionVector:THREE.Vector3;
	private _worldPosition = new Vector3();
  private _inverseMatrix = new THREE.Matrix4();
  private _raycaster = new Raycaster();

  public onMouseDown(e: ChartEvent): void {
    super.onMouseDown(e);
    
    this._lastMouseDownEvent = e;
    let self = this;
    // TODO: do deselection here, once selection is implemented.

    if (this.tooltip === '') {
      return;
    }

    if (this.tooltip.toString().includes('&nbsp;|&nbsp;')){
      // It is a vertical bar, not a gene. TODO: add specific test, to avoid the brnach for the gene.
      return;
    }

    let x = e.event.clientX;
    if (this._config.graph === GraphEnum.GRAPH_B) {
      x -= this.view.viewport.width;
    }
    
    console.log(`TEMPNOTE: onMouseDown genomeGraph, tooltip [${this.tooltip}]`);
    console.log(`direct id lookup=${this.ids.indexOf(this.tooltip.toString())}> ====`);
    this._lastMouseDownMeshIndex = this.ids.indexOf(this.tooltip.toString());
    this._lastMouseDownMesh = this.meshes[this._lastMouseDownMeshIndex] as THREE.Mesh;

    let mesh:THREE.Mesh = this._lastMouseDownMesh;
    if(mesh){

      self._plane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 );
      self._plane.setFromNormalAndCoplanarPoint( 
        self.view.camera.getWorldDirection( this._plane.normal ), 
        this._worldPosition.setFromMatrixPosition( mesh.matrixWorld ) );

      this._lastMouseDownMeshCirclePos = new THREE.Vector3();
      let _line:THREE.Line = self._lastMouseDownMesh.children[0] as THREE.Line;
      let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0]; // unscaled!
      Object.assign(this._lastMouseDownMeshCirclePos, _lineStartPos);
      console.log(`Clicked [${this.tooltip}], which has circle pos [${JSON.stringify(_lineStartPos)}].`);

      console.log(`highlightIndexes ${this.selectionController.highlightIndexes.size}, selNon0 ${this.selected.map((v,i) => v>0 ? i : -1).filter(v => v>-1).length} `);
      let _domElement = self.view.renderer.domElement;
      let _mouse:any = {};
      let rect = _domElement.getBoundingClientRect();
      let x = e.event.clientX;
      let width = rect.width;
      if (this._config.graph === GraphEnum.GRAPH_B) {
        x -= this.view.viewport.width;
        x = x / 2;
        width = this.view.viewport.width / 2;
      }
      _mouse.x = ( ( x - rect.left ) / width ) * 2 - 1;
      _mouse.y = - ( ( e.event.clientY - rect.top ) / rect.height ) * 2 + 1;
      self._raycaster.setFromCamera( _mouse, self.view.camera );
      var intersects = new THREE.Vector3();
      let intersectPlaneResults = self._raycaster.ray.intersectPlane( self._plane, intersects);
      this._lastMouseDownToCirclePos = new THREE.Vector3(
        (mesh.position.x + (_lineStartPos.x * mesh.scale.x)) - intersectPlaneResults.x,
        (mesh.position.y + (_lineStartPos.y * mesh.scale.y)) - intersectPlaneResults.y,
        0
      );
      console.log(`_lastMouseDownToCirclePos ${this._lastMouseDownToCirclePos.x.toPrecision(3)} ${this._lastMouseDownToCirclePos.y.toPrecision(3)} }.`);
    } else {
      // TODO: clean up any old _lastMouseDownMesh issues?
      console.warn(`WARN, could not find mesh to match seeming gene of[${this.tooltip}].`);
    }

  }

  
  public onMouseMove(e: ChartEvent): void {
    // we'd prefer to hide tooltips when selecting.
    if((this.selectionController as ScatterSelectionLassoController).lassoState.isDrawing == false) {    //if(!this._lastMouseDownMesh) { // avoid tooltip updates
      super.onMouseMove(e);
    }

    let self = this;

    if(this._lastMouseDownMesh) {
//       // console.log(` oldx=${this._lastMouseDownEvent.mouse.x.toPrecision(5)} newx=${e.mouse.x.toPrecision(5)}`);
//       let mouseDiff = [ // x is percentage, xs is scaled to pixels.
//         e.mouse.x - this._lastMouseDownEvent.mouse.x,
//         e.mouse.y - this._lastMouseDownEvent.mouse.y,
//         e.mouse.xs - this._lastMouseDownEvent.mouse.xs,
//         e.mouse.ys - this._lastMouseDownEvent.mouse.ys
//       ]

//       let didMovePoints:boolean = false;
//       if(mouseDiff[0] != 0.0 || mouseDiff[1] != 0.0){
//         let _domElement = self.view.renderer.domElement;
//         let _mouse:any = {};
//         let rect = _domElement.getBoundingClientRect();

//         let x = e.event.clientX;
//         let width = rect.width;
//         if (this._config.graph === GraphEnum.GRAPH_B) {
//           x -= this.view.viewport.width; // ===>  / 2;
//           x = x / 2;
//           width = this.view.viewport.width / 2;
//         }
//         _mouse.x = ( ( x - rect.left ) / width ) * 2 - 1;
//         _mouse.y = - ( ( e.event.clientY - rect.top ) / rect.height ) * 2 + 1;

//         self._raycaster.setFromCamera( _mouse, self.view.camera );
//         var intersects = new THREE.Vector3();
//         let intersectPlaneResults = self._raycaster.ray.intersectPlane( self._plane, intersects);
//         if ( intersectPlaneResults ) { 
//           self._inverseMatrix.getInverse(  self._lastMouseDownMesh.parent.matrixWorld );
//           // console.warn(`INt.x${intersectPlaneResults.x.toPrecision(4)}, y${intersectPlaneResults.y.toPrecision(4)}`);
//         }

//         let diffX3d = (intersectPlaneResults.x - self._lastMouseDownMesh.position.x) - self._lastMouseDownMeshCirclePos.x;
//         console.log(`${intersectPlaneResults.x.toPrecision(3)}  ${self._lastMouseDownMesh.position.x.toPrecision(3)}  ${self._lastMouseDownMeshCirclePos.x.toPrecision(3)} dx: ${diffX3d .toPrecision(3)}.`);
//         let diffY3d = (intersectPlaneResults.y - self._lastMouseDownMesh.position.y) - self._lastMouseDownMeshCirclePos.y;
// //        console.log(`diffX3d ${diffX3d.toPrecision(6)}`);

//         // Move outer edge of line. children[0].vertices[0] = {x: -2, y: 0, z: 0},
//         // so make it relative to that.
//         let _line:THREE.Line = self._lastMouseDownMesh.children[0] as THREE.Line;
//         let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0];
//         _lineStartPos.setX(diffX3d + self._lastMouseDownMeshCirclePos.x);
//         _lineStartPos.setY(diffY3d + self._lastMouseDownMeshCirclePos.y);
//         (_line.geometry as Geometry).verticesNeedUpdate = true;

//         // Move sprite circle
//         self._lastMouseDownMesh.children[1].position.setX(_lineStartPos.x)
//         self._lastMouseDownMesh.children[1].position.setY(_lineStartPos.y)
//         //self._lastMouseDownMesh.children[1].position.setY(intersectPlaneResults.y)
//         //this._lastMouseDownMesh.position.setY(intersectPlaneResults.y)

//         // Move sprite in selection controller's memory.
//         //self._lastMouseDownMesh;
//         let index:number = 0;
//         self.positionsPrev[index * 3 + 0] = _lineStartPos.x;
//         self.positionsPrev[index * 3 + 1] = _lineStartPos.y;
//         self.positions[index * 3 + 0] = _lineStartPos.x;
//         self.positions[index * 3 + 1] = _lineStartPos.y;

//         ChartScene.instance.invalidatePrerender();
//         ChartScene.instance.render();
//       }
//       // Finished handling drag of gene. TODO: drag of genes.
    } else {
      let lassoController = this.selectionController as ScatterSelectionLassoController;
      if (lassoController.lassoState.isDrawing) {
        // Do no highlighting at this level
        console.log('ignoring mousemoves at graph level if lassoing');
      } else {
        let newSprite:any = null;
        if(this.tooltipController.lastHoverObject as THREE.Sprite) {
          newSprite = this.tooltipController.lastHoverObject;
        }

        if ((newSprite != this._lastMousedOver)) {

          if (this._lastMousedOver ) {
            this.mouseLeftGene(this._lastMousedOver);
            this._lastMousedOver = null;
            return;
          }
          
          if(newSprite != null ){
            this.mouseEnteredGene(newSprite);
            this._lastMousedOver = newSprite;
          }
        }
      }

    }

    //console.log(`TEMPNOTE: onMouseMove genomeGraph, tooltip [${this.tooltip}]`);
  }

  private _lastMousedOver: THREE.Sprite = null;
  private _lastcolor;

  private _geneIdFromSprite(sprite: THREE.Sprite){
    return sprite.userData.tooltip;
  }

  // Highlight a gene
  private mouseEnteredGene(sprite: THREE.Sprite) {
    if(sprite) {
      // console.log(`TEMPNOTE: handle entering gene [${sprite.userData.tooltip}]`);
      this._lastcolor = sprite.material["color"];
      // Need to highlight the gene's sprite. If it's dark, make it light, and vice versa.
      // The HSL lighten/darken approach has obsoleted genomeMouseoverHighlightColor.
      let hsl = {h:0, s:0, l:0};
      sprite.material.color.getHSL(hsl);
      // console.log('MJ - ensure dim/bright highlight in genome still works');
      if(hsl.l > 0.48) {
        hsl.l = 0.3;
      } else {
        hsl.l = 0.7;
      }
      let newColor:THREE.Color = new THREE.Color();
      newColor.setHSL(hsl.h, hsl.s, 0.3);
      sprite.material['color'] = newColor;
      sprite.material["opacity"] = 1.0;

      let eg = ChartScene.instance.views[2].chart as EdgesGraph;
      if(eg) {
        if (GlobalGuiControls.instance.edgeHideUnhovered) {
          let op = GlobalGuiControls.instance.edgeUnhoveredOpacity;
          eg.updateGraphAllBOpacity(op * op); // can set to 0 through GUI.
        }
        eg.updateGraphBMatchOpacity(1.0, this._geneIdFromSprite(sprite));
      }
      ChartScene.instance.render();
    }
  }

  // Unhighlight a gene
  private mouseLeftGene(sprite: THREE.Sprite) {
    if(sprite) {
      // console.log(`TEMPNOTE: handle leaving gene [${sprite.userData.tooltip}]`);
      sprite.material["color"] = this._lastcolor;
      sprite.material["opacity"] = GlobalGuiControls.instance.spriteOpacity;
      let eg = ChartScene.instance.views[2].chart as EdgesGraph;
      if(eg) {
        let opacity = GlobalGuiControls.instance.edgeOpacity * GlobalGuiControls.instance.edgeOpacity; // square it to stretch out the lower end.
        if (GlobalGuiControls.instance.edgeHideUnhovered) {
          eg.updateGraphAllBOpacity(opacity);
        } else {
          eg.updateGraphBMatchOpacity(opacity, this._geneIdFromSprite(sprite));
        }
      }
      ChartScene.instance.render();
    }
  }

  private _edgeConnectionType:string = 'None';

  //renderer(item, mesh, decorators, i, count);
  renderer: DataDecoratorRenderer = (group: THREE.Group, mesh: THREE.Sprite, decorators: Array<DataDecorator>, i:number): void => {

    // const lineMat = new THREE.LineBasicMaterial({ // was 
    //   color: mesh.material['color'].getHex()
    // });
    let scaledGeneLeftRightOffset = GlobalGuiControls.instance.geneLeftRightOfffset * ((mesh.scale.x) / 3.0)
    if (i % 2 == 1) {
      scaledGeneLeftRightOffset = -scaledGeneLeftRightOffset;
    }
    mesh.position.setX(scaledGeneLeftRightOffset);// was this.geneLeftRightOfffset);

    const lineMat = new THREE.LineDashedMaterial({ // was 
      color:  0xD1D1D1, // mesh.material['color'].getHex(),
      dashSize: GlobalGuiControls.instance.geneLineDashSize,
      gapSize: GlobalGuiControls.instance.geneLineGapSize
    });    
    const lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(new THREE.Vector3(scaledGeneLeftRightOffset, 0, 0), new THREE.Vector3(0, 0, 0));
    const line = new THREE.Line(lineGeom, lineMat);
    line.computeLineDistances();
    group.add(line);
    // tslint:disable-next-line:semicolon
  };

  chromosomeToNumber(chromosome: string, x: boolean = true): number {
    let rv = parseInt(chromosome, 10);
    if (isNaN(rv)) {
      rv = chromosome.toLowerCase() === 'x' ? 23 : 24;
    }
    return x ? rv * 20 : rv;
  }

  updatedEdgeConfig(edgeConfig: EdgeConfigModel) {
    super.updatedEdgeConfig(edgeConfig);
    if(this.config && this.config.graph) {
      console.log(`TEMPNOTE: updatedEdgeConfig in Genome, from view [${this.config.graph}].`);
      this._edgeConnectionType = edgeConfig.field.key;
      this.recreate();
    } else {
      console.warn(`TEMPNOTE: Should we be worried? Failure in updatedEdgeConfig in Genome, from view [${this.config.graph}].`);
    }
  }

  adjustPoints() {
    // console.log('This is adjustPoints in genome.graph.');
    let positionAttrib:THREE.BufferAttribute = this.selectionController.points.geometry['attributes']['position'];
    // console.log(`Size of positionBuffer ${positionAttrib ? positionAttrib.count : 'ERROR'}.`);
    console.log(`hilites ${this.selectionController.highlightIndexes.size}`);
    let highlightedObjectIndexes:Array<number> = Array.from(this.selectionController.highlightIndexes);
    highlightedObjectIndexes
      .map(v => v/3)
      .map(v => {
        let mesh:THREE.Mesh = (this.meshes[v] as THREE.Mesh);
        let newX = positionAttrib.getX(v);
        let newY = positionAttrib.getY(v);
        let offsetX = newX - mesh.position.x;
        let offsetY = newY - mesh.position.y;
        // Adjust sprite
        mesh.children[1].position.setX(offsetX);
        mesh.children[1].position.setY(offsetY);
        // // Adjust line start
        // let geo:THREE.Geometry = ((mesh.children[0] as THREE.Line).geometry as Geometry);
        // let lineStartVertex = geo.vertices[0]; 
        // lineStartVertex.setX(offsetX);
        // lineStartVertex.setY(offsetY);

        // Move outer edge of line. children[0].vertices[0] = {x: -2, y: 0, z: 0},
        // so make it relative to that.
        let _line:THREE.Line = mesh.children[0] as THREE.Line;
        let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0];
        _lineStartPos.setX(offsetX); //diffX3d + self._lastMouseDownMeshCirclePos.x);
        _lineStartPos.setY(offsetY); //diffY3d + self._lastMouseDownMeshCirclePos.y);
        (_line.geometry as Geometry).verticesNeedUpdate = true;

        // geo.verticesNeedUpdate = true;
      });

    // Creating new targets array, might be wasteful of memory?
    this.tooltipController.targets = this.bands.concat(this.pointsAsArray3DObject);

    ChartScene.instance.invalidatePrerender();
    ChartScene.instance.render();
}

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    super.updateDecorator(config, decorators);
    ChartFactory.decorateDataGroups(this.meshes, this.decorators, this.renderer);
    this.pointsAsArray3DObject = this.setGeneSpritesColorAndMutSize();
    this.selectionController.targets = this.pointsAsArray3DObject;
    this.selectionController.funcAfterControllerAdjustsPoints = this.adjustPoints;

    console.log(`called setGeneSpritesColorAndMutSize, ${this.pointsAsArray3DObject.length} results.`)
    let self = this;
    decorators.forEach(decorator => {
      switch (decorator.type) {
        case DataDecoratorTypeEnum.SELECT:
          this.notifyEdgeGraphOfSelectionChange(decorator.values.length == 0);

          const indices = decorator.values.map(datum => {
            return self.ids.findIndex(v => v === datum.mid); // NOTE: mid
          });
          const gSel = this.pointsGeometry.attributes.gSelected;
          const geneHilightColor = new THREE.Color('orange');
          // zero it out
          let l = gSel.array.length;
          for(let i=0; i < l; i++){
            if(gSel.getX(i)==1){
              // set gene sprite to userData['originalColor'].
              try {
                let sprite = (self.meshes[i].children[1] as THREE.Sprite);
                let origColor = sprite.userData["originalColor"];
                if(origColor as THREE.Color){
                sprite.material.color = origColor;
                } else {
                  console.warn('COLOR broken. i ' + i);
                }
              } catch (err) {
                console.error(err);
              }
            }
            gSel.setX(i, 0);
          }
          indices.forEach(v => {
            try {
              let sprite = (self.meshes[v].children[1] as THREE.Sprite);
              sprite.material.color = geneHilightColor;
              gSel.setX(v, 1);
            } catch (err) {
              console.error(err);
            }
          });
          console.log('hilite '+ indices.toString());
          //self.pointsGeometry.attributes.gSelected.needsUpdate = true; // ignored for GenomeGraph

          console.log('=== not going to adjustGeneSpriteFromZoom in updateDecorator');
          // this.adjustGeneSpriteFromZoom(this.lastZoomLevelFromAdjustment);

          ChartScene.instance.render();
          break;
      }
    });    

    console.warn('Genome end of updateDecorator');
    // this.selectionController.points = this.points;
    // this.selectionController.tooltips = this.ids.map(v => {
    //   return [{ key: 'id', value: v }];
    // });
    this.onShowLabels();
  }

  updateData(config: GraphConfig, data: any) {
    let oldMarkerFilter = this._config ? this._config.markerFilter : [];
    super.updateData(config, data);
    if(oldMarkerFilter != config.markerFilter){
      this.variantsFilteredByGeneSet = null;
    }
    this.recreate();
  }

  public recreate() {
    console.log(`Genomegraph recreate. 1st overlay=[${ this.config.firstGenesetOverlay}].`);
    console.log(`Genomegraph recreate. 2nd overlay=[${ this.config.secondGenesetOverlay}].`);
    this.removeObjects();
    this.addObjects();
  }

  public geneXyzOffsets:Map<string, Vector3> = new Map();

  create(entity: EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    let self = this;
    super.create(entity, labels, events, view);
    this.canRegenLinks = true; // Genome does the work to create links to, say, scatter chart.
    this.selectionController = new ScatterSelectionLassoController(this.entity, view, events);
    this.selectionController.setEverCanRotateFlag(false);
    this.selectionController.enable = true;
    this.selectionController.funcAfterControllerAdjustsPoints = this.adjustPoints;
    (this.selectionController as ScatterSelectionLassoController).defaultToolForMultiSelection = 'RECTANGLE';

    this.selectSubscription = this.selectionController.onSelect.subscribe((data) => {
      console.log(`Genome selection subscribe event, ${data.ids.length} selected.`);
      let source: any = data.source; // we expect this is always "Selection", not "Cohort".
      let idList:Array<any> = self.points.userData['ids'];  // any should be string?
      self.selected.fill(0);

      // Save current offsets in geneXyzOffsets. Apply it later 
      self.geneXyzOffsets.clear();
      let positionAttrib:THREE.BufferAttribute = (((self.points.geometry as Geometry) as unknown) as THREE.BufferGeometry).attributes['position'] as THREE.BufferAttribute;

      const values: Array<DataDecoratorValue> = data.ids
        .map(v => v / 3)
        .map(v => {
          self.selected[v] = 1;
          if(idList[v]){
            return {
              pid: null, //this._data.pid[v],
              sid: null, //this._data.sid[v],
              mid: idList[v],
              key: EntityTypeEnum.GENE,
              value: true,
              label: ''
            };
          } else {
            console.log('!!!!!!! no idList[v]');
          }
        });

        // Add data for this gene, by gene id. 
        // Further calls to GenomeCompute might filter out some genes, or add some,
        // so we must go by id lookup, and not index numbers.
        for (let i=0; i<positionAttrib.count; i++){        
          let geneName = self.ids[i];
          let currentCoords:Vector3 = new Vector3(
            positionAttrib.getX(i),
            positionAttrib.getY(i),
            0);
          self.geneXyzOffsets.set(geneName, currentCoords);
          //console.log(`geneXyzOffsets.size = ${this.geneXyzOffsets.size }.`);
        }

        const dataDecorator: DataDecorator = {
        type: DataDecoratorTypeEnum.SELECT,
        values: values,
        field: null,
        legend: null,
        pidsByLabel: null
      };
      WorkspaceComponent.addDecorator(this._config, dataDecorator);
      // TBD: support something like ... window.setTimeout(() => self.signalCommonSidePanel(idList, source, EntityTypeEnum.GENE), 50);
    });
    this.tooltipController.targets = this.bands;
    this.lastZoomDistance = view.camera.position.length(); // MJ
    this.originalZoomDistance = this.lastZoomDistance;
    return this;
  }
  
  adjustGraphDetailsBasedOnZoomChange(oldZoom:number, newZoom:number, addHistory:boolean) {
    console.warn('Genome view should add zoom history ??');
    let sc = this.selectionController ;
    if(addHistory){
      // sc.addZoomHistory(oldZoom, newZoom);
    }
    this.adjustGeneSpriteFromZoom( this.originalZoomDistance / newZoom); // this.view.camera.position.length()); // 1000
  }

  destroy() {
    super.destroy();
    console.log('genomeGraph destroy.');
    if(this.selectionController){
      this.selectionController.destroy();
    }
    if (this.selectSubscription) {
      if (!this.selectSubscription.closed) {
        this.selectSubscription.unsubscribe();
      }
    }
    this.removeChromosomes();
    this.removeTads();
    this.removeGenes();
  }

  enable(truthy: boolean) {
    super.enable(truthy);
  }

  preRender(views: VisualizationView[], layout: WorkspaceLayoutEnum, renderer: THREE.Renderer): void {
    super.preRender(views, layout, renderer);
  }
  
  addObjects() {
    if (this.chromosomes.length === 0) {
      this.addChromosomes();
    }
    if (this.config.showTads) {
      this.addTads();
    }
    this.addGenes();
    ChartFactory.configPerspectiveOrbit(
      this.view,
      new THREE.Box3(new THREE.Vector3(-400, -200, -5), new THREE.Vector3(400, 200, 5))
    );

    console.warn('Genome addObjects, setting selController points');
    // this.selectionController.points = this.points;
    // this.selectionController.tooltips = this.ids.map(v => {
    //   return [{ key: 'id', value: v }];
    // });
    requestAnimationFrame(v => {
      this.onShowLabels();
    });
  }

  removeObjects() {
    if (this.chromosomes.length === 0) {
      this.removeChromosomes();
    }
    if (!this.config.showTads) {
      this.removeTads();
    }
    this.removeGenes();
  }

  addChromosomes() {
    const data = this.data;
    const telomereColor = 0; // 0x0091ea;
    const telomereSize:number = 0.3;
    const centromereColor = 0; // 0xcccccc;  // light gray
    const centromereSize:number = 0.8;
    data.chromo.forEach(chromosome => {
      const xPos = this.chromosomeToNumber(chromosome.chr);

      // Centromere
      const centro: THREE.Mesh = ChartFactory.meshAllocate(
        centromereColor,
        ShapeEnum.CIRCLE,
        centromereSize,
        new THREE.Vector3(xPos - 230, 0, 0),
        {}
      );
      centro.userData.tooltip = chromosome.chr;
      this.meres.push(centro);
      this.view.scene.add(centro);

      // Tele Q
      const teleQ: THREE.Mesh = ChartFactory.meshAllocate(
        telomereColor,
        ShapeEnum.CIRCLE,
        telomereSize,
        new THREE.Vector3(xPos - 230, chromosome.Q - chromosome.C, 0),
        {}
      );
      teleQ.userData.chr = chromosome.chr;
      teleQ.userData.type = GenomicEnum.Q_TELOMERE;
      teleQ.userData.tooltip = chromosome.chr + 'q'; // Telemere
      this.meres.push(teleQ);
      this.view.scene.add(teleQ);

      // Tele P
      const teleP: THREE.Mesh = ChartFactory.meshAllocate(
        telomereColor,
        ShapeEnum.CIRCLE,
        telomereSize,
        new THREE.Vector3(xPos - 230, chromosome.P - chromosome.C, 0),
        {}
      );
      teleP.userData.chr = chromosome.chr;
      teleP.userData.type = GenomicEnum.P_TELOMERE;
      teleP.userData.tooltip = chromosome.chr + 'p'; // Telemere
      this.meres.push(teleP);
      this.view.scene.add(teleP);
    });

    data.bands.forEach((band, i) => {
      let yPos = 0;
      const xPos = (i + 1) * 20 - 230;
      band.forEach(cyto => {
        const centro = data.chromo[i].C;
        const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(0.5, cyto.l);
        const material: THREE.MeshBasicMaterial = ChartFactory.getColorPhong(cyto.c);
        const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
        mesh.userData.type = GenomicEnum.CYTOBAND;
        mesh.position.set(xPos, yPos + cyto.l / 2 - centro, 0);
        mesh.userData.color = cyto.c;
        mesh.userData.tooltip =
          cyto.chr +
          cyto.arm.toLowerCase() +
          (cyto.subband ? '.' + cyto.subband : '') +
          '&nbsp;|&nbsp;' +
          cyto.tag.replace('neg', '-').replace('pos', '+');
        yPos += cyto.l;
        this.bands.push(mesh);
        this.view.scene.add(mesh);
      });
    });
  }

  addTads() {
    const data = this.data;
    let z = GlobalGuiControls.instance.zOfGenomeGenes;
    data.tads.forEach(tad => {
      const chr = this.chromosomeToNumber(tad.chr, false);
      const xPos = chr * 20 - 230;
      const centro = data.chromo[chr - 1].C;
      const line = ChartFactory.lineAllocateCurve(
        0x9c27b0,
        new THREE.Vector2(xPos, tad.s - centro),
        new THREE.Vector2(xPos, tad.e - centro),
        new THREE.Vector2(xPos + 20 * 0.2, Math.abs(tad.e - tad.s) * 0.5 + tad.s - centro),
        tad,
        z
      );
      this.tads.push(line);
      this.view.scene.add(line);
    });
  }
  // {name: 'Mutation', completed: true, color: '#9C27B0'},
  // {name: 'Amplification', completed: true, color: '#3F51B5'} ,
  // {name: 'Gain', completed: true, color: '#3fa5b5'} ,
  // {name: 'Loss', completed: true, color: '#f26602'},
  // {name: 'Deletion', completed: true, color: '#ff0000'},


  public updateGenesizeFromVariantCheckbox(variantCheckbox:VariantCheckbox){
    console.log('- - - - - updateGenesizeFromVariantCheckbox');
  }

  public static variantColors = {
    Mutation: 0x9C27B0,
    // // blue to red
    // Amp: 0x3F51B5,
    // Amplification: 0x3F51B5, // same as Amp
    // Gain: 0x3fa5b5,
    // Loss: 0xf26602,
    // Deletion: 0xff0000    

    // red to blue
    Amplification: 0xff0000, // same as Amp
    Gain: 0xf26602,
    Loss: 0x3fa5b5,
    Deletion: 0x3F51B5
  }

  addEdgesFromVariantArray(isCNA:boolean, edges:Array<any>, variants:Array<{m:string,s:string,t:string}>){
    let cfg = this.config;
    variants.map(v => {
      let edge = {
        a: this._entityA === EntityTypeEnum.GENE ? v.m : v.s,
        b: this._entityB === EntityTypeEnum.GENE ? v.m : v.s,
        c: isCNA ? GenomeGraph.variantColors[v.t]
          : GenomeGraph.variantColors.Mutation,
        i: v.t,
        isCNA: isCNA
      }
      edges.push(edge);
    });
  }

  public variantsFilteredByGeneSet:Array<any>  = null;
  cnaFound:boolean = false;
  cnaCount:number = 0;
  mutFound:boolean = false;
  _entityA:EntityTypeEnum;
  _entityB:EntityTypeEnum;

  public filterGenesForEdges(entityA:EntityTypeEnum, entityB:EntityTypeEnum, edgeTypeKey:string){
    this._entityA = entityA;
    this._entityB = entityB;
    let variantsOfRightType:Array<any>;

    // Do our local caching, etc.
    // 1. Get all variants (CNA and then mut), for all genes.
    if (OncoData.instance.variantsEdgeArray == null) {
      this.cnaFound = false;
      this.cnaCount = 0;
      this.mutFound = false;
      
      this.variantsFilteredByGeneSet = null;
      let edgeArray = [];
      if (OncoData.instance.cnaRecords) {
        this.addEdgesFromVariantArray(true, edgeArray, OncoData.instance.cnaRecords );
        this.cnaFound = edgeArray.length > 0;
        this.cnaCount = edgeArray.length;
      }
      if (OncoData.instance.mutationRecords) {
        this.addEdgesFromVariantArray(false, edgeArray, OncoData.instance.mutationRecords );
        this.mutFound = true;
      }
      OncoData.instance.variantsEdgeArray = edgeArray;
    }
    let rawResults = OncoData.instance.variantsEdgeArray;

    // 2. Filter by gene set.
    if (this.variantsFilteredByGeneSet == null) {
      if(this.config.markerFilter == []) {
        this.variantsFilteredByGeneSet=rawResults;
      } else {
        let geneSet = new Set(this.config.markerFilter);
        this.variantsFilteredByGeneSet = rawResults.filter(v => geneSet.has(v.b));
      }
    }

    console.log('check edgeTypeKey.');

    // 3. Filter by the key.
    if(edgeTypeKey == null) { // return all cnas and muts.
      return this.variantsFilteredByGeneSet;
    }
    if(edgeTypeKey == 'None') {
      variantsOfRightType = [];
    } else {
      console.error('=========== unexpected edgeTypeKey');
      if(edgeTypeKey == 'All Point Mutations' && this.mutFound) {
        // All mutations are right after the end of the CNA variants.
        // let startOfMutations:number = cnaCount-1+1;
        // this is fast but wasteful: variantsOfRightType = this.variantsFilteredByGeneSet.slice(startOfMutations);
        let cnaSet = new Set(['Amp','Gain','Loss','Deletion']);
        variantsOfRightType = this.variantsFilteredByGeneSet.filter(
          v => cnaSet.has(v.i) == false);
      } else {
        variantsOfRightType = this.variantsFilteredByGeneSet.filter(v => v.i == edgeTypeKey);
      }
    }

    // set up "visible" setEverCanRotateFlag
    variantsOfRightType.map( v => {
      v.visible = false;
    });
    return variantsOfRightType;
  }

  public variationRecords:Array<{a:string,b:string,c:string,i:string,isCNA:boolean;visible:boolean}>;
  public largestVariationCount:number = 1;
  public variationMap = new Map();

  public recalcGeneSizesAndRender(variantCheckbox:VariantCheckbox){
    // if variantCheckbox is null, don't filter by it.
    let self = this;
    self.variationRecords = this.filterGenesForEdges(
      EntityTypeEnum.SAMPLE,
      EntityTypeEnum.GENE, null); 

    let variantSet;
    let acceptAllVariants;
    let acceptMutation;
    // When first loading GenomeGraph, this may be called with null variantCheckbox.
    if(variantCheckbox && variantCheckbox.subtasks){
      variantSet = new Set(variantCheckbox.subtasks
        .filter(v => v.completed).map(v => v.name == 'Amplification' ? 'Amp' : v.name));
      acceptAllVariants = variantSet.size == variantCheckbox.subtasks.length;
      acceptMutation = variantSet.has('Mutation');
    } else {
      acceptAllVariants = true;
    }
    let adjustSize:boolean = self.variationRecords && self.variationRecords.length > 0;
    let startTime = Date.now();
    if (adjustSize) {
      this.variationMap.clear();
      // Calculate any global values needed first, such as max number of mutations per sample?
      // TODO: get a map of selected samples. For the moment, assume ALL samples./
      // TODO: Get a Map of genes in current gene set?
      console.log(`Gene count out of filterGenesForEdges = ${self.variationRecords.length}.`);
      if (this.config.graph == GraphEnum.GRAPH_B) {
        // a=sample id, b=gene name
        self.variationRecords.map( v => {
          if(acceptAllVariants || variantSet.has(v.i) || (acceptMutation && v.isCNA == false)) {
            if (self.variationMap.has(v.b)) {
              self.variationMap.set(v.b, self.variationMap.get(v.b)+1)
            } else {
              self.variationMap.set(v.b, 1)
            }
          }
        });
      } else {
        // b=sample id, a=gene name
        self.variationRecords.map( v => {
          if(acceptAllVariants || variantSet.has(v.i) || (acceptMutation && v.isCNA == false)) {
            if (self.variationMap.has(v.a)) {
              self.variationMap.set(v.a, self.variationMap.get(v.a)+1)
            } else {
              self.variationMap.set(v.a, 1)
            }
          }
        });
      }
      let endDiff = Date.now() - startTime;
      //console.log(`MutationMap built in ${endDiff} ms. ... `);
      //console.dir(self.variationMap);
      let vals = Array.from(self.variationMap.values());
      self.largestVariationCount = Math.max(1, Math.max(...vals));
    }
    this.pointsAsArray3DObject = this.setGeneSpritesColorAndMutSize();
    console.log(`zoom ${(this.view.camera as THREE.OrthographicCamera).zoom}`);
    let dist:number = this.view.controls.target.distanceTo(this.view.controls.object.position)
    let zoom:number = 1000.0 / dist;
    console.log(`=== in addGenes, adjustGeneSpriteFromZoom to ${zoom}.`);
    this.adjustGeneSpriteFromZoom(zoom);

    ChartScene.instance.invalidatePrerender();
    ChartScene.instance.render();
  }


  async addGenes() {
    let self = this;
    const data = this.data;
    let z:number = GlobalGuiControls.instance.zOfGenomeGenes;
    let startTime = Date.now(); let endDiff;
    let useOverlayColor:boolean = (
      this.config.firstGenesetOverlay.g.length > 0 
      || this.config.secondGenesetOverlay.g.length > 0 
    );
    let firstOverlayGenesAsSet:Set<string>;
    let secondOverlayGenesAsSet:Set<string>;
    if (useOverlayColor){
      firstOverlayGenesAsSet = new Set(this.config.firstGenesetOverlay.g);
      secondOverlayGenesAsSet = new Set(this.config.secondGenesetOverlay.g);
    }
    let overlayFirstColorAsNum:number = new THREE.Color('fuchsia').getHex();
    let overlaySecondColorAsNum:number = new THREE.Color('yellow').getHex();
    let overlayBothColorAsNum:number = new THREE.Color('olive').getHex();

    Object.keys(data.genes).forEach(chromosome => {
      const chr = this.chromosomeToNumber(chromosome, false);
      const xPos = chr * 20 - 230;
      const centro = data.chromo[chr - 1].C;
      data.genes[chromosome].forEach(gene => {
        const group = ChartFactory.createDataGroup(
          gene.gene,
          EntityTypeEnum.GENE,
          new Vector3(xPos, gene.tss - centro, z)
        );

        group.userData.tooltip = gene.gene;
        if(useOverlayColor) {
          // figure out if just first overlay applies, or if second one does.
          let in1stOverlay:boolean = firstOverlayGenesAsSet.has(gene.gene);
          let in2ndOverlay:boolean = secondOverlayGenesAsSet.has(gene.gene);
          if(in1stOverlay && in2ndOverlay) {
            group.userData.genesetOverlayColor = overlayBothColorAsNum;
          } else {
            if(in1stOverlay) {
              group.userData.genesetOverlayColor = overlayFirstColorAsNum;
            } else {
              if(in2ndOverlay) {
                group.userData.genesetOverlayColor = overlaySecondColorAsNum;
              } else {
                
              }
            }
          }
        }

        this.meshes.push(group);
        this.view.scene.add(group);
      });
    });
    endDiff = Date.now() - startTime;
    console.log(`Gene chr loop in ${endDiff} ms for ${data.genes.length} genes. `);
    startTime = Date.now();
    ChartFactory.decorateDataGroups(this.meshes, this.decorators, this.renderer);
    endDiff = Date.now() - startTime;
    console.log(`Genome ChartFactory.decorateDataGroups = ${endDiff} ms for ${data.genes.length} genes. `);


    console.log(`In addGenes before mutations call, type=${this._edgeConnectionType}.`);
    await GenomeGraph.mutations(this._edgeConnectionType).then();
    {
      console.log('got mutations');
      

      self.variationRecords = this.filterGenesForEdges(
        EntityTypeEnum.SAMPLE,
        EntityTypeEnum.GENE, this._edgeConnectionType); // null means all muts and all cnas.

      this.recalcGeneSizesAndRender(null);

      this.makePoints(this.pointsAsArray3DObject);
      this.selectionController.points = this.points;
  

      this.tooltipController.targets = this.bands.concat(this.pointsAsArray3DObject);
    }

  }

  private setGeneSpritesColorAndMutSize():THREE.Object3D[]{
    let self = this;

    let vals = Array.from(self.variationMap.values());
    let currentLargestVariationCount = Math.max(1, Math.max(...vals));

    let results = this.meshes.map(v => {
      let sprite:THREE.Sprite = v.children[1] as THREE.Sprite;
      let tooltip = v.userData.tooltip;
      sprite.userData.tooltip = tooltip;

      // Check geneXyzOffsets for this gene, adjust location.
      let xyz = self.geneXyzOffsets.get(tooltip);
      if(xyz){
        let offsetX:number = xyz.x - sprite.parent.position.x;
        let offsetY:number = xyz.y - sprite.parent.position.y;
        sprite.position.setX(offsetX);
        sprite.position.setY(offsetY);

        let _line:THREE.Line = v.children[0] as THREE.Line;
        let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0];
        _lineStartPos.setX(offsetX); //diffX3d + self._lastMouseDownMeshCirclePos.x);
        _lineStartPos.setY(offsetY); //diffY3d + self._lastMouseDownMeshCirclePos.y);
        (_line.geometry as Geometry).verticesNeedUpdate = true;

      }
      sprite.userData['originalColor'] = sprite.material.color;
      if (self.variationRecords && self.variationRecords.length > 0) { // if adjust size
        let numVariations = Math.max(5, self.variationMap.get(tooltip));
        if(numVariations) {
          let percentOfMax = numVariations / currentLargestVariationCount; // WASself.largestVariationCount;
          let logNum = Math.log10(100*(percentOfMax+0.001))*4; // from 0 to 8, log-scaled
          let cappedSize = Math.min(logNum, 4); // was 10
          let size:number = 2.0 + cappedSize; // was 2.0
          sprite.userData['mutationSize'] = size;
          sprite.scale.set(4+size*1.0, 4+size*1.0, 1); // was v.scale
        }
      }
      // Creating new targets array, might be wasteful of memory?
      this.tooltipController.targets = this.bands.concat(this.pointsAsArray3DObject);
      return v.children[1];
    });
    return results;
  }

  public lastZoomLevelFromAdjustment:number = 1;

  public adjustGeneSpriteFromZoom(zoomLevel:number){
    try {
      this.lastZoomLevelFromAdjustment = zoomLevel;
      this.view.scene.children.filter(v => v.userData.idType == 'Genes')
      .map(v => {
        let sprite:THREE.Sprite = v.children[1] as THREE.Sprite;
        let size:number = sprite.userData['mutationSize'];
        if (size == null) { // we haven't filtered by edge type yet?
          size = 3;
        }
        sprite.scale.set((size*1.5)/zoomLevel, (size*1.5)/zoomLevel, 1); // was v.scale
        //sprite.position.set(leftRightOffset,0,0);
        
      });
      ChartScene.instance.invalidatePrerender();
      ChartScene.instance.render();
    } catch (err) {
      console.error('Bad failure in adjustGeneSpriteFromZoom. ')
    }
  }

  public static mutations (edgeType: string) : Promise<Array<any>> {
    console.log('in _mutations_');
    return new Promise(resolve => {
      let dla:DataLoadedAction = OncoData.instance.dataLoadedAction;
      if (dla.datasetDesc.hasMutations) {
        let mutationRecords:Array<any> = [];
        let promiseForMuts:Promise<any> = null;
        if (OncoData.instance.mutationRecords) {
          mutationRecords = OncoData.instance.mutationRecords;
        } else {
          let tbl:string = 'mut'; // MJ TODO check by type
          promiseForMuts = DataService.instance.getMutationData('notitia-' + dla.dataset, tbl);
        }
        Promise.all([promiseForMuts]).then(stuff => {
          console.log('Got promiseForMuts result.');
          if (promiseForMuts != null ) {
            // If we had to run the db promise, take its results.
            // Otherwise, we're using stored mutationRecords.
            mutationRecords = stuff[0];
          }
          if(OncoData.instance.mutationRecords == null) {
            OncoData.instance.mutationRecords = mutationRecords; // cache it
          }
          if(OncoData.instance.currentCommonSidePanel)
          {
            OncoData.instance.currentCommonSidePanel.notifyGraphsOfVariantChanges('mutationRecords');
          } 
         
          let filteredRecords;
          if (edgeType == 'None'){
            filteredRecords = mutationRecords; // To allow scaling of gene circles, though edges won't appear.
          } else {
            // TBD: Filter by current selection.
            if (edgeType == 'All Point Mutations'){
              filteredRecords = mutationRecords; // To allow scaling of gene circles, though edges won't appear.
            } else {
              filteredRecords = mutationRecords.filter(v => v.t == edgeType);
            }
          }
          resolve(filteredRecords);
        });
      } else {
        resolve([]); // no mutations
      }
    });
  }

  public notifiedOfVariantChanges(reason:string){
    console.log(`In genome, notifiedOfVariantChanges because ${reason}. `);
    // CommonSidePanelComponent already nulls out OncoData.instance.variants.
    this.variantsFilteredByGeneSet = null;
  }

  removeChromosomes() {
    this.view.scene.remove(...this.chromosomes);
    this.view.scene.remove(...this.meres);
    this.view.scene.remove(...this.bands);
    this.chromosomes.length = 0;
    this.meres.length = 0;
    this.bands.length = 0;
  }
  removeTads() {
    this.view.scene.remove(...this.tads);
    this.tads.length = 0;
  }
  removeGenes() {
    this.view.scene.remove(...this.meshes);
    this.meshes.length = 0;
  }

  onShowLabels(): void {
    const zoom = this.view.camera.position.z;

    // The meres all have tooltips. Only the p and q meres have "chr",
    // so if a mere doesn't have that, it is a chromosome label ("1", "2"...).
    let meresQP:THREE.Object3D[] = this.meres.filter(v => v.userData["chr"]);
    let meresChr:THREE.Object3D[] = this.meres.filter(v => v.userData["chr"] == null);

    let labelOptionsQP, labelOptionsChr;
    let htmlQP, htmlChr;
    if (zoom > 600) {
      labelOptionsQP = new LabelOptions(this.view, 'PIXEL');

      labelOptionsChr = new LabelOptions(this.view, 'PIXEL');
      labelOptionsChr.fontsize = 12;
      labelOptionsChr.fontweight = "900";

      // labelOptions.offsetX3d = -2;
      // labelOptions.align = 'RIGHT';
      htmlQP = LabelController.generateHtml(meresQP, labelOptionsQP);
      htmlChr = LabelController.generateHtml(meresChr, labelOptionsChr);
      this.labels.innerHTML = htmlQP + htmlChr;;
    } else {
      labelOptionsQP = new LabelOptions(this.view, 'FORCE');
      labelOptionsQP.offsetX3d = -4;
      // labelOptions.offsetY3d = 1;
      labelOptionsQP.align = 'RIGHT';
      labelOptionsQP.maxLabels = 500;
      // labelOptions.offsetX = -30;
      htmlQP = LabelController.generateHtml(meresQP, labelOptionsQP);
      htmlChr = LabelController.generateHtml(meresChr, labelOptionsQP);

      let labelOptionsLeftGenes = new LabelOptions(this.view, 'FORCE' ); //'FORCE');
      labelOptionsLeftGenes.offsetX3d = -1;
      labelOptionsLeftGenes.offsetY3d = 3;
      labelOptionsLeftGenes.align = 'RIGHT';
      labelOptionsLeftGenes.maxLabels = 1000;
      // labelOptions.offsetX = -30;

      let labelOptionsRightGenes = new LabelOptions(this.view, 'FORCE' ); //'FORCE');
      labelOptionsRightGenes.offsetX3d = 1;
      labelOptionsRightGenes.offsetY3d = 3;
      labelOptionsRightGenes.align = 'LEFT';
      labelOptionsRightGenes.maxLabels = 1000;
      // labelOptions.offsetX = -30;

      this.meshes.map(v => {
        let _line:THREE.Line = v.children[0] as THREE.Line;
        let _lineStartPos:THREE.Vector3 = (_line.geometry as THREE.Geometry).vertices[0]; // unscaled!
        v.userData.specialLabelXOffset = (_lineStartPos.x * v.scale.x);
        v.userData.specialLabelYOffset = (_lineStartPos.y * v.scale.y);
      })

      let leftMeshes = this.meshes.filter(v => ((v.children[0] as THREE.Line).geometry as Geometry).vertices[0].x < 0);
      let leftHTML = LabelController.generateHtml(leftMeshes, labelOptionsLeftGenes);

      let rightMeshes = this.meshes.filter(v => ((v.children[0] as THREE.Line).geometry as Geometry).vertices[0].x > 0);
      let rightHTML = LabelController.generateHtml(rightMeshes, labelOptionsRightGenes);

      this.labels.innerHTML = leftHTML + rightHTML;

    }
  }

}
