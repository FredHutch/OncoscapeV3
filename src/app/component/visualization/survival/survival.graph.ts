import { scaleLinear } from 'd3-scale';
import { GraphEnum } from 'app/model/enum.model';
import { EventEmitter } from '@angular/core';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { GraphConfig } from 'app/model/graph-config.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { AbstractVisualization } from './../visualization.abstract.component';
import * as THREE from 'three';
import { SurvivalDataModel, SurvivalConfigModel } from './survival.model';
import { Vector2, Shape, ShapeGeometry, MeshPhongMaterial, Mesh } from 'three';
import { MeshText2D, textAlign } from 'three-text2d';
export class SurvivalGraph extends AbstractVisualization {

    public set data(data: SurvivalDataModel) { this._data = data; }
    public get data(): SurvivalDataModel { return this._data as SurvivalDataModel; }
    public set config(config: SurvivalConfigModel) { this._config = config; }
    public get config(): SurvivalConfigModel { return this._config as SurvivalConfigModel; }

    public lines: Array<THREE.Line>;
    public confidences: Array<THREE.Mesh>;
    public grid: Array<THREE.Object3D>;

    // Create - Initialize Mesh Arrays
    create(labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
        super.create(labels, events, view);
        this.confidences = []
        this.meshes = [];
        this.lines = [];
        this.grid = [];
        return this;
    }

    destroy() {
        super.destroy();
        this.removeObjects();
    }

    updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
        super.updateDecorator(config, decorators);
        ChartFactory.decorateDataGroups(this.meshes, this.decorators);
    }

    updateData(config: GraphConfig, data: any) {
        super.updateData(config, data);
        this.removeObjects();
        this.addObjects(this.config.entity);
    }

    enable(truthy: boolean) {
        super.enable(truthy);
        this.view.controls.enableRotate = false;
    }


    addObjects(type: EntityTypeEnum): void {

        if (this.data.result.cohorts === undefined) { return; }

        const timeRange = this.data.result.cohorts.reduce((p, c) => {
            p[0] = Math.min(p[0], c.timeRange[0]);
            p[1] = Math.max(p[1], c.timeRange[1]);
            return p;
        }, [Infinity, -Infinity]);
        const xScale = scaleLinear().range([-500, 500]).domain(timeRange);
        const yScale = scaleLinear().range([-500, 500]).domain([0, 1]);

        this.data.result.cohorts.forEach(cohort => {
            let pts: Array<Vector2>;

            // Confidence
            const shape = new Shape();
            shape.autoClose = false;
            shape.moveTo(-500, -500);
            cohort.confidence.lower.forEach(pt => {
                shape.lineTo(xScale(pt[0]), yScale(pt[1]));
            });
            cohort.confidence.upper.reverse().forEach(pt => {
                shape.lineTo(xScale(pt[0]), yScale(pt[1]));
            });

            const geometry = new ShapeGeometry(shape);
            const material = ChartFactory.getColorPhong(0xbbdefb);
            material.opacity = 0.5;
            material.transparent = true;
            const mesh = new Mesh(geometry, material);
            this.confidences.push(mesh);
            this.view.scene.add(mesh);

            // Line
            pts = cohort.result.map(v => new Vector2(xScale(v[0]), yScale(v[1])));
            const line = ChartFactory.linesAllocate(0x1a237e, pts, {});
            this.lines.push(line);
            this.view.scene.add(line);

        });

        for (let x = -500; x <= 500; x += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD, new Vector2(x, -500), new Vector2(x, 500));
            this.grid.push(line);
            this.view.scene.add(line);
        }
        let percent = 0;
        for (let y = -500; y <= 500; y += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD, new Vector2(-500, y), new Vector2(500, y));
            this.grid.push(line);
            this.view.scene.add(line);
            const text = new MeshText2D(percent.toString(),
                { align: textAlign.right, font: '12px Ariel', fillStyle: '#666666', antialias: true });
            text.position.setX(-506);
            text.position.setY(y + 6);
            this.grid.push(text);
            this.view.scene.add(text);
            percent += 10;
        }

        this.onRequestRender.emit(this.config.graph);
        // const propertyId = (this.config.entity === EntityTypeEnum.GENE) ? 'mid' : 'sid';
        // const objectIds = this.data[propertyId];

        // this.data.nodes.forEach((node, index) => {
        //     const group = ChartFactory.createDataGroup(
        //         objectIds[index], this.config.entity, new THREE.Vector3(node.x, node.y, node.z));
        //     this.meshes.push(group);
        //     this.view.scene.add(group);
        // });
        ChartFactory.decorateDataGroups(this.meshes, this.decorators);
    }

    removeObjects(): void {
        this.view.scene.remove(...this.confidences);
        this.view.scene.remove(...this.meshes);
        this.view.scene.remove(...this.lines);
        this.view.scene.remove(...this.grid);
        this.confidences.length = 0;
        this.meshes.length = 0;
        this.lines.length = 0;
        this.grid.length = 0;
    }

    onMouseDown(e: ChartEvent): void { }
    onMouseUp(e: ChartEvent): void { }
    onMouseMove(e: ChartEvent): void { }
}


/*

import { DataDecorator } from './../../../model/data-map.model';
import { ChartUtil } from 'app/component/workspace/chart/chart.utils';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { SurvivalConfigModel, SurvivalDataModel } from './survival.model';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartEvents } from './../../workspace/chart/chart.events';
import { GraphConfig } from 'app/model/graph-config.model';
import { EntityTypeEnum, WorkspaceLayoutEnum } from './../../../model/enum.model';
import { GraphEnum } from 'app/model/enum.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { Injectable, EventEmitter, Output } from '@angular/core';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import {
    Vector2, Shape, ShapeGeometry, MeshPhongMaterial, Mesh, DoubleSide,
    Line, LineBasicMaterial, BufferGeometry, Vector3, Group
} from 'three';
import { MeshText2D, textAlign } from 'three-text2d';

export class SurvivalGraph implements ChartObjectInterface {

    // Emitters
    public onRequestRender: EventEmitter<GraphEnum> = new EventEmitter();
    public onConfigEmit: EventEmitter<{ type: GraphConfig }> = new EventEmitter<{ type: GraphConfig }>();
    public onSelect: EventEmitter<{ type: EntityTypeEnum, ids: Array<string> }> =
        new EventEmitter<{ type: EntityTypeEnum, ids: Array<string> }>();

    public meshes: Array<THREE.Mesh>;
    public decorators: DataDecorator[];
    config: SurvivalConfigModel;
    data: SurvivalDataModel;
    private view: VisualizationView;
    private grid: Group;
    private curves: Group;
    private isEnabled: boolean;

    enable(truthy: boolean) {
        if (this.isEnabled === truthy) { return; }
        this.isEnabled = truthy;
        this.view.controls.enabled = this.isEnabled;
    }
    updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
        throw new Error('Method not implemented.');
    }
    updateData(config: GraphConfig, data: any) {
        this.config = config as SurvivalConfigModel;
        this.data = data.result;

        this.removeObjects();
        this.addObjects();
    }

    removeObjects(): void {

    }

    drawGrid(): void {
        for (let x = -500; x <= 500; x += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD, new Vector2(x, -500), new Vector2(x, 500));
            this.grid.add(line);
        }
        let percent = 0;
        for (let y = -500; y <= 500; y += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD, new Vector2(-500, y), new Vector2(500, y));
            this.grid.add(line);
            const text = new MeshText2D(percent.toString(),
                { align: textAlign.right, font: '12px Ariel', fillStyle: '#666666', antialias: true });
            text.position.setX(-506);
            text.position.setY(y + 6);
            this.grid.add(text);
            percent += 10;
        }

        // ChartUtil.fitCameraToObject(this.view.camera,
        //     new THREE.Box3(new Vector3(-1500, -1500, -1500), new Vector3(1500,1500,1500))
        //         , 1, this.view.controls);

    }

    addObjects(): void {

        if (this.data.cohorts === undefined) {
            return;
        }

        const cohort = this.data.cohorts[0];

        const xScale = scaleLinear().range([-500, 500]).domain(cohort.timeRange);
        const yScale = scaleLinear().range([-500, 500]).domain([0, 1]);
        let pts: Array<Vector2>;

        const shape = new Shape();
        shape.autoClose = false;
        shape.moveTo(-500, -500);
        cohort.confidence.lower.forEach(pt => {
            shape.lineTo(xScale(pt[0]), yScale(pt[1]));
        });
        cohort.confidence.upper.reverse().forEach(pt => {
            shape.lineTo(xScale(pt[0]), yScale(pt[1]));
        });


        const geometry = new ShapeGeometry(shape);
        const material = new MeshPhongMaterial({ color: 0xbbdefb });
        material.opacity = 0.5;
        material.transparent = true;
        const mesh = new Mesh(geometry, material);
        this.curves.add(mesh);


        // pts = cohort.confidence.upper.map(v => new Vector2(xScale(v[0]), yScale(v[1])));
        // this.curves.add(ChartFactory.linesAllocate(0x2196f3, pts, {}));

        pts = cohort.result.map(v => new Vector2(xScale(v[0]), yScale(v[1])));
        this.curves.add(ChartFactory.linesAllocate(0x1a237e, pts, {}));

        // pts = cohort.confidence.lower.map(v => new Vector2(xScale(v[0]), yScale(v[1])));
        // this.curves.add(ChartFactory.linesAllocate(0x2196f3, pts, {}));

        // shape.autoClose = true;
        // const geometry = new ShapeBufferGeometry( shape );
        // const mesh = new Mesh( geometry, new MeshPhongMaterial( { color: 0xFF0000, side: DoubleSide } ) );

    }
    preRender(views: Array<VisualizationView>, layout: WorkspaceLayoutEnum, renderer: THREE.WebGLRenderer) {

    }
    create(labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
        this.view = view;
        this.view.controls.enableRotate = false;
        this.grid = new Group();
        this.drawGrid();
        this.view.scene.add(this.grid);
        this.curves = new Group();
        this.view.scene.add(this.curves);
        return this;
    }
    destroy() {
        this.view.scene.remove(this.grid);
        this.view.scene.remove(this.curves);
    }

    constructor() { }
}

*/