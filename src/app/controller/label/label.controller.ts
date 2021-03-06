import { EventEmitter } from '@angular/core';
import { GraphEnum } from 'app/model/enum.model';
import * as THREE from 'three';
import { Matrix4, Object3D } from 'three';
import { ChartEvents } from './../../component/workspace/chart/chart.events';
import { LabelForce } from './../../controller/label/label.force';
import { VisualizationView } from './../../model/chart-view.model';
import { ILabel } from './label.controller';

export interface ILabel {
  position: THREE.Vector3;
  userData: { tooltip: string };
}

export class LabelOptions {
  classes: Array<string> = []; // CSS Classes To Apply
  fontsize = 10;
  fontweight = null;
  ignoreFrustumX = false; // Only Make Sure Object Is In View On Y Axis
  ignoreFrustumY = false; // Only Make Sure Object Is In View On X Axis
  offsetX = 0; // Offset Computed X Position By Amount After 2D Transform
  offsetY = 0; // Offset Computed Y Position By Amount After 2D Transform
  offsetX3d = 1; // Offset Computed X Position By Amount Before 2D Transform
  offsetY3d = 0; // Offset Computed Y Position By Amount Before 2D Transform
  offsetZ3d = 0; // Offset Computed Y Position By Amount Before 2D Transform
  absoluteX: number = null; // Replace Computed X Position By Amount
  absoluteY: number = null; // Replace Computed Y Position By Amount
  rotate = 0; // Degrees To Rotate Text
  origin: 'LEFT' | 'CENTER' | 'RIGHT' = 'RIGHT'; // Origin For Transforms + Positions
  prefix = ''; // Copy To Add Before Label
  postfix = ''; // Copy To Add After Label
  align: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED' = 'LEFT'; // Text Alignment
  maxLabels = Infinity; // Maximum Number Of Labels
  algorithm: 'FORCE' | 'GRID' | 'PIXEL' = 'PIXEL'; // Layout Algorithm
  algorithmIterations = 20; // Number Of Iterations To Apply Algorithm (Force Algo)
  pointRadius = 3; // How Big Is The Point...
  background: string = null; // Background Color
  // margin: number = null;
  css = '';
  view: VisualizationView;
  constructor(
    view: VisualizationView,
    algorithm: 'FORCE' | 'GRID' | 'PIXEL' = 'PIXEL'
  ) {
    this.view = view;
    this.algorithm = algorithm;
  }
  generateCss(): string {
    let css = '';
    css += 'font-size:' + this.fontsize + 'px;';
    if(this.fontweight) {
      css += 'font-weight:' + this.fontweight +';';
    }
    css +=
      'transform-origin: ' +
      (this.origin === 'LEFT'
        ? '0%'
        : this.origin === 'RIGHT'
          ? '100%'
          : '50%') +
      ' 50%';
    css += ';text-align: ' + this.align.toLocaleLowerCase();
    css += ';transform: rotate(' + this.rotate + 'deg) ';
    css += ';position:absolute;';
    css += this.css;
    // css += 'margin:' + this.margin + 'px;';
    if (this.background !== null) {
      css += 'background:' + this.background + ';';
    }
    return css;
  }
}

export class LabelController {
  // State
  protected _view: VisualizationView;
  protected _enabled: boolean;
  protected _debounce: number;
  protected _timeout;
  protected _then: number;
  protected _debouncing: boolean;

  public onShow: EventEmitter<any>;
  public onHide: EventEmitter<any>;

  public static generateHtml(
    objects: Array<any>,
    options: LabelOptions
  ): string {
    if (!options.ignoreFrustumX && !options.ignoreFrustumY) {
      objects = LabelController.filterObjects(objects, options);
    }
    objects = LabelController.layoutObjects(objects, options);
    const html = LabelController.styleObjects(objects, options);
    return html;
  }

  private static layoutObjects(
    objects: Array<ILabel>,
    options: LabelOptions
  ): Array<ILabel> {
    return options.algorithm === 'FORCE'
      ? this.layoutObjectsForce(objects, options)
      : options.algorithm === 'GRID'
        ? this.layoutObjectsGrid(objects, options)
        : this.layoutObjectsPixel(objects, options);
  }

  public static createMap2D(
    objects: Array<Object3D>,
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
      const position = obj.position.clone().project(view.camera);
      position.x = position.x * halfWidth - halfWidth;
      position.y = position.y * halfHeight;
      position.z = 0;
      p[obj.userData.id] = position.add(offset);
      return p;
    }, {});
  }
  private static layoutObjectsPixel(
    objects: Array<ILabel>,
    options: LabelOptions
  ): Array<ILabel> {
    const viewport = options.view.viewport;
    const width = viewport.width;
    const height = viewport.height;
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    // var vector = new THREE.Vector3();
    const camera = options.view.camera;
    const offset = new THREE.Vector3(
      options.offsetX3d,
      options.offsetY3d,
      options.offsetZ3d
    );
    let data = objects.map(obj => {

      let customXOffset:number = 0;
      if(obj.userData['specialLabelXOffset']) {
        let lineAny:any = obj;
        let line:THREE.Line = (lineAny as THREE.Mesh).children[0] as THREE.Line;
        customXOffset = obj.userData['specialLabelXOffset'];
      }
      let customYOffset:number = 0;
      if(obj.userData['specialLabelYOffset']) {
        let lineAny:any = obj;
        let line:THREE.Line = (lineAny as THREE.Mesh).children[0] as THREE.Line;
        customYOffset = obj.userData['specialLabelYOffset'];
      }
      let customPosition:THREE.Vector3 = new THREE.Vector3(customXOffset, customYOffset, 0);
      const position = obj.position
        .clone()
        .add(offset)
        .add(customPosition) //
        .project(camera);
      position.x = position.x * halfWidth + halfWidth;
      position.y = -(position.y * halfHeight) + halfHeight;
      position.z = 0;
      if (options.absoluteY !== null) {
        position.y = options.absoluteY;
      }
      if (options.absoluteX !== null) {
        position.x = options.absoluteX;
      }
      return {
        position: position,
        userData: { tooltip: obj.userData.tooltip }
      };
    });
    if (options.ignoreFrustumX || options.ignoreFrustumY) {
      data = data.filter(
        v =>
          v.position.x > 0 &&
          v.position.y > 0 &&
          v.position.x < width &&
          v.position.y < height
      );
    }

    data = data.sort((a, b) => a.position.z - b.position.z);
    if (data.length > options.maxLabels) {
      data.length = options.maxLabels;
    }
    return data;
  }
  
  private static layoutObjectsForce(
    objects: Array<ILabel>,
    options: LabelOptions
  ): Array<ILabel> {
    const data = this.layoutObjectsPixel(objects, options);
    new LabelForce()
      .label(data)
      .width(options.view.viewport.width)
      .height(options.view.viewport.height)
      .start(options.algorithmIterations);
    return data;
  }

  private static layoutObjectsGrid(
    objects: Array<ILabel>,
    options: LabelOptions
  ): Array<ILabel> {
    return [];
  }

  private static styleObjects(
    objects: Array<ILabel>,
    options: LabelOptions
  ): string {
    let css = options.generateCss();
    if (options.align === 'RIGHT') {
      css += 'text-align:right;width: 300px;';
      options.offsetX = -300;
    }
    // const alignmentOffset = (options.align === 'LEFT') ? 0 : (options.align === 'CENTER') ? 150 : 0;
    // const alignText = (options.align === 'LEFT') ? 'text-align:left;' :
    //     (options.align === 'CENTER') ? 'text-align:center;' : 'text-align:right;';
    return objects.reduce((p, c) => {
      const translate =
        'left:' +
        Math.round(c.position.x + options.offsetX) +
        'px; top:' +
        Math.round(c.position.y + options.offsetY) +
        'px;';
      return (p +=
        '<div class="z-label" style="' +
        css +
        translate +
        '">' +
        options.prefix +
        c.userData.tooltip +
        options.postfix +
        '</div>');
    }, '');
  }

  public static filterObjectsInFrustum(
    objects: Array<any>,
    view: VisualizationView
  ): Array<Object3D> {
    const camera = view.camera as THREE.PerspectiveCamera;
    camera.updateMatrixWorld(true);
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    const cameraViewProjectionMatrix: Matrix4 = new Matrix4();
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    return objects.filter(obj => frustum.containsPoint(obj.position));
  }

  private static filterObjects(
    objects: Array<ILabel>,
    options: LabelOptions
  ): Array<any> {
    return this.filterObjectsInFrustum(objects, options.view);
  }

  // static reduceHtml(data: Array<{ x: number, y: number, name: string }>, align: 'RIGHT' | 'LEFT' | 'CENTER' = 'LEFT'): string {
  //     return (align === 'LEFT') ? data.reduce(
  //         (p, c) => {
  //             return p += '<div class="z-label" style="left:' +
  //                 c.x + 'px;top:' + c.y + 'px;">' + c.name + '</div>';
  //         }, '') :
  //         (align === 'RIGHT') ? data.reduce((p, c) => {
  //             return p += '<div class="z-label" style="text-align:right; width:300px; display:inline-block; left:' +
  //                 (c.x - 300) + 'px;top:' + c.y + 'px;">' + c.name + '</div>';
  //         }, '') :
  //             data.reduce((p, c) => {
  //                 return p += '<div class="z-label" style="text-align:center; width:300px; display:inline-block; left:' +
  //                     (c.x - 150) + 'px;top:' + c.y + 'px;">' + c.name + '</div>';
  //             }, '');
  // }

  /*
        Logic To Show Hide On Move
    */

  constructor(
    view: VisualizationView,
    events: ChartEvents,
    debounce: number = 300
  ) {
    this._view = view;
    this._enabled = this._enabled;
    this._debounce = debounce;
    this._debouncing = false;
    this._then = new Date().getTime();
    this.onShow = new EventEmitter();
    this.onHide = new EventEmitter();
  }

  public onChange(e: THREE.Event): void {
    const now = new Date().getTime();
    const elapsed = now - this._then;
    this._then = now;

    // Time Elapsed Exceeds Debounce
    if (elapsed > this._debounce) {
      this.onHide.emit();
    } else {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(this.tick.bind(this), this._debounce);
  }

  public tick(): void {
    this.onShow.emit();
  }
  public destroy(): void {
    this._view.controls.removeEventListener('change', this.onChange);
    clearTimeout(this._timeout);
    this.onHide.emit();
  }
  public get enable(): boolean {
    return this._enabled;
  }
  public set enable(value: boolean) {
    if (value === this._enabled) {
      return;
    }
    this._enabled = value;
    if (value) {
      this._view.controls.addEventListener('change', this.onChange.bind(this));
      this.onShow.emit();
    } else {
      this._view.controls.removeEventListener('change', this.onChange);
      clearTimeout(this._timeout);
      this.onHide.emit();
    }
  }
}
