import { GraphConfig } from 'app/model/graph-config.model';
import { scaleLinear } from 'd3-scale';
import * as THREE from 'three';
import { MeshPhongMaterial, Vector2, Vector3 } from 'three';
import { MeshText2D } from 'three-text2d';
import { MeshLine } from 'three.meshline';
import { ILabel, LabelController, LabelOptions } from './../../../controller/label/label.controller';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory, DataDecoratorRenderer } from './../../workspace/chart/chart.factory';
import { AbstractVisualization } from './../visualization.abstract.component';
import { BoxWhiskersConfigModel, BoxWhiskersDataModel } from './boxwhiskers.model';

export class BoxWhiskersGraph extends AbstractVisualization {
  public set data(data: BoxWhiskersDataModel) {
    this._data = data;
  }
  public get data(): BoxWhiskersDataModel {
    return this._data as BoxWhiskersDataModel;
  }
  public set config(config: BoxWhiskersConfigModel) {
    this._config = config;
  }
  public get config(): BoxWhiskersConfigModel {
    return this._config as BoxWhiskersConfigModel;
  }

  public labelsForX: Array<ILabel>;
  public labelsForY: Array<ILabel>;
  public labelsForQ1: Array<ILabel>;
  public labelsForQ2: Array<ILabel>;
  public labelsForTitles: Array<ILabel>;

  public globalMeshes: Array<THREE.Object3D>;
  public lines: Array<THREE.Line | THREE.Mesh>;
  public bars: Array<THREE.Mesh>;
  public entityWidth = 6;
  public text: Array<MeshText2D>;

  public renderer: DataDecoratorRenderer = (group: THREE.Group, mesh: THREE.Sprite): void => {
    const color = mesh.material['color'].getHex();
    mesh.material['color'].setHex(0xffffff);
    mesh.material.opacity = 1;
    mesh.scale.set(2, 2, 2);
    const x = group.userData.index;
    const m = ChartFactory.getColorPhong(color);
    m.opacity = 0.8;
    m.transparent = true;
    this.bars[x * 2].material = m;
    this.bars[x * 2 + 1].material = m;
    this.lines[x].material = ChartFactory.getLineColor(color);
  };

  // Create - Initialize Mesh Arrays
  create(entity: EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, labels, events, view);
    this.meshes = [];
    this.globalMeshes = [];
    this.lines = [];
    this.bars = [];
    this.text = [];
    this.labelsForX = [];
    this.labelsForY = [];
    this.labelsForQ1 = [];
    this.labelsForQ2 = [];
    this.labelsForTitles = [];
    return this;
  }

  destroy() {
    super.destroy();
    this.removeObjects();
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    super.updateDecorator(config, decorators);
    ChartFactory.decorateDataGroups(this.meshes, this.decorators, this.renderer, 3);
  }

  updateData(config: GraphConfig, data: any) {
    super.updateData(config, data);
    this.removeObjects();
    this.addObjects();
  }

  enable(truthy: boolean) {
    super.enable(truthy);
    this.view.controls.enableRotate = false;
    // this.labelLayout.enable = truthy;
  }

  addObjects(): void {
    this.addGlobalMeshes();
    const propertyId = this.config.entity === EntityTypeEnum.GENE ? 'markerIds' : 'sampleIds';
    const objectIds = this.data[propertyId];
    const xOffset = this.entityWidth * this.data.result.length * -0.5;

    const domain = Math.ceil(Math.max(Math.abs(this.data.min), Math.abs(this.data.max)));
    const scale = scaleLinear()
      .domain([-domain, domain])
      .range([-600, 600]);

    const medianPoints = [];
    this.data.result.sort((a, b) => a.median - b.median).forEach((node, index) => {
      const median = scale(node.median);

      const xPos = xOffset + this.entityWidth * index;
      const group = ChartFactory.createDataGroup(
        objectIds[index],
        this.config.entity,
        new THREE.Vector3(xPos, median, 0.02)
      );
      // group.userData.tooltip = 'bbb';
      this.meshes.push(group);
      this.view.scene.add(group);

      this.labelsForX.push({
        position: new THREE.Vector3(xPos, median, 0.02),
        userData: { tooltip: node.median.toString() }
      });

      // Line
      const line = ChartFactory.lineAllocate(
        0xff0000,
        new Vector2(xPos, scale(node.min)),
        new Vector2(xPos, scale(node.max))
      );
      this.lines.push(line);
      this.view.scene.add(line);
      medianPoints.push(new Vector3(xPos, median, 0));

      const q1Height = median - scale(node.quartiles[0]);
      const q2Height = scale(node.quartiles[2]) - median;

      this.labelsForQ1.push({
        position: new THREE.Vector3(xPos, q1Height, 0),
        userData: { tooltip: q1Height.toFixed(2) }
      });
      this.labelsForQ2.push({
        position: new THREE.Vector3(xPos, q2Height, 0),
        userData: { tooltip: q2Height.toFixed(2) }
      });
      this.labelsForTitles.push(
        {
          position: new THREE.Vector3(-600, 0, 0),
          userData: { tooltip: 'Survival' }
        },
        {
          position: new THREE.Vector3(600, 0, 0),
          userData: { tooltip: 'Hazard' }
        }
      );

      const q1Box = ChartFactory.planeAllocate(0x029be5, this.entityWidth, q1Height, {});
      q1Box.position.set(xPos, median - q1Height * 0.5, 0);
      (q1Box.material as MeshPhongMaterial).opacity = 0.8;
      (q1Box.material as MeshPhongMaterial).transparent = true;
      this.bars.push(q1Box);
      this.view.scene.add(q1Box);

      const q2Box = ChartFactory.planeAllocate(0x029be5, this.entityWidth, q2Height, {});
      q2Box.position.set(xPos, median + q2Height * 0.5, 0);
      (q2Box.material as MeshPhongMaterial).opacity = 0.8;
      (q2Box.material as MeshPhongMaterial).transparent = true;
      this.bars.push(q2Box);
      this.view.scene.add(q2Box);

      group.userData.index = index;
    });

    const curve = new THREE.CatmullRomCurve3(medianPoints);
    curve['type'] = 'chordal';
    const path = new THREE.CurvePath();
    path.add(curve);

    const geo = new THREE.Geometry().setFromPoints(curve.getPoints(this.data.result.length));
    const chromosomeLine = new MeshLine();
    chromosomeLine.setGeometry(geo);
    const chromosomeMesh = new THREE.Mesh(chromosomeLine.geometry, ChartFactory.getMeshLine(0xff0000, 5));

    (chromosomeMesh.material as MeshPhongMaterial).opacity = 0.5;
    (chromosomeMesh.material as MeshPhongMaterial).transparent = true;
    chromosomeMesh.frustumCulled = false;
    chromosomeMesh.position.setZ(0.01);
    this.lines.push(chromosomeMesh);
    this.view.scene.add(chromosomeMesh);

    ChartFactory.decorateDataGroups(this.meshes, this.decorators, this.renderer, 3);
    this.tooltipController.targets = this.meshes;
    ChartFactory.configPerspectiveOrbit(
      this.view,
      new THREE.Box3(new Vector3(0, -900, -5), new THREE.Vector3(this.entityWidth, 900, 5))
    );
  }

  removeObjects(): void {
    this.view.scene.remove(...this.globalMeshes);
    this.view.scene.remove(...this.meshes);
    this.view.scene.remove(...this.lines);
    this.view.scene.remove(...this.text);
    this.view.scene.remove(...this.bars);
    this.globalMeshes.length = 0;
    this.meshes.length = 0;
    this.lines.length = 0;
    this.text.length = 0;
    this.bars.length = 0;
  }

  onMouseDown(): void {}
  onMouseUp(): void {}
  onMouseMove(e: ChartEvent): void {
    // Makes tooltips change
    super.onMouseMove(e);
  }
  onShowLabels(): void {
    // Step 1 - Create Options
    const optionsForX = new LabelOptions(this.view, 'PIXEL');
    optionsForX.fontsize = 0;
    optionsForX.origin = 'CENTER';
    optionsForX.align = 'CENTER';

    const optionsForQ1 = new LabelOptions(this.view, 'PIXEL');
    optionsForQ1.fontsize = 0;
    optionsForQ1.origin = 'CENTER';
    optionsForQ1.align = 'CENTER';

    const optionsForQ2 = new LabelOptions(this.view, 'PIXEL');
    optionsForQ2.fontsize = 0;
    optionsForQ2.origin = 'CENTER';
    optionsForQ2.align = 'CENTER';

    if (this.view.camera.position.z > 1400) {
      this.labels.innerHTML =
        '<div style="position:fixed;bottom:10px;left:50%; font-size: 1.2rem;">Samples</div>' +
        '<div style="position:fixed;right:10px;top:50%; transform: rotate(90deg);font-size: 1.2rem;">Geneset Mean Value</div>';
    } else if (this.view.camera.position.z > 350) {
      optionsForX.fontsize = 0;
      optionsForQ1.fontsize = 8;

      this.labels.innerHTML =
        LabelController.generateHtml(this.meshes, optionsForX) +
        LabelController.generateHtml(this.labelsForQ1, optionsForQ1) +
        LabelController.generateHtml(this.labelsForQ2, optionsForQ2);
    } else if (this.view.camera.position.z > 250) {
      optionsForX.fontsize = 10;
      optionsForQ1.fontsize = 10;

      this.labels.innerHTML =
        LabelController.generateHtml(this.meshes, optionsForX) +
        LabelController.generateHtml(this.labelsForQ1, optionsForQ1) +
        LabelController.generateHtml(this.labelsForQ2, optionsForQ2);
    } else if (this.view.camera.position.z > 20) {
      optionsForX.fontsize = 15;
      optionsForQ1.fontsize = 15;

      this.labels.innerHTML =
        LabelController.generateHtml(this.meshes, optionsForX) +
        LabelController.generateHtml(this.labelsForQ1, optionsForQ1) +
        LabelController.generateHtml(this.labelsForQ2, optionsForQ2);
    }
  }

  addGlobalMeshes(): void {
    const width = this.entityWidth * this.data.result.length;
    const left = -width * 0.5 - 5;
    const right = width * 0.5 + 5;
    const line = ChartFactory.lineAllocate(0x4a148c, new Vector2(left, 0), new Vector2(right, 0));
    line.position.setZ(1);
    this.globalMeshes.push(line);
    this.view.scene.add(line);
  }
}
