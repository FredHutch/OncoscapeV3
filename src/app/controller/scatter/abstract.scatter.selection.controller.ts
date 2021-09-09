import { EventEmitter } from '@angular/core';
import { AbstractMouseController } from './../abstract.mouse.controller';
import { SelectionController } from './../selection/selection.controller';
import { Vector3, Euler, Quaternion, Points, Raycaster, Mesh, Geometry } from 'three';
import { VisualizationView } from 'app/model/chart-view.model';
import { ChartEvent, ChartEvents } from 'app/component/workspace/chart/chart.events';
import { EntityTypeEnum } from 'app/model/enum.model';
import * as TWEEN from '@tweenjs/tween.js';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { AbstractVisualization } from './../../component/visualization/visualization.abstract.component';  
import { OncoData } from 'app/oncoData';
import { GlobalGuiControls } from 'app/globalGuiControls';

export class StoredPoint {
  public index:number;
  public origPos: Vector3;
  public newPos: Vector3;
}
export class ScatterHistoryEntry {
  public creationTime:Date = new Date();
  public view: VisualizationView;
  public historyEntryType: 'DRAG' | 'ROTATE' | 'ZOOM' | 'PAN' = 'DRAG';
  constructor(v: VisualizationView ) {
    this.view = v;
  }
}

export class ScatterHistoryDragEntry extends ScatterHistoryEntry {
  public points:Array<StoredPoint> = [];
  constructor(v: VisualizationView  ) {
    super(v);
    this.historyEntryType = 'DRAG';
  }}

export class ScatterHistoryZoomEntry extends ScatterHistoryEntry {
  public oldZoom:number;
  public newZoom:number;
  constructor(v: VisualizationView  ) {
    super(v);
    this.historyEntryType = 'ZOOM';
  }}
  
export class ScatterHistoryRotateEntry extends ScatterHistoryEntry {
  public oldTarget: Vector3; // of OrbitControls
  public newTarget: Vector3;
  public oldPosition: Vector3; // camera position
  public newPosition: Vector3;
  public oldQuaternion: Quaternion;
  public newQuaternion: Quaternion;
  public oldRotation: Euler;
  public newRotation: Euler;
  public isPanning:boolean = false;

  constructor(v: VisualizationView  ) {
    super(v);
    this.historyEntryType = 'ROTATE';
  }}

export class ScatterHistory {
  private entryList:Array<ScatterHistoryEntry> = [];
  private currentPointer:number = -1;  // TBD: support this
  private controllerPoints:Points; // ?? TODO: need to clear on data load action?

  constructor( ) {

  }

  public clear() {
    let self = this;
    //window.setTimeout(() => {
      self.currentPointer = -1;
      self.entryList = [];
    //});
  }

  private pushAndTrim(action: ScatterHistoryEntry){
    // TBD: if we're not at front of list, trim off everything after.
    // We are writing a new history branch.
    console.log(`Check4branch @${this.currentPointer}, Last=${this.entryList.length-1} `);
    if(this.currentPointer > -1 &&  this.currentPointer < (this.entryList.length-1)) {
      this.entryList = this.entryList.slice(0,this.currentPointer+1);
    }
    this.entryList.push(action);
  }

  public pushDragAction(action:ScatterHistoryEntry, pointsObjFromController:Points){
    console.log('pushDragAction');
    this.controllerPoints = pointsObjFromController;
    // First remove any actions beyond where we are pointing to.
    // We are starting a new "timeline" (branch) of undo history.
    if (this.currentPointer > -1) {
      this.entryList = this.entryList.slice(0, this.currentPointer+1);
    }
    this.pushAndTrim(action);
    this.currentPointer++;
    ChartScene.instance.invalidatePrerender();
    let g = 'Push> ' +this.entryList.map(v => v.historyEntryType).toString();
    console.log(g);

  }

  public pushRotateAction(action:ScatterHistoryRotateEntry){
    console.log('pushRotateAction - need to set camera');
    // First remove any actions beyond where we are pointing to.
    // We are starting a new "timeline" (branch) of undo history.
    if (this.currentPointer > -1) {
      this.entryList = this.entryList.slice(0, this.currentPointer+1);
    }
    this.pushAndTrim(action);
    this.currentPointer++;
    ChartScene.instance.invalidatePrerender();
    let g = 'Push> ' +this.entryList.map(v => v.historyEntryType).toString();
    console.log(g);
  }

  public addZoomHistory(v: VisualizationView, oldZoom:number, newZoom:number){
    // If last history was zoom, replace it with a new one, keeping original oldZoom.
    if (this.currentPointer > -1 && this.entryList[this.entryList.length-1].historyEntryType == 'ZOOM') {
      let zoomEntry = this.entryList[this.entryList.length-1] as ScatterHistoryZoomEntry;
      zoomEntry.newZoom = newZoom; 
    } else {
      let zoomEntry = new ScatterHistoryZoomEntry(v);
      zoomEntry.oldZoom = oldZoom;
      zoomEntry.newZoom = newZoom;
      this.pushAndTrim(zoomEntry);
      this.currentPointer++;
    }
    let g = 'Push> ' +this.entryList.map(v => v.historyEntryType).toString();
    console.log(g);
  }

  private animateCameraAndTarget(entry:ScatterHistoryRotateEntry, newToOld:boolean){
    let camera = entry.view.camera;
    let orbControls = entry.view.controls;
    let endPos = newToOld ? entry.oldPosition : entry.newPosition;
    let endTarget = newToOld ? entry.oldTarget : entry.newTarget;
    let positionComplete:boolean = false;
    let targetComplete:boolean = false;
    if(endPos==null || endTarget==null){
      // ? Why would this occur ?
      alert('Error in Undo when moving the view.');
    } else {
      new TWEEN.Tween(camera.position)
      .to(
        {
          x: endPos.x,
          y: endPos.y,
          z: endPos.z,
        }, GlobalGuiControls.instance.undoTime)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        // camera.lookAt(oldTarget.x, oldTarget.y, oldTarget.z);
        entry.view.controls.update();
        ChartScene.instance.invalidatePrerender();
        ChartScene.instance.render();
      })
      .onComplete(() => {
        if (targetComplete) {
          OncoData.instance.inHistoryUndoRedo = false;
          return;
        }
        positionComplete = true;       
      })
      .start();        

      new TWEEN.Tween(orbControls.target)
      .to(
        {
          x: endTarget.x,
          y: endTarget.y,
          z: endTarget.z,
        }, GlobalGuiControls.instance.undoTime)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        camera.lookAt(endTarget.x, endTarget.y, endTarget.z);
        entry.view.controls.update();
        ChartScene.instance.invalidatePrerender();
        ChartScene.instance.render();
      })
      .onComplete(() => {
        if (positionComplete) {
          OncoData.instance.inHistoryUndoRedo = false;
          return;
        }
        targetComplete = true;       
      })
      .start();     
    }
  }

  private animateZoom(entry:ScatterHistoryZoomEntry, newToOld:boolean){
    let self = this;
    let origZoomDist:number = (entry.view.chart as AbstractVisualization).originalZoomDistance;
    let endZoom = origZoomDist / (newToOld ? entry.oldZoom : entry.newZoom) ;
    let startZoom = origZoomDist / (newToOld ? entry.newZoom : entry.oldZoom);

    let wrapper = {currentZoom: startZoom};
    new TWEEN.Tween(wrapper)
    .to(
      {
        currentZoom: endZoom
      }, GlobalGuiControls.instance.undoTime)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      self.setZoom(wrapper.currentZoom);
      entry.view.controls.update();
      ChartScene.instance.invalidatePrerender();
      ChartScene.instance.render();
    })
    .onComplete(() => {
      (entry.view.chart as AbstractVisualization)
      .adjustGraphDetailsBasedOnZoomChange( entry.oldZoom, entry.newZoom, false);
      OncoData.instance.inHistoryUndoRedo = false;
    })
    .start();        
  }

  public undo(){
    OncoData.instance.inHistoryUndoRedo  =true;
    let self = this;
    console.log(`undo currentpointer = ${this.currentPointer}`);
    let g = 'undo> ' +this.entryList.map(v => v.historyEntryType).toString();
    console.log(g);
    if (this.currentPointer > -1){
      console.log(`MJ Undo current:${this.currentPointer}, new:${this.currentPointer-1}`);
      let entry:ScatterHistoryEntry = this.entryList[this.currentPointer];
      this.currentPointer--;
      console.log(`Undo ${entry.historyEntryType}`);
      if (entry.historyEntryType == 'DRAG') {
        this.setScatterLocations(entry as ScatterHistoryDragEntry, true); // set to old values from this action.
      }

      if (entry.historyEntryType == 'ZOOM') {
        //this.setZoomFromNewOrOldDistance(entry as ScatterHistoryZoomEntry, true); // set to old values from this action.
        this.animateZoom(entry as ScatterHistoryZoomEntry, true);
      }

      if (entry.historyEntryType == 'ROTATE') {
        let entryAsRotatePan = entry as ScatterHistoryRotateEntry;
        this.animateCameraAndTarget(entryAsRotatePan, true);
          
        // console.log(`UNDO ROTATE`);
        // camera.position.set(pos.x, pos.y, pos.z);
        // camera.lookAt(0,0,0);
        // // let quat:Quaternion = (entry as ScatterHistoryRotateEntry).oldQuaternion;
        // // entry.view.camera.applyQuaternion(quat);
        // // entry.view.camera.quaternion.normalize();

      }
    }
    // otherwise, nothing left in undo history.
  }

  public setZoom5(){
    this.setZoom(1.0);
  }

  public setZoom6(){
    this.setZoom(1.2);
  }

  public setZoom7(){
    this.setZoom(1.4);
  }


  public redo(){
    OncoData.instance.inHistoryUndoRedo =true;
    let self = this;
    if (this.currentPointer < this.entryList.length-1){
      // There's still at least one history entry to redo.
      console.log(`MJ Redo current:${this.currentPointer}, new:${this.currentPointer+1}`);
      let g = 'redo> ' + this.entryList.map(v => v.historyEntryType).toString();
      console.log(g);
        this.currentPointer++;
      let entry:ScatterHistoryEntry = this.entryList[this.currentPointer];
      console.log(`Redo ${entry.historyEntryType}`);

      if (entry.historyEntryType == 'DRAG') {
        this.setScatterLocations(entry as ScatterHistoryDragEntry, false); 
      }

      if (entry.historyEntryType == 'ZOOM') {
        //this.setZoomFromNewOrOldDistance(entry as ScatterHistoryZoomEntry, false); // set to old values from this action.
        this.animateZoom(entry as ScatterHistoryZoomEntry, false);
      }

      if (entry.historyEntryType == 'ROTATE') {
        console.log(`REDO ROTATE `);
        let entryAsRotatePan = entry as ScatterHistoryRotateEntry;
        this.animateCameraAndTarget(entryAsRotatePan, false);
      }
    }
    OncoData.instance.inHistoryUndoRedo = false;
  }

  // zoomVal is a ratio, not a pixel value
  public setZoom(zoomVal: number){
    if (this.currentPointer > -1){
      let entry:ScatterHistoryEntry = this.entryList[this.currentPointer];
      let camera = entry.view.camera;
      let currDistance = camera.position.length();
      var desiredZoomDistance:number = zoomVal * currDistance;
      let graph:AbstractVisualization = entry.view.chart as AbstractVisualization;
      let factor = 1/(desiredZoomDistance/graph.originalZoomDistance) ;//currDistance;

      camera.position.x *= factor;
      camera.position.y *= factor;
      camera.position.z *= factor;
      //console.log(`set zoom to ${zoomVal}.  Factor = ${factor}  Z = ${camera.position.z}`);
      
      entry.view.controls.update();
      ChartScene.instance.invalidatePrerender();
      ChartScene.instance.render();      
    }
  }

  private setScatterLocations(entry:ScatterHistoryDragEntry, old:boolean){
    ChartScene.instance.invalidatePrerender();
    let self = this;

    let gPositionFromArray = this.controllerPoints.geometry['attributes']['gPositionFrom'].array;
    let positionArray = this.controllerPoints.geometry['attributes']['position'].array;

    // Now force a redraw.
    let positionAttribute =  this.controllerPoints.geometry['attributes']['position'];
    let gPositionFromAttribute = this.controllerPoints.geometry['attributes']['gPositionFrom'];
    // do this later: ChartScene.instance.render();
    let duration:number = 200;

    if(entry.points.length > 0) {
      let firstP = entry.points[0];
      let vectorStart:Vector3 = new Vector3(
        0.0, 0.0, 0.0
      );
      let vectorDiff:Vector3 = new Vector3(
        firstP.newPos.x - firstP.origPos.x,
        firstP.newPos.y - firstP.origPos.y,
        firstP.newPos.z - firstP.origPos.z
      );
      
      // create the tween
      var tweenVector3 = new TWEEN.Tween(vectorStart)
      .to({ x: vectorDiff.x, y: vectorDiff.y, z: vectorDiff.z, }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(function(d) {
        entry.points.forEach((p) => {
          let indexTimes3:number = p.index * 3;

          if(old) {
            positionArray[indexTimes3] = p.newPos.x - d.x;
            positionArray[indexTimes3+1] = p.newPos.y - d.y
            positionArray[indexTimes3+2] = p.newPos.z - d.z;
      
            gPositionFromArray[indexTimes3] = p.newPos.x - d.x;
            gPositionFromArray[indexTimes3+1] = p.newPos.y - d.y;
            gPositionFromArray[indexTimes3+2] = p.newPos.z - d.z;
          } else {
            positionArray[indexTimes3] = p.origPos.x + d.x;
            positionArray[indexTimes3+1] = p.origPos.y + d.y
            positionArray[indexTimes3+2] = p.origPos.z + d.z;
      
            gPositionFromArray[indexTimes3] = p.origPos.x + d.x;
            gPositionFromArray[indexTimes3+1] = p.origPos.y + d.y;
            gPositionFromArray[indexTimes3+2] = p.origPos.z + d.z;
          }
          ChartScene.instance.invalidatePrerender();
        });
        positionAttribute.needsUpdate = true;
        gPositionFromAttribute.needsUpdate = true;
        ChartScene.instance.invalidatePrerender();
        ChartScene.instance.render();
      })
      .onComplete(function(){
        // Mark something so we can start the next undo queued up?  TBD MJ
        console.log('tween done');
        OncoData.instance.inHistoryUndoRedo = false;
      });

      // start the tween
      tweenVector3.start();
    }


  }

}

export class AbstractScatterSelectionController extends SelectionController {
//  public onSelect: EventEmitter<any> = new EventEmitter();
  protected raycaster: Raycaster;
  public lastMouseDownEvent:ChartEvent = null;

  private _normalCanRotateFlag:boolean = true; // TEMPNOTE: was   this.view.controls.enableRotate;
  public canRotateFlag() {
    return this._normalCanRotateFlag;
  }

  public setCanRotateFlag(v: boolean) {
    this._normalCanRotateFlag = v;
  }

  private _everCanRotateFlag:boolean = true; 
  public canEverRotateFlag() {
    return this._everCanRotateFlag;
  }
  
  public setEverCanRotateFlag(v: boolean) {
    this._everCanRotateFlag = v;
  }

  //protected entitiesSelectable: EntityTypeEnum;
  protected _points: Points;
  public get points(): Points {
    return this._points;
  }
  public set points(p: Points) {
    this._points = p;
  }
  
  // If not null, it is a function from the graph component which should be called
  // whenever the scatter selection controller makes adjustments to the "points" object.
  // This is for cases like GenomeGraph, where the points object is not the real location
  // of the gene objects, but we use 'points' as a proxy for them.
  public funcAfterControllerAdjustsPoints = null;
  public callPostAdjustIfNeeded() {
    if(this.funcAfterControllerAdjustsPoints != null) {
      // console.log('Should call funcAfterControllerAdjustsPoints.');
      this.funcAfterControllerAdjustsPoints.call(this.view.chart);
    }
  }
  private _tooltips: Array<Array<{ key: string; value: string }>> = [];
  public getTooltip(index: number): Array<{ key: string; value: string }> {
    return this._tooltips.length > index ? this._tooltips[index] : [];
  }
  public set tooltips(value: Array<Array<{ key: string; value: string }>>) {
    this._tooltips = value;
  }

  public addZoomHistory(oldZoom:number, newZoom:number){
    this.scatterHistory.addZoomHistory(this.view, oldZoom, newZoom);
  }

  
  public scatterHistory:ScatterHistory = new ScatterHistory();

  constructor(entity: EntityTypeEnum, public view: VisualizationView, public events: ChartEvents, public debounce: number = 10) {
    super(entity, view, events, debounce);
    this.entitiesSelectable = entity;
    this.raycaster = new Raycaster();
    this.raycaster.params.Points.threshold = 5;
    this.scatterHistory = new ScatterHistory();
  }

  public destroy(): void {
    this.points = null;
    this.enable = false;
  }
}
