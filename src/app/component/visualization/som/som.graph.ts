import { AbstractVisualization } from './../visualization.abstract.component';
import { EventEmitter } from '@angular/core';
import { GraphEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import {
  EntityTypeEnum,
  WorkspaceLayoutEnum
} from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { SomConfigModel, SomDataModel } from './som.model';

export class SomGraph extends AbstractVisualization
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
  private data: SomDataModel;
  private config: SomConfigModel;

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
  preRender(
    views: Array<VisualizationView>,
    layout: WorkspaceLayoutEnum,
    renderer: THREE.WebGLRenderer
  ) {}
  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    throw new Error('Method not implemented.');
  }
  updateData(config: GraphConfig, data: any) {
    this.config = config as SomConfigModel;
    this.data = data;
    this.removeObjects();
    this.addObjects();
  }

  enable(truthy: boolean) {}

  addObjects() {}

  removeObjects() {
    this.meshes.forEach(v => {
      ChartFactory.meshRelease(v);
      this.view.scene.remove(v);
    });
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
  //   }
  // }

  // private onMouseDown(e: ChartEvent): void {}

  constructor() {
    super();
  }
}
