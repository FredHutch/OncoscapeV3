import { GraphConfig } from 'app/model/graph-config.model';
import * as THREE from 'three';
import { MeshLine } from 'three.meshline';
import { LabelController, LabelOptions } from './../../../controller/label/label.controller';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { AbstractVisualization } from './../visualization.abstract.component';
import { HicConfigModel, HicDataModel } from './hic.model';

export class HicGraph extends AbstractVisualization {
  public lines: Array<THREE.Line | THREE.Mesh>;

  public set data(data: HicDataModel) {
    this._data = data;
  }
  public get data(): HicDataModel {
    return this._data as HicDataModel;
  }
  public set config(config: HicConfigModel) {
    this._config = config;
  }
  public get config(): HicConfigModel {
    return this._config as HicConfigModel;
  }

  create(entity: EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, labels, events, view);
    this.meshes = [];
    this.lines = [];
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
    this.addObjects(this._config.entity);
  }

  enable(truthy: boolean) {
    super.enable(truthy);
    this.view.controls.enableRotate = true;
  }

  addObjects(type: EntityTypeEnum): void {
    this.data.nodes.forEach((node, index) => {
      const group = ChartFactory.createDataGroup(
        node.gene,
        type,
        new THREE.Vector3(node.x, node.y, node.z)
      );
      this.meshes.push(group);
      this.view.scene.add(group);
    });
    ChartFactory.decorateDataGroups(this.meshes, this.decorators);

    if (this.config.showLinks) {
      const links = new THREE.Geometry();
      this.data.edges.forEach(edge => {
        const linkGeometry = new THREE.Geometry();
        linkGeometry.vertices.push(
          new THREE.Vector3(edge.source.x, edge.source.y, edge.source.z),
          new THREE.Vector3(edge.target.x, edge.target.y, edge.target.z)
        );
        const line = new THREE.Line(linkGeometry, ChartFactory.getLineColor(edge.color));
        this.lines.push(line);
        this.view.scene.add(line);
      });
    }
    if (this.config.showChromosome) {
      const geneLocations = this.data.nodes
        .filter(v => v.data) // Filter Out genes That Don't Have Chromosome Info
        .sort((a, b) => (a.data.tss <= b.data.tss ? -1 : 1)) // Sort Genes By Location On Chromosome
        .map(node => new THREE.Vector3(node.x, node.y, node.z));
      const curve = new THREE.CatmullRomCurve3(geneLocations);
      curve['type'] = 'chordal';
      const path = new THREE.CurvePath();
      path.add(curve);
      const chromosomeLine = new MeshLine();

      chromosomeLine.setGeometry(new THREE.Geometry().setFromPoints(path.getPoints() as Array<THREE.Vector3>));
      // ERROR: three.module.js:45643 THREE.CurvePath: .createPointsGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead
      //   chromosomeLine.setGeometry(path.createPointsGeometry(1000));

      const chromosomeMesh = new THREE.Mesh(
        chromosomeLine.geometry,
        ChartFactory.getMeshLine(0x90caf9, 1)
      );
      // chromosomeMesh.frustumCulled = false;
      this.lines.push(chromosomeMesh);
      this.view.scene.add(chromosomeMesh);
    }
  }

  removeObjects(): void {
    this.view.scene.remove(...this.meshes);
    this.view.scene.remove(...this.lines);
    this.meshes.length = 0;
    this.lines.length = 0;
  }

  onMouseDown(e: ChartEvent): void {}
  onMouseUp(e: ChartEvent): void {}
  onMouseMove(e: ChartEvent): void {}

  onShowLabels(): void {
    const labelOptions = new LabelOptions(this.view, 'FORCE');
    labelOptions.offsetX3d = 1;
    labelOptions.maxLabels = 100;
    this.labels.innerHTML = LabelController.generateHtml(this.meshes, labelOptions);
  }
}
