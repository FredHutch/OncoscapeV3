import { AbstractVisualization } from './../visualization.abstract.component';
import { DataDecorator } from './../../../model/data-map.model';
import { SvdDataModel, SvdConfigModel } from './svd.model';
import { EventEmitter, Output } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { GraphConfig } from 'app/model/graph-config.model';

import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { ChartEvents, ChartEvent } from './../../workspace/chart/chart.events';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import {
  DimensionEnum,
  EntityTypeEnum,
  WorkspaceLayoutEnum
} from './../../../model/enum.model';
import * as scale from 'd3-scale';
import * as _ from 'lodash';
import * as THREE from 'three';
import { ShapeEnum, GraphEnum } from 'app/model/enum.model';

export class SvdGraph extends AbstractVisualization
  implements ChartObjectInterface {
  // Emitters
  public onRequestRender: EventEmitter<GraphEnum> = new EventEmitter();
  public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{
    type: GraphConfig;
  }>();
  public onSelect: EventEmitter<{
    type: EntityTypeEnum;
    ids: Array<string>;
  }> = new EventEmitter<{ type: EntityTypeEnum; ids: Array<string> }>();

  // Chart Elements
  private data: SvdDataModel;
  private config: SvdConfigModel;

  public tooltipColorFromDecorator(id:any, color:any){
    return color;
  };

  // Objects
  public meshes: Array<THREE.Mesh>;
  public decorators: DataDecorator[];
  private lines: Array<THREE.Line>;
  private selector: THREE.Mesh;
  private selectorOrigin: { x: number; y: number };
  private selectorScale: any;

  // Private Subscriptions
  // private sMouseMove: Subscription;
  // private sMouseDown: Subscription;
  // private sMouseUp: Subscription;

  create(
    entity: EntityTypeEnum,
    labels: HTMLElement,
    events: ChartEvents,
    view: VisualizationView
  ): ChartObjectInterface {
    super.create(entity, labels, events, view);
    this.labels = labels;
    this.events = events;
    this.view = view;
    this.isEnabled = false;
    this.meshes = [];
    this.lines = [];
    this.selector = new THREE.Mesh(
      new THREE.SphereGeometry(3, 30, 30),
      new THREE.MeshStandardMaterial({ opacity: 0.2, transparent: true })
    );
    return this;
  }

  destroy() {
    this.enable(false);
    this.removeObjects();
  }
  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    throw new Error('Method not implemented.');
  }
  updateData(config: GraphConfig, data: any) {
    this.config = config as SvdConfigModel;
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
    // if (this.isEnabled === truthy) {
    //   return;
    // }
    // this.isEnabled = truthy;
    // this.view.controls.enabled = this.isEnabled;
    // if (truthy) {
    //   this.sMouseUp = this.events.chartMouseUp.subscribe(
    //     this.onMouseUp.bind(this)
    //   );
    //   this.sMouseDown = this.events.chartMouseDown.subscribe(
    //     this.onMouseDown.bind(this)
    //   );
    //   this.sMouseMove = this.events.chartMouseMove.subscribe(
    //     this.onMouseMove.bind(this)
    //   );
    // } else {
    //   this.sMouseUp.unsubscribe();
    //   this.sMouseDown.unsubscribe();
    //   this.sMouseMove.unsubscribe();
    // }
  }

  addObjects() {
    // const weightLength = this.data.loadingsScaled.length;
    // const layoutLength = this.data.eigenvectorsScaled.length;
    // if (this.config.showVectors) {
    //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0091EA, linewidth: 2 });
    //     for (let i = 0; i < weightLength; i++) {
    //         const position = this.data.loadingsScaled[i];
    //         const geometry = new THREE.Geometry();
    //         geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    //         geometry.vertices.push(new THREE.Vector3(position[0], position[1], position[2]));
    //         const line = new THREE.Line(geometry, lineMaterial);
    //         this.lines.push(line);
    //         this.view.scene.add(line);
    //     }
    // }
    // for (let i = 0; i < layoutLength; i++) {
    //     const position = this.data.eigenvectorsScaled[i];
    //     let size = (i < sizeLength) ? this.data.pointSize[i] : 1;
    //     size *= 2;
    //     const shape = (i < shapeLength) ? ChartFactory.getShape(this.data.pointShape[i]) :
    //         ChartFactory.getShape(ShapeEnum.SQUARE);
    //     const color = (i < colorLength) ? ChartFactory.getColorPhong(this.data.pointColor[i]) :
    //         ChartFactory.getColorPhong(0xDD2C00);
    //     const point = new THREE.Mesh(shape, color);
    //     point.position.x = position[0];
    //     point.position.y = (this.config.dimension === DimensionEnum.ONE_D) ? 0 : position[1];
    //     point.position.z = (this.config.dimension !== DimensionEnum.THREE_D) ? 0 : position[2];
    //     point.scale.set(size, size, size);
    //     point.userData.color = this.data.pointColor[i];
    //     point.userData.id = this.data.sampleIds[i];
    //     this.meshes.push(point);
    //     this.view.scene.add(point);
    // }
  }
  removeObjects() {
    this.meshes.forEach(v => this.view.scene.remove(v));
    this.meshes.length = 0;
    this.lines.forEach(v => this.view.scene.remove(v));
    this.lines.length = 0;
  }

  // Events
  // private onMouseMove(e: ChartEvent): void {
  //   if (!this.view.controls.enabled) {
  //     const mouseEvent: MouseEvent = e.event as MouseEvent;
  //     const deltaX = Math.abs(this.selectorOrigin.x - mouseEvent.clientX);
  //     const deltaY = Math.abs(this.selectorOrigin.y - mouseEvent.clientY);
  //     const delta = Math.max(deltaX, deltaY);
  //     const scaleMe = this.selectorScale(delta);
  //     this.selector.scale.set(scaleMe, scaleMe, scaleMe);
  //     this.onRequestRender.next();
  //     const radius =
  //       this.selector.geometry.boundingSphere.radius * this.selector.scale.x;
  //     const position = this.selector.position;
  //     const meshes = this.view.scene.children
  //       .filter(v => v.type === 'Mesh')
  //       .forEach(o3d => {
  //         const mesh = o3d as THREE.Mesh;
  //         const material: THREE.MeshStandardMaterial = mesh.material as THREE.MeshStandardMaterial;
  //         if (mesh.position.distanceTo(position) < radius) {
  //           material.color.set(0xff0000);
  //         } else {
  //           material.color.set(0x00ff00);
  //         }
  //       });
  //   }
  // }
  // private onMouseUp(e: ChartEvent): void {
  //   if (!this.view.controls.enabled) {
  //     const radius =
  //       this.selector.geometry.boundingSphere.radius * this.selector.scale.x;
  //     const position = this.selector.position;
  //     const samples = this.view.scene.children.filter(v => v.type === 'Mesh');

  //     samples.forEach(v => {
  //       const mesh = v as THREE.Mesh;
  //       const material: THREE.MeshStandardMaterial = mesh.material as THREE.MeshStandardMaterial;
  //       material.color.set(mesh.userData.color);
  //     });

  //     const selected = samples.filter(
  //       v => v.position.distanceTo(position) < radius
  //     );

  //     const ids = selected.map(v => v.userData.id);

  //     this.onSelect.next({ type: EntityTypeEnum.SAMPLE, ids: ids });
  //     this.view.scene.remove(this.selector);
  //     this.view.controls.enabled = true;
  //     this.onRequestRender.next();
  //   }
  // }
  // private onMouseDown(e: ChartEvent): void {}

  constructor() {
    super();
  }
}
