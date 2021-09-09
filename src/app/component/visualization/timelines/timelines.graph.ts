import { TimelinesConfigModel, TimelinesDataModel } from 'app/component/visualization/timelines/timelines.model';

import { ChartFactory } from 'app/component/workspace/chart/chart.factory';
import { GraphConfig } from 'app/model/graph-config.model';
import { ScaleLinear } from 'd3';
import { scaleLinear } from 'd3-scale';
import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';

import { ILabel, LabelController, LabelOptions } from './../../../controller/label/label.controller';

import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { AbstractVisualization } from './../visualization.abstract.component';
import { TimelinesStyle } from './timelines.model';
import { GlobalGuiControls } from 'app/globalGuiControls';
import { TooltipController, ComplexTooltipData } from './../../../controller/tooltip/tooltip.controller';

export class axisDataForGrouping {
  public groupingName: string;
  public minY: number = 0;
  public maxY: number = 0;
  public numPatients: number = 0;
  public patients:Array<any>
}

export class TimelinesGraph extends AbstractVisualization {
  public set data(data: TimelinesDataModel) {
    this._data = data;
  }
  public get data(): TimelinesDataModel {
    return this._data as TimelinesDataModel;
  }
  public set config(config: TimelinesConfigModel) {
    this._config = config;
  }
  public get config(): TimelinesConfigModel {
    return this._config as TimelinesConfigModel;
  }

  public patients: Array<THREE.Group>;
  public attrs: THREE.Group;
  public lines: THREE.LineSegments;
  public objs: Array<THREE.Object3D>;
  public meshes: Array<THREE.Object3D>;
  public decorators: DataDecorator[];
  public clipPlanes: Array<THREE.Object3D> = [];
  public database: string;
  public yAxis: Array<ILabel>;
  public xAxis: Array<ILabel>;
  public grid: THREE.LineSegments;
  public bgTime: HTMLElement;
  public bgPatient: HTMLElement;
  public labelYAxis: LabelOptions;
  public labelXAxis: LabelOptions;

  private axisDataForGroups:Array<axisDataForGrouping> = [];

  public recreate() {
    this.removeObjects();
    this.addObjects(this.config.entity);
  }

  // Create - Initialize Mesh Arrays
  create(entity: EntityTypeEnum, html: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, html, events, view);
    this.bgTime = <HTMLDivElement>document.createElement('div');
    this.bgTime.className = 'timelines-bg-time';
    this.labels.insertAdjacentElement('beforebegin', this.bgTime);

    this.bgPatient = <HTMLDivElement>document.createElement('div');
    this.bgPatient.className = 'timelines-bg-patient';
    this.labels.insertAdjacentElement('beforebegin', this.bgPatient);

    this.yAxis = [];
    this.xAxis = [];

    this.events = events;
    this.view = view;

    this.meshes = [];
    this.objs = [];
    this.patients = [];

    this.attrs = new THREE.Group();

    this.labelXAxis = new LabelOptions(this.view, 'PIXEL');
    this.labelXAxis.absoluteY = this.view.viewport.height - 20;
    this.labelXAxis.ignoreFrustumY = true;
    this.labelXAxis.align = 'LEFT';
    this.labelXAxis.origin = 'RIGHT';
    // this.labelXAxis.css = 'width:300px;';
    // this.labelXAxis.postfix = ' Times';
    this.labelXAxis.fontsize = 0;

    // y labels
    this.labelYAxis = new LabelOptions(this.view, 'PIXEL');
    this.labelYAxis.absoluteX = this.view.viewport.width - 10;
    this.labelYAxis.ignoreFrustumX = true;
    this.labelYAxis.offsetY = -10;
    this.labelYAxis.origin = 'LEFT';
    this.labelYAxis.align = 'RIGHT';
    this.labelYAxis.fontsize = 0;
    // this.labelYAxis.css = 'width:300px;';
    return this;
  }

  destroy() {
    super.destroy();
    this.removeObjects();
  }

  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    super.updateDecorator(config, decorators);
    ChartFactory.decorateDataGroups(this.objs, this.decorators);
    this.tooltipController.targets = this.objs;
  }

  updateData(config: GraphConfig, data: any) {
    window['computedFeedbackForForm'][config.graph.toString()+'_128'] = data.computedFeedbackForForm;
    config['firmColors'] = data.computedFeedbackForForm.firmColors;
    super.updateData(config, data);
    this.removeObjects();
    this.addObjects(this.config.entity);
  }

  enable(truthy: boolean) {
    super.enable(truthy);
    this.view.controls.enableRotate = false;
  }

  removeObjects(): void {
    this.view.scene.remove(...this.meshes);
    this.view.scene.remove(...this.objs);
    this.view.scene.remove(...this.clipPlanes);
    this.view.scene.remove(...this.patients);
    this.view.scene.remove(this.attrs);
    this.view.scene.remove(this.lines);

    this.meshes.length = 0;
    this.objs.length = 0;
    this.clipPlanes.length = 0;
    this.patients.length = 0;
    this.attrs = new THREE.Group();
    this.view.scene.remove(this.grid);
  }

  
  addAxisMarkersForGroups(
    group: THREE.Group,
    yOffset: number,
    xOffsetFromHeatmap: number
  ): void {
    let markerThickness:number = 40 ;
    let thisColor:number = 0xd3d3d3;
    this.axisDataForGroups.forEach(ad => {
      thisColor = thisColor == 0xd3d3d3 ? 0x808080 : 0xd3d3d3;
      let groupHeight:number = ad.maxY - ad.minY;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry( markerThickness,  groupHeight),
        ChartFactory.getColorPhong(thisColor)
      );
      mesh.position.set(xOffsetFromHeatmap-markerThickness, (groupHeight/2) + ad.minY - yOffset, 0);
      mesh.userData = {
        tooltip: `Group: ${ad.groupingName}<hr>${ad.numPatients} Patients with events.`,
        color: thisColor,
        width: markerThickness,
        height: groupHeight
      };
      if (ad.groupingName == 'NotInPatientTable') {
        mesh.userData.tooltip = mesh.userData.tooltip + `<hr>Missing IDs:<br>${JSON.stringify(ad.patients.map(p => p[0].p))}`;
      }
      group.add(mesh);
      this.objs.push(mesh)
    });

  }

  addTic(
    barLayout: any,
    event: any,
    eventIndex: number,
    bar: number,
    barHeight: number,
    rowHeight: number,
    group: THREE.Group,
    scale: ScaleLinear<number, number>,
    yOffset: number,
    barZ: number,
    ticAtThisTime: number  // 0 for first tic for this patient starting at this event.start. 1 for next, etc
  ): void {
    const s = scale(event.start);
    const e = scale(event.end);
    const w = Math.round(e - s);
    const bandHeightScale = barLayout['bandHeight'] != null ? parseFloat(barLayout['bandHeight']) : 0.2;
    const width = w < 1 ? 1 : w;
    const height = barHeight * bandHeightScale;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      ChartFactory.getColorPhong(event.color)
    );
    let yPos = rowHeight - bar * barHeight - 2 - yOffset;
    // In case of perfect overlap of previous tic event, such as in EK's data, 
    // we will drop the line down to just below the previous one.
    // This allows us to show , e.g., two treatments at once.
    // Here we assume the data is imported from TSV file where they are already sorted by start date.
    yPos = yPos - (barHeight * bandHeightScale * ticAtThisTime);

    const zSpot:number = barZ + (0.005 * eventIndex);
    mesh.position.set(s + w * 0.5, yPos, zSpot);
    let eventSubtype = event.subtype ? event.subtype.replaceAll(" ","_") : "null";
    let idDataForSvg:string = `patientId:${event.p}.type:${event.type}.subtype:${eventSubtype}.style:tic.i:${eventIndex}`;

    mesh.userData = {
      tooltip: this.complexTooltipFromEvent(event),
      color: event.color,
      width: width,
      height: height,
      idDataForSvg: idDataForSvg
  };
    group.add(mesh);
    this.objs.push(mesh);
  }

  addArc(
    barLayout: any,
    event: any,
    eventIndex: number,
    bar: number,
    barHeight: number,
    rowHeight: number,
    group: THREE.Group,
    scale: ScaleLinear<number, number>,
    yOffset: number,
    barZ: number
  ): void {
    if (event.start !== event.end) {
      const s = scale(event.start);
      const e = scale(event.end);
      const w = Math.round(e - s);
      const c = Math.abs(e - s) * 0.5 + Math.min(e, s);
      const yPos = rowHeight - bar * barHeight - 2 - yOffset;
      const mesh = ChartFactory.lineAllocateCurve(
        event.color,
        new THREE.Vector2(s, yPos - 2),
        new THREE.Vector2(e, yPos - 2),
        new THREE.Vector2(c, yPos + 2),
        event // not currently using this, but storing it in userData.
      );

      mesh.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color
      };
      group.add(mesh);
      this.objs.push(mesh);
    } else {
      const s = scale(event.start);
      const yPos = rowHeight - bar * barHeight - 2 - yOffset;
      const mesh = ChartFactory.lineAllocate(event.color, new Vector2(s, yPos - 2), new Vector2(s, yPos + 2));
      mesh.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color
      };
      group.add(mesh);
      this.objs.push(mesh);
    }
  }

  addSymbol(
    barLayout: any,
    event: any,
    eventIndex: number,
    bar: number,
    barHeight: number,
    rowHeight: number,
    group: THREE.Group,
    scale: ScaleLinear<number, number>,
    yOffset: number,
    barZ: number,
    numSymbolsInOverlap: number, // if x is >1.6 away, we know the previous symbol won't overlap us, and we can
    xOfLastSymbol: number
  ): any {
    const s = scale(event.start);
    const e = scale(event.end);
    const w = Math.round(e - s);
    // ChartFactory.getColorPhong(0x000000)
    let newNumSymbolsInOverlap = numSymbolsInOverlap;

    let shapeToUse = barLayout.shape;
    if(event.start !== event.end){
      shapeToUse = 'triangle';
    }
    /* 
    let useCircleNotTriangle:boolean  = true;
    if (event.start !== event.end || barLayout.shape == 'triangle') {
      useCircleNotTriangle=false;
    }
    */

    let radius:number = 1.4;

    const yPos = rowHeight - bar * barHeight - 2 - yOffset;
    let edgeThisSymbolZ = 0.9 + (0.6 * barZ);
    const thisSymbolZ = edgeThisSymbolZ + 0.2; //1 + (0.6 * barZ) - (0.01 * eventIndex);//eventIndex);
    let eventSubtype = event.subtype ? event.subtype.replaceAll(" ","_") : "null";
    let shape = event.shape ? event.shape.replaceAll(" ","_") : "circle";
    let idDataForSvg:string = `patientId:${event.p}.type:${event.type}.subtype:${eventSubtype}.style:symbol.shape:${shape}.i:${eventIndex}`;
    // console.log(`idDataForSvg = ${idDataForSvg}`);
    switch (shapeToUse){
      case 'triangle':
      // use triangle
      const triangleGeometry = new THREE.Geometry();
      triangleGeometry.vertices.push(new THREE.Vector3(0.0, 1.4, thisSymbolZ));
      triangleGeometry.vertices.push(new THREE.Vector3(-1.4, -1.4, thisSymbolZ));
      triangleGeometry.vertices.push(new THREE.Vector3(1.4, -1.4, thisSymbolZ));
      triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
      const triangle = new THREE.Mesh(triangleGeometry, ChartFactory.getColorPhong(event.color));
      triangle.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color,
        radius: radius,
        idDataForSvg: idDataForSvg
      };
      triangle.position.set(scale(event.end), yPos, 0);
      group.add(triangle);
      this.objs.push(triangle);
      break;

      case 'square':
      // use square
      const squareGeometry = new THREE.Geometry();
      squareGeometry.vertices.push(new THREE.Vector3(-1.4, 1.4, thisSymbolZ));
      squareGeometry.vertices.push(new THREE.Vector3(1.4, 1.4, thisSymbolZ));
      squareGeometry.vertices.push(new THREE.Vector3(1.4, -1.4, thisSymbolZ));
      squareGeometry.vertices.push(new THREE.Vector3(-1.4, -1.4, thisSymbolZ));
      squareGeometry.faces.push(new THREE.Face3(2, 1, 0));
      squareGeometry.faces.push(new THREE.Face3(2, 0, 3));
      const square = new THREE.Mesh(squareGeometry, ChartFactory.getColorPhong(event.color));
      square.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color,
        radius: radius,
        idDataForSvg: idDataForSvg
      };
      square.position.set(scale(event.end), yPos, 0);
      group.add(square);
      this.objs.push(square);
      break;

      case 'diamond':
      // use square
      const diamondGeometry = new THREE.Geometry();
      diamondGeometry.vertices.push(new THREE.Vector3(0, 1.6, thisSymbolZ));
      diamondGeometry.vertices.push(new THREE.Vector3(1.6, 0, thisSymbolZ));
      diamondGeometry.vertices.push(new THREE.Vector3(0, -1.6, thisSymbolZ));
      diamondGeometry.vertices.push(new THREE.Vector3(-1.6, 0, thisSymbolZ));
      diamondGeometry.faces.push(new THREE.Face3(2, 1, 0));
      diamondGeometry.faces.push(new THREE.Face3(2, 0, 3));
      const diamond = new THREE.Mesh(diamondGeometry, ChartFactory.getColorPhong(event.color));
      diamond.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color,
        radius: radius,
        idDataForSvg: idDataForSvg
      };
      diamond.position.set(scale(event.end), yPos, 0);
      group.add(diamond);
      this.objs.push(diamond);
      break;

      default: // circle
      
      // Black edge circle 
      if(GlobalGuiControls.instance.timelineCircleBorder){
        radius = 1.6;
        const edgeMesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 36), ChartFactory.getColorPhong(0x000000));
        const edgeYPos = rowHeight - bar * barHeight - 2 - yOffset;
        if ((s - xOfLastSymbol) <= (2 * 1.6)) {   // we need to bump the z out
          edgeThisSymbolZ = edgeThisSymbolZ + (0.3 * numSymbolsInOverlap);//eventIndex);
          newNumSymbolsInOverlap++;
        } else {
          newNumSymbolsInOverlap = 1;
        }
        // console.log('MJ edgeThisSymbolZ FINAL = ' + edgeThisSymbolZ);
        edgeMesh.position.set(s, edgeYPos, edgeThisSymbolZ);
        edgeMesh.userData = {
          tooltip: this.complexTooltipFromEvent(event),
          color: event.color,
          radius: radius,
          doNotPrint: true
        };
        group.add(edgeMesh);
        this.objs.push(edgeMesh);
      }

      // Main circle
      radius = 1.4;
      const mesh = new THREE.Mesh(new THREE.CircleGeometry(1.4, 36), ChartFactory.getColorPhong(event.color));
      mesh.position.set(s, yPos, thisSymbolZ);
      mesh.userData = {
        tooltip: this.complexTooltipFromEvent(event),
        color: event.color,
        radius: radius,
        idDataForSvg: idDataForSvg
      };
      group.add(mesh);
      this.objs.push(mesh);
    }



    return { newXOfLastSymbol: s, newNumSymbolsInOverlap: newNumSymbolsInOverlap};
  }

  addAttrs(rowHeight, rowCount, pidMap): any {
    const d = this.data;
    const chartHeight = rowHeight * rowCount;
    const chartHeightHalf = chartHeight * 0.5;

    let leftmostXEdge: number = -500;
    this.data.result.attrs.pids.forEach((pid, pidIndex) => {
      const rowIndex = pidMap[pid];
      const yPos = rowHeight * rowIndex - chartHeightHalf;
      this.data.result.attrs.attrs.forEach((attr, attrIndex) => {
        const value = attr.values[pidIndex].label;
        const col = attr.values[pidIndex].color;
        const xPos = -500 - attrIndex * rowHeight;
        const width = rowHeight - 2; // ?
        const height = rowHeight - 2;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          ChartFactory.getColorPhong(col)
        );
        leftmostXEdge = Math.min(leftmostXEdge, xPos);
        mesh.position.set(xPos - rowHeight * 0.5 - 1, yPos+(rowHeight * 0.5 ), 10);
        mesh.userData = {
          tooltip: this.formatAttrTooltip(attr, pidIndex, pid),
          color: col,
          width: width,
          height: height,
          data: {
            type: 'attr',
            field: attr.prop.replace(/_/gi, ' '),
            value: value != null ? value.toString() : 'NA'
          }
        };
        this.attrs.add(mesh);
        this.objs.push(mesh);
      });
    });
    this.view.scene.add(this.attrs);
    return { leftmostXEdge: leftmostXEdge};
  }

  addLines(rowHeight: number, rowCount: number, chartHeight: number, chartHeightHalf: number): void {
    const geometry: THREE.Geometry = new THREE.Geometry();
    console.log(`MJ Timelines: addLines chartHeightHalf = ${JSON.stringify(chartHeightHalf)}.`);

    geometry.vertices = [];
    for (let i = -540; i <= 540; i += 60) {
      // new THREE.Vector2(i, chartHeight), new THREE.Vector2(i, 0)
      geometry.vertices.push(new THREE.Vector3(i, chartHeightHalf, 0), new THREE.Vector3(i, -chartHeightHalf, 0));
    }
    for (let i = 0; i < rowCount + 1; i++) {
      geometry.vertices.push(
        new THREE.Vector3(-540, i * rowHeight - chartHeightHalf, 0),
        new THREE.Vector3(540, i * rowHeight - chartHeightHalf, 0)
      );
    }
    const material = ChartFactory.getLineColor(0xeeeeee);
    this.grid = new THREE.LineSegments(geometry, material);
    this.grid.updateMatrix();
    this.view.scene.add(this.grid);
  }

  // #endregion
  addObjects(entity: EntityTypeEnum): void {
    // Helper Variables
    const bars = this.config.bars;
    let pts: Array<any> = this.data.result.patients;
    // console.log(`MJ Timelines: addObjects patients = ${JSON.stringify(pts)}.`);
    // junk    pts = Object.keys(pts).map(v => pts[v]);

    const barHeight = 4; // bars.reduce( (p,c) => p = Math.max(p, c.row), -Infinity) + 1;
    const barLayout = bars
    .filter(v => v.style !== 'None')
    .filter(v => v.events != null)
    .sort((a, b) => a.z - b.z)
      .sort((a, b) => a.row - b.row);
    let track = -1;
    let lastRow = -1;
    for (let i = 0; i < barLayout.length; i++) {
      const bar = barLayout[i];
      if (bar.row !== lastRow) {
        lastRow = bar.row;
        track += 1;
      }
      bar.track = track;
    }
    const rowHeight = (track + 1) * barHeight;
    const rowCount = pts.length;
    const chartHeight = rowHeight * rowCount;
    const chartHeightHalf = chartHeight * 0.5;

    // Grid
    this.addLines(rowHeight, rowCount, chartHeight, chartHeightHalf);

    // Scale
    const scale = scaleLinear();
    scale.range([-500, 500]);
    if (this.config.range[0] !== 0 || this.config.range[1] !== 100) {
      const span = this.data.result.minMax.max - this.data.result.minMax.min;
      const minOffset = (this.config.range[0] / 100) * span;
      const maxOffset = (this.config.range[1] / 100) * span;
      const min = this.config.range[0] !== 0 ? this.data.result.minMax.min + minOffset : this.data.result.minMax.min;
      const max = this.config.range[1] !== 100 ? maxOffset : this.data.result.minMax.max;
      scale.domain([min, max]);
    } else {
      console.log(`MJ Timelines: not in scale if.`);
      scale.domain([this.data.result.minMax.min, this.data.result.minMax.max]);
    }

    console.log(`MJ Timelines: after scale domain set.`);
    console.dir(scale);

    // X-Axis
    this.xAxis.length = 0;
    for (let i = -500; i <= 500; i += 50) {
      this.xAxis.push({
        position: new THREE.Vector3(i, 0, 0),
        userData: { tooltip: Math.round(scale.invert(i)).toString() }
      });
    }

    // Patients + PID MAP
    const pidMap: any = {};
    this.axisDataForGroups = []; // Reset between graphing calls.
    let currentGrouping:axisDataForGrouping = null;
    let isGrouped:boolean = this.config.group.label != 'None';
    this.yAxis.length = 0;
    pts.forEach((patient, i) => {
      let barLayoutRowNumber = i+1; // 1 based!

      if (isGrouped) {
        // Create axisDataForGroups, to put descriptive blocks in the left axis,
        // to indicate where the "group by" groupings break.
        // For example, one thin rectangle for deceased patients, then
        // a differently-colored rectangle for alive patients.
        //
        // The math **assumes** patients are listed in the order of their groups.
        let thisPatientGroupName:string = patient.group ? patient.group.toLowerCase() : 'NotInPatientTable';
        if (currentGrouping == null || currentGrouping.groupingName !== thisPatientGroupName) { // not found, so create the grouping
          let newGrouping:axisDataForGrouping = new axisDataForGrouping();
          newGrouping.patients = [];
          newGrouping.groupingName = thisPatientGroupName;
          newGrouping.minY = i * rowHeight
          this.axisDataForGroups.push(newGrouping);
          currentGrouping = newGrouping;
        }
        currentGrouping.maxY = (i+1) * rowHeight;
        currentGrouping.numPatients++;
        currentGrouping.patients.push(patient);
      }

      pidMap[patient[0].p] = i;
      const group = new THREE.Group();
      this.patients.push(group);
      this.objs.push(group);
      group.userData.pid = patient[0].p;
      this.view.scene.add(group);
      const yPos = i * rowHeight;
      group.position.setY(yPos);

      let radius = 1.6;
      const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), ChartFactory.getColorPhong(0x000000));

      mesh.position.set(-500, yPos - chartHeightHalf, 1);
      mesh.userData = {
        id: patient[0].p,
        pid: patient[0].p,
        radius: radius
      };
      this.meshes.push(mesh);
      // group.add(mesh);

      this.yAxis.push({
        position: new THREE.Vector3(0, yPos - chartHeightHalf, 0),
        userData: { tooltip: patient[0].p }
      });
      barLayout.forEach(bl => {
        const barEvents = patient.filter(p => p.type.toLowerCase() === bl.label.toLowerCase());
        let eventIndex = 0;
        let lastTicEvent = null;
        let numTicsAtThisTime = 0;
        let numSymbolsInOverlap:number  = 0;
        let xOfLastSymbol:number = 0;

        let sortedBarEvents = barEvents;
        sortedBarEvents.sort((a, b) => {
          let aStart = a.Start == null ? 0 : a.Start;
          let bStart = b.Start == null ? 0 : b.Start;

          return (aStart - bStart);
        });
        sortedBarEvents.forEach((event) => {
          if (event.data.subtype == null) {
            // TODO: should probably note and collect up types that produce no subtypes.
            // Sometimes these are expected, because user has defined a simple event type,
            // with no details. We;ve seen that with ISP.
          }
          event.patient = patient; // Allows us to produce patient vital stats etc in the the tooltip.
          event.data.type = 'event';
          event.data.id = patient[0].p;
          event.barLayoutRowNumber = barLayoutRowNumber;
          switch (bl.style) {
            case TimelinesStyle.NONE:
              break;
            case TimelinesStyle.ARCS: ///turned track into z MJ
              this.addArc(bl, event, eventIndex, bl.track, barHeight, rowHeight, group, scale, chartHeightHalf, bl.z);
              break;
            case TimelinesStyle.TICKS:
              if (lastTicEvent) {
                if (lastTicEvent.start == event.start ) { //&& lastTicEvent.end == event.end) {
                  // In case of perfect overlap of previous tic event, such as in EK's data, 
                  // we will drop the line down to just below the previous one.
                  // This allows us to show , e.g., two treatments at once.
                  // Here we assume the data is imported from TSV file where they are already sorted by start date.
                  numTicsAtThisTime++;
                } else {
                  numTicsAtThisTime = 0;
                }
              }
              this.addTic(bl, event, eventIndex, bl.track, barHeight, rowHeight, group, scale, chartHeightHalf, bl.z, numTicsAtThisTime);
              lastTicEvent = event;
              break;
            case TimelinesStyle.SYMBOLS:
              let addSymbolResult = this.addSymbol(bl, event, eventIndex, bl.track, barHeight, rowHeight, group, scale, chartHeightHalf, bl.z, numSymbolsInOverlap, xOfLastSymbol);
              xOfLastSymbol = addSymbolResult.newXOfLastSymbol;
              numSymbolsInOverlap = addSymbolResult.newNumSymbolsInOverlap;
              break;
            default:
              console.log(`TEMPNOTE: No matching TimelinsStyle in switch for bl.`);
          }
          eventIndex++;
        });
      });
    });

    // Attributes
    let heatmapDetails:any = this.addAttrs(rowHeight, rowCount, pidMap);
    this.tooltipController.targets = this.objs;
    const height = rowHeight * rowCount;

    // Axis Markers, for Group By
    if (this.axisDataForGroups.length > 0) {
      const threeGroup = new THREE.Group();
      this.objs.push(threeGroup);
      this.view.scene.add(threeGroup);
      let numHeatmapColumns:number = this.data.result.attrs.attrs.length;
      let xOffsetFromHeatmap = heatmapDetails.leftmostXEdge ; //numHeatmapColumns * (rowHeight + 1);
      this.addAxisMarkersForGroups(threeGroup, chartHeightHalf, xOffsetFromHeatmap);
    }

    // const geo = new THREE.CubeGeometry(1000, height, 10, 1, 1, 1);
    // const mesh = new THREE.Mesh(geo, ChartFactory.getColorBasic(0x333333));
    // mesh.position.set(0, 0, 0);
    // const box: THREE.BoxHelper = new THREE.BoxHelper(mesh, new THREE.Color(0xFF0000));
    // this.view.scene.add(box);

    ChartFactory.configPerspectiveOrbit(
      this.view,
      new THREE.Box3(new Vector3(-550, -height, -5), new THREE.Vector3(550, height, 5))
    );

    requestAnimationFrame(v => {
      this.onShowLabels();
    });
  } // end of addObjects

  complexTooltipFromEvent(event: any): ComplexTooltipData {
    const data = event.data;
    let keysForReduce: Array<string> = Object.keys(data);
    keysForReduce.unshift('');
    let shmooltip =
      '<div>' +
      keysForReduce.reduce((p, c, idx, srcArray) => {
        if (p == 'event_type') {
          return '';
        }
        if (c !== 'type') {
          if (data[c].toString().trim().length > 0) {
            if (c === 'id') {
              let evtIndex = ', event#' + event.originalIndex;
              p += `<nobr>${c}: ${data[c].toString().toLowerCase()}${evtIndex}</nobr><br />`;
            } else {
              p += `<nobr>${c}: ${data[c].toString().toLowerCase()}</nobr><br />`;
            }
          }
        }
        return p;
      });
    ;
    if (event.originalEnd == null || event.originalStart == event.originalEnd) {
      shmooltip += `<hr><nobr>start/end: ${event.originalStart}</nobr><br />` ;
    } else {
      shmooltip += `<hr><nobr>start: ${event.originalStart} end: ${event.originalEnd}</nobr><br />` ;
    }
    shmooltip += `patient row: ${event.barLayoutRowNumber}<br />` ;

    // Put patient vitals here.... tooltip += `<hr><nobr>start: ${event.originalStart} end: ${event.originalEnd}</nobr><br />` ;
    shmooltip += '</div>';

    let complexTooltip = new ComplexTooltipData(
      EntityTypeEnum.EVENT,
      event.originalIndex,
      EntityTypeEnum.PATIENT,
      event.p,
      event,
      shmooltip
    );
    return (complexTooltip);
  }

  formatAttrTooltip(attr: any, pidIndex:number, pid:number): string {
    return `Patient:&nbsp;${pid}<br />` +
      attr.prop + ':&nbsp;' + attr.values[pidIndex].label;
  }

  hiddenOffsetY = 3;


  onShowLabels(): void {
    const zoom = this.view.camera.position.z;
    this.labelYAxis.offsetY  = this.hiddenOffsetY;
    // label when rows are too small
    if (this.view.camera.position.z > 1400) {
      this.labels.innerHTML =
      '<div style="position:fixed;bottom:10px;left:50%; font-size: 15px;">Time</div>' +
      `<div style="position:fixed;right:10px;top:50%; transform: rotate(90deg); font-size: 15px;">Patients (${this.patients.length})</div>`;
    } else if (this.view.camera.position.z > 1100) {
      this.labelXAxis.fontsize = 8;
      this.labelYAxis.fontsize = 8;
      this.labels.innerHTML =
        LabelController.generateHtml(this.xAxis, this.labelXAxis) +
        LabelController.generateHtml(this.yAxis, this.labelYAxis);
    } else if (this.view.camera.position.z > 650) {
      this.labelXAxis.fontsize = 10;
      this.labelYAxis.fontsize = 10;
      this.labels.innerHTML =
        LabelController.generateHtml(this.xAxis, this.labelXAxis) +
        LabelController.generateHtml(this.yAxis, this.labelYAxis);
    } else if (this.view.camera.position.z > 50) {
      this.labelXAxis.fontsize = 14;
      this.labelYAxis.fontsize = 14;
      this.labels.innerHTML =
        LabelController.generateHtml(this.xAxis, this.labelXAxis) +
        LabelController.generateHtml(this.yAxis, this.labelYAxis);
    }

  }
}
