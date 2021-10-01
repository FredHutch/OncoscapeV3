import { ChartFactory } from 'app/component/workspace/chart/chart.factory';
import { InfoPanelComponent } from './../../component/workspace/info-panel/info-panel.component';
import { 
  StoredPoint,
  AbstractScatterSelectionController, 
  ScatterHistoryZoomEntry,
  ScatterHistoryDragEntry,
  ScatterHistoryRotateEntry } from './abstract.scatter.selection.controller';
import { ChartScene } from '../../component/workspace/chart/chart.scene';
import { ChartEvents, ChartEvent } from '../../component/workspace/chart/chart.events';
import { VisualizationView } from '../../model/chart-view.model';
import * as TWEEN from '@tweenjs/tween.js';
import { OncoData } from 'app/oncoData';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';

import {
  Vector3,
  Vector2,
  MeshPhongMaterial,
  Mesh,
  Raycaster,
  Geometry,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Intersection,
  Points,
  PerspectiveCamera,
  Quaternion,
  Euler
} from 'three';
import { ScatterAction } from 'app/action/compute.action';
import { first } from 'rxjs/operators';
import { EntityTypeEnum } from 'app/model/enum.model';
import { AbstractScatterVisualization } from 'app/component/visualization/visualization.abstract.scatter.component';
import { AbstractVisualization } from 'app/component/visualization/visualization.abstract.component';
import { ɵngrx_modules_store_devtools_store_devtools_f } from '@ngrx/store-devtools';
import { Event } from 'aws-sdk/clients/s3';
import { ComponentFactoryResolver } from '@angular/core';
declare var $: any;

declare var THREE;
export class ScatterSelectionLassoController extends AbstractScatterSelectionController {
  // State
  public enabled = false;
  public tool: 'NONE' | 'LASSO' | 'RECTANGLE' | 'BRUSH' = 'NONE';
  public mode: 'NONE' | 'CLEAR' | 'DRAG' | 'SELECT' | 'DESELECT' = 'NONE';
  public defaultToolForMultiSelection:any = 'LASSO';

  private kdTree: any;
  private posMap: Array<any>;

  public brushState = {
    isDrawing: false,
    originPolar: new Vector3(0, 0, 0),
    originCart: new Vector2(0, 0),
    kddResult: null,
    pointIndex: 0,
    positionsPolar: new Float32Array(500 * 6),
    line: new Line(
      new BufferGeometry(),
      new LineBasicMaterial({
        color: 0xff00ff,
        linewidth: 6.0
      })
    )
  };
  private maxLassoPoints:number = 500;
  public lassoState = {
    isDrawing: false,
    pointIndex: 0,
    pointLimit: this.maxLassoPoints,
    originCart: new Vector2(0, 0),
    positionsCart: new Float32Array(this.maxLassoPoints * 2),
    positionsPolar: new Float32Array(this.maxLassoPoints * 3),
    line: new Line(
      new BufferGeometry(),
      new LineBasicMaterial({
        color: 0xff00ff,
        linewidth: 6.0
      })
    )
  };

  private _viewFromConstructor = null;

  // These parts come from mrdoob's DragControls.
  private _plane = new THREE.Plane();
	// already in base class: private _raycaster = new Raycaster();
	private _mouse = new Vector2();
	//private _offset = new Vector3();
	private _intersection = new Vector3();
	private _worldPosition = new Vector3();
  private _inverseMatrix = new THREE.Matrix4();
  
  static _createdCustomMenuClickHandler:boolean = false;

  constructor(public entity: EntityTypeEnum, public view: VisualizationView, public events: ChartEvents, public debounce: number = 10) {
    super(entity, view, events, debounce);
    (this.lassoState.line.geometry as BufferGeometry).setAttribute(
      'position',
      new THREE.BufferAttribute(this.lassoState.positionsPolar, 3)
    );
    (this.brushState.line.geometry as BufferGeometry).setAttribute(
      'position',
      new THREE.BufferAttribute(this.brushState.positionsPolar, 3)
    );

    OncoData.instance.currentSelectionController = this;
    console.log('=====find element for listener');
    let el = this.view.renderer.domElement;
    //this.contextMenuListener(el, this);

    // CUSTOM MENU
    // If the menu element is clicked
    let self = this;
    if(ScatterSelectionLassoController._createdCustomMenuClickHandler) {
      // already set this up once, don't call it twice.
    } else {
      $(".custom-menu li").click(function(e){
        console.log('=== catch double call to li click.');
        let chart = window['clickedChart'];
        let absScattterViz:AbstractScatterVisualization = chart as AbstractScatterVisualization;
        let selectionC = absScattterViz.selectionController as ScatterSelectionLassoController;
        // This is the triggered action name
        switch($(this).attr("data-action")) {
            
            // This Item 
            case "deselect": selectionC.menuAction_deselect(); break;
            case "itemreturntoorigin": selectionC.menuAction_returntoorigin('item'); break;

            // Selected Items
            case "invertselection": alert("NYI: invert selection"); break;
            case "selectionreturntoorigin": selectionC.menuAction_returntoorigin('selection'); break;
            case "deselectunlinked": alert("NYI: deselectunlinked"); break;
            case "copyids": alert("NYI: copyids"); break;
            case "createset": alert("NYI: createset"); break;

            // All items
            case "allreturntoorigin": selectionC.menuAction_returntoorigin('all'); break;
        }

        // Hide it AFTER the action was triggered
        $(".custom-menu").hide(100);
        self.menuState = 0;
      });
      ScatterSelectionLassoController._createdCustomMenuClickHandler = true;
    }
  }

  menuAction_deselect(){
    alert('Bug in Deselect. Not currently working.');
    return;
    
    if(this._lastHoveredIntersect) {
      let thisScatterGraph  = this.view.chart as AbstractScatterVisualization;
      thisScatterGraph.removeIntersectFromSelection(this._lastHoveredIntersect);
    }
  }

  menuAction_returntoorigin(scope: string){
    // scope is item, selection, or all.
    let absScattterViz:AbstractScatterVisualization = this.view.chart as AbstractScatterVisualization;
    let itemIndexesToReturn: Array<number> = [];
    switch(scope) {
      case "item": 
        if(this._lastHoveredIntersect) {
          itemIndexesToReturn.push(this._lastHoveredIntersect.index * 3);
        }
        break;
      case "selection": 
        itemIndexesToReturn = Array.from(this.highlightIndexes);
        break;
      case "all": 
      let len  = absScattterViz.getDataItemCount();
      itemIndexesToReturn = Array.from(Array(len).keys()).map(v => v * 3);
        break;
    }
    if(itemIndexesToReturn.length > 0){
      // actually move them.
      alert(`Returning ${itemIndexesToReturn.length} items`);
    }

    // if(this._lastHoveredIntersect) {
    //   let id = this.idOfIntersectedObject(this._lastHoveredIntersect);
    //   let thisScatterGraph  = this.view.chart as AbstractScatterVisualization;
    //   thisScatterGraph.removeIntersectFromSelection(this._lastHoveredIntersect);
    // }
  }

  menu:HTMLElement = document.querySelector("#custom-menu") as HTMLElement;
  private _menuState:number = 0;
  get menuState(): number {
    return this._menuState;
  }
  set menuState(value:number) {
    window['globalOncoscapeMenuState'] = value;
    this._menuState = value;
  }
  taskItemClassName = "custom-menu";

  public clickInsideElement(e:any, className ) {
    let el = this.menu; // fails: e.target as Element;
    console.log('clickInsideElement');

    let x = e.clientX; 
    let y = e.clientY; 
    el = document.elementFromPoint(x, y) as HTMLElement;
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      let tempEl:any = el;
      while ( tempEl = tempEl.parentNode ) {
        if ( tempEl.classList && tempEl.classList.contains(className) ) {
          return tempEl;
        }
      }
    }
  
    return false;
  }

  // contextMenuListener(el, caller) {
  //   el.addEventListener( "contextmenu", function(e) {
  //     e.preventDefault();
  //     console.log('== contextmenu event received.');
  //     console.log(JSON.stringify(e));


  //   });
  // }
  
  toggleMenuOn(e:ChartEvent) {
    console.log('IN a toggeleMenuON: ' + JSON.stringify(e));
    document.body.style.cursor = "default";
    this.menu.style.position = "relative";
    this.menu.style.left = e.mouse.xs +'px';
    this.menu.style.top = e.mouse.ys +'px';
    e.event.preventDefault();
    if ( this.menuState !== 1 ) {
      this.menuState = 1;
      if(this.view && this.view.chart && this.view.chart as AbstractVisualization){
        (this.view.chart as AbstractVisualization).onHideTooltip();
      }
      window['clickedChart'] = this.view.chart;
      $(".custom-menu").finish().toggle(100).
      css({
        top: e.event.pageY + "px",
        left: e.event.pageX + "px"
    });    }
  }    

  toggleMenuOff(e: MouseEvent) {
    if ( this.menuState !== 0 ) {
      this.menuState = 0;
      //this.menu.classList.remove(this.activeClassName);
      console.log('=== doing togglemenuoff ===');
      // If the clicked element is not the menu
      if(e == null) {   // e.g., keyboard event from Escape key
        $(".custom-menu").hide(100);
      } else {
        let parents = $(e.target).parents(".custom-menu");
        if (parents.length == 0) {
            
          // Hide it
          $(".custom-menu").hide(100);
        } 
      }
    }
  }

  convertRange(value, r1, r2): number {
    return Math.round(((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0]);
  }

  //#region KDD
  public get points(): Points {
    return this._points;
  }
  public set points(p: Points) {
    if (p === null) {
      this._points = null;
      return;
    }
    const distanceFunction = (a, b) => {
      return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
    };

    const ptsArray = p.geometry['attributes'].position.array;
    // Make sortArray one column wider than ptsArray. Store the index in there, 
    // So after sorting we can pull out the index values into this.posMap.
    let lengthPtsArrayPlusIndex:number = ptsArray.length + (ptsArray.length / 3);
    let sortArray = new Float32Array(lengthPtsArrayPlusIndex);
    // replaces sortArray.set(ptsArray);
    let sortArrayIndex = 0;
    for (let i = 0; i < ptsArray.length; i += 3) {
      sortArray[sortArrayIndex++] = ptsArray[i]; // x 
      sortArray[sortArrayIndex++] = ptsArray[i+1]; // y 
      sortArray[sortArrayIndex++] = ptsArray[i+2]; // z 
      sortArray[sortArrayIndex++] = i; // index to ptsArray's x.
    }

    let startTime = new Date().getTime();
    this.kdTree = new THREE.TypedArrayUtils.Kdtree(sortArray, distanceFunction, 4);
    let endTime= new Date().getTime();
    console.log(`====Kdtree create: ${endTime - startTime}`);
    this.posMap = new Array(ptsArray.length / 3);

    startTime = new Date().getTime();
    for (let i = 0; i < sortArray.length; i += 4) {
      this.posMap[i / 4] = sortArray[i+3]; // ptsArray.indexOf(sortArray[i]); // faster than findIndex
    }
    endTime= new Date().getTime();
    console.log(`==== findIndex loop: ${endTime - startTime} for ${this.posMap.length} points.`);
    console.log(`==== That's ${(this.posMap.length)/(endTime - startTime)} points per ms.`);

    this._points = p;
  }
  //#endregion


  public sidOfIntersectedObject(intersectedObject:any): string {
    if(intersectedObject == null) { 
      return "";
    } else {
      let obj = intersectedObject.object;
      let sid:string = obj.userData.ids[intersectedObject.index];
      return sid;
    }
  }

  private _currentKeyDownEvent = null;

  //#region Primary Events
  public onKeyDown(e: KeyboardEvent): void {
    super.onKeyDown(e);
    if(this._currentKeyDownEvent == null) {
      this._currentKeyDownEvent  = e;
    }
    this.mode = !e.shiftKey ? 'NONE' : e.metaKey ? 'DESELECT' : 'SELECT';
    if(e.altKey) { 
      this.mode = 'CLEAR';
    }
  }

  public onKeyPress(e: KeyboardEvent): void {
    super.onKeyPress(e);
//
  }

  public onKeyUp(e: KeyboardEvent): void {
    //console.log(`onKeyUp A ${JSON.stringify(e)}.`);
    super.onKeyUp(e);
    //console.log(`onKeyUp B ${JSON.stringify(e)}.`);

    if(e.code == "Escape") {
      this.toggleMenuOff(null);
      return;
    }

    if(this._currentKeyDownEvent != null) {
      this._currentKeyDownEvent  = null;
    }
    if(e.code == "KeyA" && e.ctrlKey == true){
      this.highlightIndexes = new Set([]);;
      let l = this.points.geometry['attributes']['gSelected']['count']; // NOT the number of sleected. Just a shorthand for the number of points.
      for(let i:number = 0; i< l; i++) {
        this.highlightIndexes.add(i * 3);
      }
      let selectionDetails = {ids:Array.from(this.highlightIndexes), source:'SelectAll'};
      this.onSelect.emit(selectionDetails);
  
//      window.setTimeout(function(){alert("'Select All' is not yet implemented.")}, 50);
    }
    if(e.code == "KeyC" && e.ctrlKey){
      window.setTimeout(function(){alert("'Copy' is not yet implemented.")}, 50);
    }
    if(e.code == "KeyZ" && e.ctrlKey){
      this.scatterHistory.undo();
    }
    if(e.code == "KeyY" && e.ctrlKey){
      this.scatterHistory.redo();
    }

    if(e.code == "Digit5" && e.ctrlKey && e.shiftKey){
      this.scatterHistory.setZoom5();
    }
    if(e.code == "Digit6" && e.ctrlKey && e.shiftKey){
      this.scatterHistory.setZoom6();
    }
    if(e.code == "Digit7" && e.ctrlKey && e.shiftKey){
      this.scatterHistory.setZoom7();
    }

    this.mode = !e.shiftKey ? 'NONE' : e.metaKey ? 'DESELECT' : 'SELECT';
  }

  private _lastMouseDownIntersect = null;

  private _currentSelectedPointsAsIndices = [];

  private _lastMouseDownOrbcontrolsTarget:Vector3;
  private _lastMouseDownCameraPosition:Vector3;
  private _lastMouseDownCameraRotation:Euler;
  private _lastMouseDownCameraQuaternion:Quaternion;


  public onMouseDown(e: ChartEvent): void {
    let eventChartMatchesThisChart = e.chart == (this.view.chart as AbstractVisualization)._config.graph;
    if(eventChartMatchesThisChart){
      super.onMouseDown(e);
      // console.log(`===Msdn match=${eventChartMatchesThisChart} vp.w=${this.view.viewport.width} vp.x=${this.view.viewport.x} vp.w=${this.view.viewport.width} e.ch${e.chart} emxs=${e.mouse.xs} ecx=${e.event.clientX}`);

      let self = this;
      if((e.event.buttons || 2) == 2) {
        console.log('=== right click');
        if(self._lastHoveredIntersect){
          console.log('=== context menu DISABLED');
          // console.dir(self._lastHoveredIntersect);

          // e.event.preventDefault();
          // if(this.menuState == 0) {
          //   console.log(' Menu not open, so open it. ');
          //   this.toggleMenuOn(e);
          // } else {
          //   if ( this.clickInsideElement(e.event, this.taskItemClassName ) ) {
          //     console.log(' mousedown INSIDE ');
          //     this.toggleMenuOn(e);
          //   } else {
          //     console.log(' mouseDown NOT INSIDE');
          //     this.toggleMenuOff(e.event);
          //   }
          // }

          // // if ( this.clickInsideElement(e.event, this.taskItemClassName ) ) {
          // //   e.event.preventDefault();
          // //   console.log(' mousedown INSIDE ');
          // //   this.toggleMenuOn(e);
          // // } else {
          // //   console.log(' mouseDown NOT INSIDE');
          // //   this.toggleMenuOff(e.event);
          // // }

          // return;
        }
      } 

      self.lastMouseDownEvent = {...e}; // MJ was just "e"
      self.lastMouseDownEvent.mouse = {...e.mouse};

      // console.log('MJ onMsDn canrotate? ' + self.view.controls.enableRotate);

      // Are we over a point right now?
      if(self._lastHoveredIntersect) {
        self._lastMouseDownIntersect = self._lastHoveredIntersect;
        self.setCanRotateFlag(self.view.controls.enableRotate);
        self.view.controls.enableRotate = false;
        
        console.warn('MJ Never gets here? ===== 6544');

        let selectionArray = self.points.geometry['attributes']['gSelected'].array;
        let visibilityArray = self.points.geometry['attributes']['gVisibility'].array;
        let positionArray = self.points.geometry['attributes']['gPositionFrom'].array;
        let originalPos:Vector3 = null;
        let pointAlreadySelected:boolean = selectionArray[self._lastMouseDownIntersect.index] == 1;
        // console.log('MJ pointAlreadySelected = ' + JSON.stringify(pointAlreadySelected));

        // console.log('MJ TBD: if not Shift click, deselect all others.');
        if(pointAlreadySelected == false) {
          // click and drag one point
          if(e.event.shiftKey == false) {
            this.highlightIndexes.clear();
            selectionArray.fill(0);
          }
          let thisPointX3Index:number = self._lastMouseDownIntersect.index * 3;
          console.log(`=== add ${thisPointX3Index} to highlightIndexes`);
          this.highlightIndexes.add(thisPointX3Index);
          let newHighlightIndexArray:Array<number> = Array.from(this.highlightIndexes).sort();
          let selectionDetails = {ids:newHighlightIndexArray, source:'Lasso'}; // Lasso should be "singleclick", or something like that
          this.onSelect.emit(selectionDetails);
          ChartScene.instance.render();

          selectionArray[self._lastMouseDownIntersect.index] = 1;
          self.points.geometry['attributes']['gSelected'].needsUpdate = true;
          this.callPostAdjustIfNeeded();
        }

        self._currentSelectedPointsAsIndices = [];
        selectionArray.forEach((s,i) => {
          if (selectionArray[i] == 1 && visibilityArray[i] > 0.5) {
            originalPos = positionArray.slice(i*3, (i+1)*3);
            // console.log('MJ set newpos from originalpos');
            let newPos = positionArray.slice(i*3, (i+1)*3); // qqq mj {...originalPos}; // copy}
            let storedPoint:StoredPoint = {
              index: i,
              origPos: originalPos,
              newPos : newPos
            }
            self._currentSelectedPointsAsIndices.push(storedPoint);
          }
        });

        self._plane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 ); // MJ added
        self._intersection = new Vector3; // fill with coords of original click
        let selectedItemindex:number = self._lastMouseDownIntersect.index;
        let pointCoords = positionArray.slice(selectedItemindex*3, (selectedItemindex+1)*3);
        self._intersection.set(pointCoords[0], pointCoords[1], pointCoords[2])
        self._plane.setFromNormalAndCoplanarPoint( self.view.camera.getWorldDirection( this._plane.normal ), this._worldPosition.setFromMatrixPosition( self.points.matrixWorld ) );

        let mouse:any = {};
        mouse.x = ( e.event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.event.clientY / window.innerHeight ) * 2 + 1;
        self._raycaster.setFromCamera( mouse, self.view.camera );

        let intersectPlaneResults = self._raycaster.ray.intersectPlane( self._plane, self._intersection );
        if ( intersectPlaneResults ) { 
          let matrixWorldToUse:THREE.Matrix4 = self.points.matrixWorld; // e.g., Genome graph list of mesh objects
          if( self.points.parent && self.points.parent.matrixWorld) {
            // Normal scatter points object
            matrixWorldToUse = self.points.parent.matrixWorld;
          }
          self._inverseMatrix.getInverse( matrixWorldToUse );
          console.warn('MJ Should we getInverse here?');
        }
        ChartScene.instance.render;
        return;
      } else {
        console.warn('MJ lasso mousedown NOT over hoveredintersect');
        self._lastMouseDownIntersect = null; 
        self._currentSelectedPointsAsIndices = [];
      }

      if (this.mode === 'NONE') { 
        this._lastMouseDownCameraPosition = this.view.camera.position.clone();
        this._lastMouseDownCameraRotation = this.view.camera.rotation.clone();
        this._lastMouseDownCameraQuaternion = this.view.camera.quaternion.clone();
        this._lastMouseDownOrbcontrolsTarget = this.view.controls.center.clone();
        this.view.controls['saveState']();
        ChartScene.instance.render;
        return;
      }

      if (this.mode === 'CLEAR') {
        this.highlightIndexes.clear();
      }
      this.raycaster.setFromCamera(e.mouse, this.view.camera);
      let intersects:Intersection[] = [];
      try {
        intersects = this.raycaster.intersectObject(this.points);
      } catch (err) {
        console.warn('intersectObject failed.');
      }
      let toolToUseIfNotOnAPoint:any = this.defaultToolForMultiSelection;
      this.tool = intersects.length < 0 ? 'NONE' : intersects.length === 0 ? toolToUseIfNotOnAPoint : 'BRUSH';
      ChartScene.instance.render;
      console.log('scatter selection tool = ' + this.tool);
      switch (this.tool) {
        case 'NONE':
          return;
        case 'BRUSH':
          this.brushMouseDown(e);
          break;
        case 'LASSO':
          this.lassoMouseDown(e);
          break;
        case 'RECTANGLE':
          this.rectangleMouseDown(e);
          break;
      }

    }
  }

  public onMouseUp(e: ChartEvent): void {

    let eventChartMatchesThisChart = e.chart == (this.view.chart as AbstractVisualization)._config.graph;
    if(eventChartMatchesThisChart){
      super.onMouseUp(e);

      if(this.menuState) {
        console.log('MENU ON, mouseup');
        return;
      }
  
  
      console.log(`===Msup match=${eventChartMatchesThisChart} vp.w=${this.view.viewport.width} vp.x=${this.view.viewport.x} vp.w=${this.view.viewport.width} e.ch${e.chart} emxs=${e.mouse.xs} ecx=${e.event.clientX}`);
      this.view.controls.enableRotate = this.canRotateFlag() && this.canEverRotateFlag();
      let copyOfSelectedPointsAsIndices = this._currentSelectedPointsAsIndices.slice(); 
      this._currentSelectedPointsAsIndices = [];
      // console.log('MJ see if we have original locs for moved points');

      if (this.lastMouseDownEvent && 
        this.lastMouseDownEvent.event.clientX == e.event.clientX &&
        this.lastMouseDownEvent.event.clientY == e.event.clientY
        )
      {
        // If we're exactly where we clicked down, off a point, treat this as a "click-off", and remove selection.
        if (this._lastHoveredIntersect == null) {

          let pseudoCohort = {pids:[], sids:[], mids:[]}; // Empty cohort.
          this.setSelectionViaCohortViaSource(pseudoCohort, 'ClickOff');
          
        } else {
          if (this._lastMouseDownIntersect != null){
            // console.log('MJ shift key?  ' + e.event.shiftKey); // TBD: handle adding with click
            
            let isDoubleClick_NYI = false;
            if(isDoubleClick_NYI) {
            // TBD: This is a double-click on a point. Pop up some useful info on it.
              alert(`This is "${this.sidOfIntersectedObject(this._lastHoveredIntersect)}".  (TBD: In future, add more details about the object here.)`);
            } else {
              // Just a single click on a point, without moving the mouse.
              // Ignore here, because we are selecting the point in onMouseDown.
            }

            // // // We have onMouseUp after clicking on (at least?) one point. Select it.
            // // let sid = this.idOfIntersectedObject(this._lastHoveredIntersect);
            // // // console.log('MJ sid of click = ' + sid);
            // // // Create cohort of just our one selected point
            // // let pid = OncoData.instance.currentCommonSidePanel.sampleMap[sid]; // setSelectionInCommonSidebar assumes 1-to-1 patient and sample mapping
            // // let pseudoCohort = {pids:[pid], sids:[sid]};
            // // this.setSelectionViaCohortViaSource(pseudoCohort, 'SingleClick');
          }
    

        }

      } else {
        // Was not a single-click in one position. May be mouseup at end of drag?
        if (this._lastMouseDownIntersect != null && copyOfSelectedPointsAsIndices.length > 0){
            // console.dir(copyOfSelectedPointsAsIndices);
            let newScatterHistoryDragEntry:ScatterHistoryDragEntry = new ScatterHistoryDragEntry(this.view);
            copyOfSelectedPointsAsIndices.forEach(p => {
              let storedPoint:StoredPoint = {
                index : p.index,
                origPos: new Vector3(p.origPos[0],p.origPos[1],p.origPos[2]),
                newPos: new Vector3(p.newPos[0],p.newPos[1],p.newPos[2])
              };
              newScatterHistoryDragEntry.points.push(storedPoint);
            });
            this.scatterHistory.pushDragAction(newScatterHistoryDragEntry, this.points);
        
            ChartScene.instance.invalidatePrerender();
            ChartScene.instance.render();
        } else {
          if(this.canEverRotateFlag()) {
            if(this.lastMouseDownEvent) {
              let scatRotate:ScatterHistoryRotateEntry = new  ScatterHistoryRotateEntry(this.view);
              scatRotate.isPanning = this.lastMouseDownEvent.event.button == 2;
              scatRotate.oldPosition = this._lastMouseDownCameraPosition;
              scatRotate.newPosition = this.view.camera.position.clone();
              scatRotate.oldQuaternion = this._lastMouseDownCameraQuaternion;
              scatRotate.newQuaternion = this.view.camera.quaternion.clone();
              scatRotate.oldRotation = this._lastMouseDownCameraRotation;
              scatRotate.newRotation = this.view.camera.rotation.clone();
              scatRotate.oldTarget = this._lastMouseDownOrbcontrolsTarget;
              scatRotate.newTarget = this.view.controls.center.clone();
              // console.dir(scatRotate);
              this.scatterHistory.pushRotateAction(scatRotate);
            }
          }
        }

        switch (this.tool) {
          case 'NONE':
            return;
          case 'LASSO':
            this.lassoMouseUp(e);
            break;
          case 'BRUSH':
            this.brushMouseUp(e);
            break;
          case 'RECTANGLE':
            this.rectangleMouseUp(e);
            break;
        }
      }
      this.tool = 'NONE';
    }
  }

  _lastHoveredIntersect = null;

  public onMouseMove(e: ChartEvent): void {
    let eventChartMatchesThisChart = e.chart == (this.view.chart as AbstractVisualization)._config.graph;
    if(eventChartMatchesThisChart){
      if(this.menuState) {
        console.log('MENU ON, mousemove');
        return;
      }
      
      // Cleanup in case we get out of sync with our mousedowns and ups.
      // If we think we are selecting, but buttons are not down, stop selecting.
      if((e.event.buttons == 0) && this.lassoState.isDrawing){
        this.lassoState.isDrawing = false;
        console.warn('Mouse cleanup. Turned off isDrawing.');
        return;
      }
  

      // super will update tooltip.
      super.onMouseMove(e);
      
      let self = this;
      if ((e.event.buttons && 1) && this.lastMouseDownEvent != null &&
        // TBD:  Drag points, if any are selected
        this._lastHoveredIntersect != null) {
          // already dragging
          if( this._currentKeyDownEvent != null && e.event.shiftKey == false) {
            // console.log(`_currentKeyDownEvent ${JSON.stringify(this._currentKeyDownEvent) }`);
          } else {
            let mouseDiff = [ // x ispercentage, xs is scaled to pixels.
              e.mouse.x - this.lastMouseDownEvent.mouse.x,
              e.mouse.y - this.lastMouseDownEvent.mouse.y,
              e.mouse.xs - this.lastMouseDownEvent.mouse.xs,
              e.mouse.ys - this.lastMouseDownEvent.mouse.ys
            ]

            let didMovePoints:boolean = false;
            if(mouseDiff[0] != 0.0 || mouseDiff[1] != 0.0){
              let _domElement = self.view.renderer.domElement;
              let _mouse:any = {};
              let rect = _domElement.getBoundingClientRect();
              _mouse.x = ( ( e.event.clientX - rect.left ) / rect.width ) * 2 - 1;
              _mouse.y = - ( ( e.event.clientY - rect.top ) / rect.height ) * 2 + 1;

              self._raycaster.setFromCamera( _mouse, self.view.camera );
              let intersectionCopy:Vector3 = new Vector3();
              intersectionCopy.copy(self._intersection);
              if ( self._raycaster.ray.intersectPlane( self._plane, intersectionCopy ) ) {
                let newPos = intersectionCopy.applyMatrix4( self._inverseMatrix ) ;
                let diffX = newPos.x - self._intersection.x;
                let diffY = newPos.y - self._intersection.y;
                let diffZ = newPos.z - self._intersection.z;

                let gPositionFromArray = self.points.geometry['attributes']['gPositionFrom'].array;
                let positionArray = self.points.geometry['attributes']['position'].array;
                self._currentSelectedPointsAsIndices.forEach((p) => {
                  if(e.event.shiftKey == false || self._lastHoveredIntersect.index == p.index){
                    p.newPos[0] = p.origPos[0] + diffX; //newPos.x;
                    p.newPos[1] = p.origPos[1] + diffY; //newPos.y;
                    p.newPos[2] = p.origPos[2] + diffZ; //newPos.z;
                    let indexInAllPoints:number = p.index;

                    positionArray[indexInAllPoints*3] = p.newPos[0];
                    positionArray[(indexInAllPoints*3)+1] = p.newPos[1];
                    positionArray[(indexInAllPoints*3)+2] = p.newPos[2]; // z

                    gPositionFromArray[indexInAllPoints*3] = p.newPos[0];
                    gPositionFromArray[(indexInAllPoints*3)+1] = p.newPos[1];
                    gPositionFromArray[(indexInAllPoints*3)+2] = p.newPos[2]; // z
                    didMovePoints = true;
                  }
                });
              }

            }
            // Now force a redraw.
            if(didMovePoints) {
              self.points.geometry['attributes']['position'].needsUpdate = true;
              self.points.geometry['attributes']['gPositionFrom'].needsUpdate = true;
              this.callPostAdjustIfNeeded();
              ChartScene.instance.invalidatePrerender();
              ChartScene.instance.render();
            } else {
              // console.log('no points moved');
            }
          }

      } else {
        // console.log('MJ NOT drag e.mouse = '+e.mouse.xs+', ' + e.mouse.ys);
        if(this.lassoState.isDrawing == false){
          this.raycaster.setFromCamera(e.mouse, this.view.camera);
          let intersects:Array<Intersection> = [];
          try {
            intersects = this.raycaster.intersectObject(this.points);
          } catch (err) {
            console.error('three.js expected layers. MJ');
          }
          if(intersects.length > 0) {
            //console.log("=== is intersects visible? ===");
            let vis = self.points.geometry['attributes']['gVisibility'].array[intersects[0].index]
            //console.log(vis);
            if (vis > 0.5) {
              //console.log(self)
              document.body.style.cursor = "pointer";
              this._lastHoveredIntersect = intersects[0];
              // console.warn(`MJ set lastHoveredIntersect=${intersects[0].index}.`);
            }
          } else {
            document.body.style.cursor = "default";
            this._lastHoveredIntersect = null;
          }
        }

        switch (this.tool) {
          case 'NONE':
            return;
          case 'LASSO':
            this.lassoMouseMove(e);
            break;
          case 'BRUSH':
            this.brushMouseMove(e);
            break;
          case 'RECTANGLE':
            this.rectangleMouseMove(e);
            break;
        }

      }
    }
  }
  //#endregion

  
  public setSelectionViaCohortDirect(cohort:any) {
    this.setSelectionViaCohortViaSource(cohort, 'Cohort');
  }

  public setSelectionViaCohortViaSource(cohort:any, sourceName:string) {
    if(this._points == null){
      console.error(`Scatter Lasso controller tried to select,  but _points is null.`);
      return;
    }

    if (this.entitiesSelectable != EntityTypeEnum.SAMPLE && this.entitiesSelectable != EntityTypeEnum.PATIENT && this.entitiesSelectable != EntityTypeEnum.GENE){
      console.error(`Scatter Lasso controller expected Genes or Samples or Patients, but saw [${this.entitiesSelectable.toString()}].`);
      return;
    }

    // If nothing's selected, and we're clicking on empty space,
    // there is nothing to do. Do not re-select nothing, just ignore this.
    if(cohort.sids.length==0 && this.highlightIndexes.size == 0) {
      return;
    }

    let sidList:string[] = this._points.userData["ids"];
    let newHighlightIndexes = new Set([]);;

    cohort.sids.forEach(sid => {
      let foundIndex = sidList.findIndex(pointId => pointId == sid);
      if (foundIndex >= 0) {
        newHighlightIndexes.add(foundIndex * 3);
      }
    });    

    this.highlightIndexes = newHighlightIndexes;
    let selectionDetails = {ids:Array.from(this.highlightIndexes), source: sourceName};
    this.onSelect.emit(selectionDetails);
  }

  //#region Lasso
  private pointInPoly(point, vs) {
    let i, j, intersect;
    const x = point[0];
    const y = point[1];
    let inside = false;
    for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0];
      const yi = vs[i][1];
      const xj = vs[j][0];
      const yj = vs[j][1];
      intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  public lassoMouseUp(e: ChartEvent): void {

    this.lassoState.isDrawing = false;
    this.view.controls.enabled = true;
    this.tool = 'NONE';
    this.view.scene.remove(this.lassoState.line);

    // Detect Points In Poly
    const poly = [];
    for (let i = 0; i < this.lassoState.pointIndex; i++) {
      poly.push([this.lassoState.positionsCart[i * 2], this.lassoState.positionsCart[i * 2 + 1]]);
    }
    const pts = this.points.geometry['attributes'].position.array;
    const ptsCount = pts.length / 3;
    const ptsVec3 = new Array(ptsCount);


    for (let i = 0; i < ptsCount; i++) {
      const vec3 = new Vector3(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]).project(this.view.camera);
      ptsVec3[i] = [vec3.x, vec3.y];
    }
    const vis = this.points.geometry['attributes'].gVisibility.array;
    const hits = ptsVec3.reduce((p, c, i) => {
      if(vis[i] > 0.5){
        if (this.pointInPoly(c, poly)) {
          p.push(i * 3);
        }
      } else {
        console.log('hidden, no select')
      }
      return p;
    }, []);

    let originalHighlightIndexArray:Array<number> = Array.from(this.highlightIndexes).sort();

    hits.forEach(hit => {
      if (this.mode === 'SELECT') {
        this.highlightIndexes.add(hit);
      } else {
        this.highlightIndexes.delete(hit);
      }
    });
    let newHighlightIndexArray:Array<number> = Array.from(this.highlightIndexes).sort();
    let selectionDetails = {ids:newHighlightIndexArray, source:'Lasso'};

    // Very inefficient naive check! TODO: speed it up
    if (JSON.stringify(originalHighlightIndexArray) != JSON.stringify(newHighlightIndexArray)){
      this.onSelect.emit(selectionDetails);
    }
    ChartScene.instance.render();
  }


  public lassoMouseDown(e: ChartEvent): void {
    this.view.scene.add(this.lassoState.line);
    this.view.controls.enabled = false;
    // console.log('MJ lassoMouseDown turned off canrotate');

    this.lassoState.isDrawing = true;
    this.lassoState.originCart.set(e.mouse.x, e.mouse.y);
    this.lassoState.pointIndex = 0;
  }
  
  private  lassoMouseMoveCount:number = 0;
  public lassoMouseMove(e: ChartEvent): void {
    if (!this.lassoState.isDrawing) {
      return;
    }
    this.lassoMouseMoveCount++;
    this.lassoState.positionsCart[this.lassoState.pointIndex * 2] = e.mouse.x;
    this.lassoState.positionsCart[this.lassoState.pointIndex * 2 + 1] = e.mouse.y;
    const mousePolar = new THREE.Vector3(e.mouse.x, e.mouse.y, 0);
    mousePolar.unproject(this.view.camera);
    this.lassoState.positionsPolar[this.lassoState.pointIndex * 3] = mousePolar.x;
    this.lassoState.positionsPolar[this.lassoState.pointIndex * 3 + 1] = mousePolar.y;
    this.lassoState.positionsPolar[this.lassoState.pointIndex * 3 + 2] = mousePolar.z;
    this.lassoState.pointIndex += 1;
    (this.lassoState.line.geometry as BufferGeometry).setDrawRange(1, this.lassoState.pointIndex - 1);
    (this.lassoState.line.geometry as BufferGeometry).attributes.position['needsUpdate'] = true;
//    console.log(`Lasso render ${Date.now()}, move=${this.lassoMouseMoveCount}.`);
    ChartScene.instance.render(); 
  }
  //#endregion

  //#region Rectangle
  public rectangleMouseUp(e: ChartEvent): void {
    console.warn('RECTANGLE mouseup');
    this.lassoState.isDrawing = false;
    this.view.controls.enabled = true;
    this.tool = 'NONE';
    this.view.scene.remove(this.lassoState.line);

    // Detect Points In Poly
    const poly = [];
    for (let i = 0; i < this.lassoState.pointIndex; i++) {
      poly.push([this.lassoState.positionsCart[i * 2], this.lassoState.positionsCart[i * 2 + 1]]);
    }
    const pts = this.points.geometry['attributes'].position.array;
    const ptsCount = pts.length / 3;
    const ptsVec3 = new Array(ptsCount);
    for (let i = 0; i < ptsCount; i++) {
      const vec3 = new Vector3(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]).project(this.view.camera);
      ptsVec3[i] = [vec3.x, vec3.y];
    }
    const hits = ptsVec3.reduce((p, c, i) => {
      if (this.pointInPoly(c, poly)) {
        p.push(i * 3);
      }
      return p;
    }, []);

    let originalHighlightIndexArray:Array<number> = Array.from(this.highlightIndexes).sort();

    hits.forEach(hit => {
      if (this.mode === 'SELECT') {
        this.highlightIndexes.add(hit);
      } else {
        this.highlightIndexes.delete(hit);
      }
    });
    let newHighlightIndexArray:Array<number> = Array.from(this.highlightIndexes).sort();
    let selectionDetails = {ids:newHighlightIndexArray, source:'Lasso'};

    // Very inefficient naive check! TODO: speed it up
    if (JSON.stringify(originalHighlightIndexArray) != JSON.stringify(newHighlightIndexArray)){
      this.onSelect.emit(selectionDetails);
    }
    ChartScene.instance.render();
  }

  public originPolar:THREE.Vector3;

  public rectangleMouseDown(e: ChartEvent): void {
    console.warn('RECTANGLE mousedown');
    this.lassoMouseMoveCount = 3; // After originCart (call it upperleft), we have upper right, lower right, and lower left.
    this.view.scene.add(this.lassoState.line);
    this.view.controls.enabled = false;
    // console.log('MJ lassoMouseDown turned off canrotate');

    this.lassoState.isDrawing = true;
    this.lassoState.originCart.set(e.mouse.x, e.mouse.y);
    this.originPolar = new THREE.Vector3(e.mouse.x, e.mouse.y, 0);
    this.originPolar.unproject(this.view.camera);

    // upper left origin
    this.lassoState.positionsCart[6] = e.mouse.x;
    this.lassoState.positionsCart[7] = e.mouse.y;
    this.lassoState.positionsPolar[9] = this.originPolar.x;
    this.lassoState.positionsPolar[10] = this.originPolar.y;
    this.lassoState.positionsPolar[11] = this.originPolar.z;

    this.lassoState.pointIndex = 4;
    this.adjustRectangleBasedOnMouseMove(e);
  }

  private adjustRectangleBasedOnMouseMove(e: ChartEvent) {
    // origin is upper left.
    const mousePolar = new THREE.Vector3(e.mouse.x, e.mouse.y, 0);
    mousePolar.unproject(this.view.camera);

    // upper right
    this.lassoState.positionsCart[0] = e.mouse.x;
    this.lassoState.positionsCart[1] = this.lassoState.originCart.y;
    this.lassoState.positionsPolar[0] = mousePolar.x;
    this.lassoState.positionsPolar[1] = this.originPolar.y;
    this.lassoState.positionsPolar[2] = mousePolar.z;

    // lower right
    this.lassoState.positionsCart[2] = e.mouse.x;
    this.lassoState.positionsCart[3] = e.mouse.y;
    this.lassoState.positionsPolar[3] = mousePolar.x;
    this.lassoState.positionsPolar[4] = mousePolar.y;
    this.lassoState.positionsPolar[5] = mousePolar.z;

    // lower left
    this.lassoState.positionsCart[4] = this.lassoState.originCart.x;
    this.lassoState.positionsCart[5] = e.mouse.y;
    this.lassoState.positionsPolar[6] = this.originPolar.x;
    this.lassoState.positionsPolar[7] = mousePolar.y;
    this.lassoState.positionsPolar[8] = mousePolar.z;

    // upper left origin
    this.lassoState.positionsCart[6] = this.lassoState.originCart.x;
    this.lassoState.positionsCart[7] = this.lassoState.originCart.y;
    this.lassoState.positionsPolar[9] = this.originPolar.x;
    this.lassoState.positionsPolar[10] = this.originPolar.y;
    this.lassoState.positionsPolar[11] = this.originPolar.z;

    // close off at upper right
    this.lassoState.positionsCart[8] = e.mouse.x;
    this.lassoState.positionsCart[9] = this.lassoState.originCart.y;
    this.lassoState.positionsPolar[12] = mousePolar.x;
    this.lassoState.positionsPolar[13] = this.originPolar.y;
    this.lassoState.positionsPolar[14] = mousePolar.z;
    
    // NOte: for rectangle, we start drawrange at 0 instead of 1?
    (this.lassoState.line.geometry as BufferGeometry).setDrawRange(0, (this.lassoState.pointIndex +1));
    (this.lassoState.line.geometry as BufferGeometry).attributes.position['needsUpdate'] = true;
//    console.log(`Lasso render ${Date.now()}, move=${this.lassoMouseMoveCount}.`);
  }

  private  rectangleMouseMoveCount:number = 0;
  public rectangleMouseMove(e: ChartEvent): void {
    if (!this.lassoState.isDrawing) {
      return;
    }
    this.adjustRectangleBasedOnMouseMove(e);
    ChartScene.instance.render(); 
  }
  //#endregion

  //#region Brush
  public brushMouseUp(e: ChartEvent): void {
    this.view.scene.remove(this.brushState.line);
    this.view.controls.enabled = true;
    this.brushState.isDrawing = false;
    this.tool = 'NONE';
    this.brushState.kddResult.forEach(v => {
      if (this.mode === 'SELECT') {
        this.highlightIndexes.add(v.pos);
      } else {
        this.highlightIndexes.delete(v.pos);
      }
    });
    let posBuffer  = this.brushState.line.geometry['attributes'].position;
    let l = posBuffer.array.length;
    console.warn('In scatter brushMouseUp, about to try fill(0) workaround.');
    for(let i=0; i< length; i++){
      posBuffer.setX(i,0);
    }
    this.brushState.pointIndex = 0;
    this.brushState.positionsPolar.fill(0);
    this.brushState.kddResult = [];
    let selectionDetails = {ids:Array.from(this.highlightIndexes), source:'Brush'};
    this.onSelect.emit(selectionDetails);
  }

  public brushMouseDown(e: ChartEvent): void {
    let posBuffer = this.brushState.line.geometry['attributes'].position;
    let l = posBuffer.array.length;
    console.warn('In scatter brushMouseDown, about to try fill(0) workaround.');
    for(let i=0; i< length; i++){
      posBuffer.setX(i,0);
    }

    this.brushState.pointIndex = 0;
    this.brushState.positionsPolar.fill(0);
    this.view.controls.enabled = false;
    // console.log('MJ brushMouseDown turned off canrotate');

    this.raycaster.setFromCamera(e.mouse, this.view.camera);
    const intersects = this.raycaster.intersectObject(this.points);
    this.brushState.originPolar = intersects[0].point;
    this.brushState.originCart.set(e.mouse.xs, e.mouse.ys);

    this.view.scene.add(this.brushState.line);
    this.brushState.isDrawing = true;
    if (this.mode === 'SELECT') {
      this.highlightIndexes.add(intersects[0].index * 3);
    } else {
      this.highlightIndexes.delete(intersects[0].index * 3);
    }
    let selectionDetails = {ids:Array.from(this.highlightIndexes), source:'Brush'};
    this.onSelect.emit(selectionDetails);
    ChartScene.instance.render();
  }

  public brushMouseMove(e: ChartEvent): void {
    if (!this.brushState.isDrawing) {
      return;
    }
    const points = Math.ceil(this.brushState.originCart.distanceTo(new Vector2(e.mouse.xs, e.mouse.ys)) / 10);
    if (points === 0) {
      return;
    }
    this.brushState.kddResult = this.kdTree
      .nearest(
        [this.brushState.originPolar.x, this.brushState.originPolar.y, this.brushState.originPolar.z],
        points,
        100000
      )
      .map(v => {
        const pt = v[0].obj;
        return {
          vec3: new Vector3(pt[0], pt[1], pt[2]),
          pos: this.posMap[v[0].pos]
        };
      });

    this.brushState.pointIndex = 0;

    for (let i = 0; i < this.brushState.kddResult.length; i++) {
      this.brushState.positionsPolar[this.brushState.pointIndex * 3] = this.brushState.originPolar.x;
      this.brushState.positionsPolar[this.brushState.pointIndex * 3 + 1] = this.brushState.originPolar.y;
      this.brushState.positionsPolar[this.brushState.pointIndex * 3 + 2] = this.brushState.originPolar.z;
      this.brushState.pointIndex += 1;
      this.brushState.positionsPolar[this.brushState.pointIndex * 3] = this.brushState.kddResult[i].vec3.x;
      this.brushState.positionsPolar[this.brushState.pointIndex * 3 + 1] = this.brushState.kddResult[i].vec3.y;
      this.brushState.positionsPolar[this.brushState.pointIndex * 3 + 2] = this.brushState.kddResult[i].vec3.z;
      this.brushState.pointIndex += 1;
    }
    (this.brushState.line.geometry as BufferGeometry).setDrawRange(1, this.brushState.pointIndex - 1);
    (this.brushState.line.geometry as BufferGeometry).attributes.position['needsUpdate'] = true;
    ChartScene.instance.render();
  }
  //#endregion
}
