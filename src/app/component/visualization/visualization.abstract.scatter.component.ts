import * as THREE from 'three';
import { EventEmitter } from '@angular/core';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { DataField } from './../../model/data-field.model';
import { ScatterSelectionLassoController } from './../../controller/scatter/scatter.selection.lasso.controller';
import { AbstractScatterSelectionController } from './../../controller/scatter/abstract.scatter.selection.controller';
import { ChartScene } from './../workspace/chart/chart.scene';
import { ChartFactory } from 'app/component/workspace/chart/chart.factory';
import { GraphData } from 'app/model/graph-data.model';
import { Subscription } from 'rxjs';
import { Vector3, Color } from 'three';
import { LabelController, LabelOptions } from '../../controller/label/label.controller';
import { ChartObjectInterface } from '../../model/chart.object.interface';
import { DataDecorator, DataDecoratorTypeEnum, DataDecoratorValue } from '../../model/data-map.model';
import { EntityTypeEnum, DirtyEnum } from '../../model/enum.model';
import { ChartEvents } from '../workspace/chart/chart.events';
import { ChartSelection } from './../../model/chart-selection.model';
import { VisualizationView } from './../../model/chart-view.model';
import { GraphConfig } from './../../model/graph-config.model';
import { AbstractVisualization } from './visualization.abstract.component';
import { start } from 'repl';
import { CommonSidePanelComponent } from '../workspace/common-side-panel/common-side-panel.component';
import { OncoData } from 'app/oncoData';
import { EdgesGraph } from './edges/edges.graph';


const fragShader = require('raw-loader!glslify-loader!app/glsl/scatter.frag');
const vertShader = require('raw-loader!glslify-loader!app/glsl/scatter.vert');
const vertShaderNoAttenuation = require('raw-loader!glslify-loader!app/glsl/scatterNoAttenuation.vert');
declare var $;
//declare var THREE;
/*
circle
blast
*/

export class SelectionModifiers {
  extend:boolean = false;
  inverse:boolean = false;
  constructor() {}
}

export class AbstractScatterVisualization extends AbstractVisualization {
  public static textureImages = [
    './assets/shapes/shape-circle-solid-border.png', // added border
    './assets/shapes/shape-blast-solid.png',
    './assets/shapes/shape-diamond-solid.png',
    './assets/shapes/shape-polygon-solid.png',
    './assets/shapes/shape-square-solid.png',
    './assets/shapes/shape-star-solid.png',
    './assets/shapes/shape-triangle-solid.png',
    './assets/shapes/shape-na-solid.png'
  ];

  public processThreeDOption(option: string, value:any) {
    if(option == 'markerBaseSize'  ) {
        this.updateMarkerBaseSize(value);
    } else {
      // no other options implemented yet
    } 

  }

  public getDataItemCount () {
    if (this.entity == EntityTypeEnum.SAMPLE) {
      return this.data.sid.length;
    } else {
      if (this.entity == EntityTypeEnum.PATIENT) {
        return this.data.pid.length;
      } else {
        if (this.entity == EntityTypeEnum.GENE) {
          return this.data.mid.length;
        } else {
          alert('failed ');
          return 0;
        }
      }
    }
  }

  public set data(data: GraphData) {
    this._data = data;
  }
  public get data(): GraphData {
    return this._data;
  }
  public set config(config: GraphConfig) {
    this._config = config;
  }
  public get config(): GraphConfig {
    return this._config;
  }

  // Objects
  public selectionController: AbstractScatterSelectionController;
  private selectSubscription: Subscription;
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
  private lbls: Array<string>;
  private lines: Array<THREE.Line>;


  private defaultPointColorR:number = 0.12;
  private defaultPointColorG:number = 0.53;
  private defaultPointColorB:number = 0.9;
  
  public getTargets(): {
    point: Vector3;
    id: string;
    idType: EntityTypeEnum;
  }[] {
    const p = this.points;
    const positions = this.points.geometry['attributes'].position.array;
    const pts = new Array<{
      point: Vector3;
      id: string;
      idType: EntityTypeEnum;
    }>(positions.length / 3);
    for (let i = 0; i < positions.length; i += 3) {
      pts[i / 3] = {
        point: new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
        id: this.ids[i / 3],
        idType: this.config.entity
      };
    }
    return pts;
  }

  private _lastSelectionPatientIds:Array<string> = [];

  public removeIntersectFromSelection(d) {
    let self = this;
    console.log('in removeIntersectFromSelection');
    //let id = d.index / 3;
    let sampleId = this.ids[d.index];
    console.log('removeIntersectFromSelection id = ' + sampleId);
    let pid = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.sampleMap[sampleId];
    let newSelectionPids  = this._lastSelectionPatientIds.filter(v =>  v != pid)
    this._lastSelectionPatientIds = newSelectionPids;
    let source = 'Selection';
    this.selectionController.highlightIndexes.delete(d.index * 3);
    this.recalculateLegendTotals(); // Needed here?

    const gSel = this.pointsGeometry.attributes.gSelected;
    gSel.setX(d.index, 0);
    self.pointsGeometry.attributes.gSelected.needsUpdate = true;
    ChartScene.instance.render();

    window.setTimeout(() => self.signalCommonSidePanel(this._lastSelectionPatientIds, source, EntityTypeEnum.SAMPLE), 50);
  }

  public notifyEdgeGraphOfSelectionChange(weKnowNothingIsInSelection:boolean) {
      let edgesGraph = (ChartScene.instance.views[2].chart as EdgesGraph);
      if(edgesGraph){
        edgesGraph.softRequestLinkRegen();
      }
  }

  public regenLinks(){

  }

  create(entity:EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
    super.create(entity, labels, events, view);
    let self = this;
    this.selectionController = new ScatterSelectionLassoController(this.entity, view, events);
    this.selectionController.enable = true;
    this.selectSubscription = this.selectionController.onSelect.subscribe((data) => {
      let ids: Array<number> = data.ids; // ids are 3 times bigger than real index. We'll divide by 3.
      let source: any = data.source; // we EXPECT this isalways "Selection", not "Cohort".
      const values: Array<DataDecoratorValue> = ids
        .map(v => v / 3)
        .map(v => {
          return {
            pid: this._data.pid[v],
            sid: this._data.sid[v],
            mid: null,
            key: EntityTypeEnum.SAMPLE,
            value: true,
            label: ''
          };
        });
      const dataDecorator: DataDecorator = {
        type: DataDecoratorTypeEnum.SELECT,
        values: values,
        field: null,
        legend: null,
        pidsByLabel: null
      };
      WorkspaceComponent.addDecorator(this._config, dataDecorator);
      this._lastSelectionPatientIds = ids.map(v => self._data.pid[v/3]);

      this.recalculateLegendTotals();

      window.setTimeout(() => self.signalCommonSidePanel(this._lastSelectionPatientIds, source, EntityTypeEnum.SAMPLE), 50);

    });


    return this;
  }



  recalculateLegendTotals() {
    // Update decorators[x].legend.counts, based on _lastSelectionPatientIds.
    let self = this;
    this.decorators.forEach(dec => {
      if (dec.type == DataDecoratorTypeEnum.COLOR) { //} || dec.type == DataDecoratorTypeEnum.SHAPE ) {

        let decorator = dec;

        // Total up the counts for each label.
        let valueCounts = {};
        decorator.values.forEach(v => {
          // Count this value if a) nothing is selected, or b) this item is selected.
          if(self._lastSelectionPatientIds.length == 0 || self._lastSelectionPatientIds.includes(v.pid))
          {
            let hexColor:string = v.value.toString();
            if (hexColor.startsWith('#') == false){
              hexColor = "#"+("00000"+parseInt(v.value).toString(16)).slice(-6).toLowerCase();
            }

            if(valueCounts[hexColor] == null) {
              valueCounts[hexColor] = 0;
            }
            valueCounts[hexColor]++;
          }
        });
        let valueCountsArray: Array<number> = [];
        decorator.legend.values.forEach( value => {
          let counts = valueCounts[value.toLowerCase()];
          if(counts ==false) { counts = 0;}
          valueCountsArray.push(counts);
        });
        decorator.legend.counts = valueCountsArray;
        
      }
    });
  }
  public signalCommonSidePanel(patientIdsForCommonSurvival, selectionSource, entityType:EntityTypeEnum) {
    if (selectionSource == "Legend") {
      return;
    }
    
    if (OncoData.instance.currentCommonSidePanel){
      if(entityType == EntityTypeEnum.GENE){
        console.warn('TBD: Support signalCommonSidepanel for GENE entity.');
      } else {
        OncoData.instance.currentCommonSidePanel.setSelectionPatientIds(patientIdsForCommonSurvival, 
          selectionSource == "Cohort" ? "Cohort" : 
          (selectionSource == "Legend" ? "Legend" : null), null);
        OncoData.instance.currentCommonSidePanel.drawWidgets();
      }
    }
  }

  destroy() {
    super.destroy();
    this.selectionController.destroy();
    if (this.selectSubscription) {
      if (!this.selectSubscription.closed) {
        this.selectSubscription.unsubscribe();
      }
    }
    this.removeObjects();
  }

  updateDecoratorBasedOnStoredColors(decorator: DataDecorator) {
    // Here is where we want to substitute custom colors in.
    let legend = decorator.legend;

    let self = this;
    //if (legend.type =='COLOR' && legend.labels) {
    for (let label in legend.labels) {
      let cleanLabel:string = ChartFactory.cleanForLocalStorage(legend.labels[label]);
      let customColor = ChartFactory.readCustomValueFromLocalStorage(self._config.database, 'legendColors', legend.name + '!' + cleanLabel);
      if(customColor) {
        console.log(`customcolor = ${customColor}.`);
        let threeColor:THREE.Color = new Color(customColor);
        let threeColorAsPoundHex = '#' + threeColor.getHexString().toLowerCase();
        let oldColor = legend.values[label];
        let newColor = threeColorAsPoundHex; // customColor;
        legend.values[label] = newColor;
        // Now need to update all .values entries that had that old color.
        decorator.values.map(v => {
          if(v.value == oldColor) {
            v.value = newColor;
          }
          return v;
        });
        // Replace the old property key with the new
        if (oldColor != newColor) {
          let foundRow = decorator.pidsByLabel.find(v => v.label == oldColor);
          if (foundRow) {
            foundRow.label = newColor;
          }
          console.log(`TEMPNOTE: swapped ${oldColor} for ${newColor}.`);
        }
      }
    }
  // }
  }
  
  updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
    console.warn('==update decorator==');

    super.updateDecorator(config, decorators);
    let self = this;

    let visibilityLevels:Float32Array = new Float32Array(this.ids.length);
    this.ids.forEach((id, index) => {
      visibilityLevels[index] = 1.0;
    });
    this.pointsGeometry.setAttribute('gVisibility', new THREE.BufferAttribute(visibilityLevels, 1));

    // No SELECT decorators, so unhighlight all points.
    if (this.decorators.filter(d => d.type === DataDecoratorTypeEnum.SELECT).length === 0) {
      this.selectionController.reset();
      const gSel = this.pointsGeometry.attributes.gSelected;
      let l = gSel.array.length;
      for(let i=0; i < l; i++){
        gSel.setX(i, 0);
      }
      this.pointsGeometry.attributes.gSelected.needsUpdate = true;
      console.warn('== in updateDecorator with ZERO points==');
      this.notifyEdgeGraphOfSelectionChange(true);
      ChartScene.instance.render();
    }

    // No COLOR decorators, so restore original colors.
    if (this.decorators.filter(d => d.type === DataDecoratorTypeEnum.COLOR).length === 0) {
      let col = new THREE.Color(0);
      col.r = this.defaultPointColorR;
      col.g = this.defaultPointColorG;
      col.b = this.defaultPointColorB;
      this.ids.forEach((id, index) => {
        self.colors[index * 3] = col.r;
        self.colors[index * 3 + 1] = col.g;
        self.colors[index * 3 + 2] = col.b;
      });
      this.pointsGeometry.setAttribute('gColor', new THREE.BufferAttribute(this.colors, 3));
    }

    // No SHAPE decorators, so restore original circle shape (index 0).
    if (this.decorators.filter(d => d.type === DataDecoratorTypeEnum.SHAPE).length === 0) {
      this.ids.forEach((id, index) => {
        self.shapes[index] = 0; 
      });
      this.pointsGeometry.setAttribute('gShape', new THREE.BufferAttribute(this.shapes, 1));
    }

    // No SIZE decorators, so restore original circle size (-1 is a clue for the vert function))
    if (this.decorators.filter(d => d.type === DataDecoratorTypeEnum.SIZE).length === 0) {
      let markerScales:Float32Array = new Float32Array(this.ids.length);
      this.ids.forEach((id, index) => {
          markerScales[index] = -1.0;
      });
      this.pointsGeometry.setAttribute('gMarkerScale', new THREE.BufferAttribute(markerScales, 1));
    }

    const propertyId = this._config.entity === EntityTypeEnum.GENE ? 'mid' : 'sid';
    decorators.forEach(decorator => {
      // 1. For each decorator, hide if visibility in legend is 0.

      if(decorator.legend) {

        decorator.legend.visibility.map((v, legendItemIndex) => {
          if(v < 0.5){
            // visibilityLevels:Float32Array = new Float32Array(this.ids.lengt
            let pidsToHide = decorator.pidsByLabel[legendItemIndex].pids;
            pidsToHide.map((pid, pidIndex) => {
              let sid = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientMap[pid];
              if(sid) {
                let scatterIdIndex = this.ids.findIndex(v => v === sid);
                visibilityLevels[scatterIdIndex] = 0;
              }
              //.sampleMap[sampleId];

            })
          }
        });

        this.pointsGeometry.setAttribute('gVisibility', new THREE.BufferAttribute(visibilityLevels, 1));
        self.pointsGeometry.attributes.gVisibility.needsUpdate = true;

      }

      // 2. Decorator specific
      switch (decorator.type) {
        case DataDecoratorTypeEnum.SELECT:
          this.notifyEdgeGraphOfSelectionChange(decorator.values.length == 0);

          if (this._config.entity === EntityTypeEnum.SAMPLE) {
            const indices = decorator.values.map(datum => {
              return this.ids.findIndex(v => v === datum.sid);
            });
            //const arr = this.pointsGeometry.attributes.gSelected.array;
            const gSel = this.pointsGeometry.attributes.gSelected;
            // zero it out
            let l = gSel.array.length;
            for(let i=0; i < l; i++){
              gSel.setX(i, 0);
            }
            indices.forEach(v => {
              gSel.setX(v, 1);
            });
            self.pointsGeometry.attributes.gSelected.needsUpdate = true;
            ChartScene.instance.render();
          }
          break;
        case DataDecoratorTypeEnum.SHAPE:
          const textureLookup = AbstractScatterVisualization.textureImages.reduce((p, c, i) => {
            p['s' + c.replace('.png', '-legend.png')] = i;
            return p;
          }, {});
          const shapeMap = decorator.values.reduce((p, c) => {
            p[c[propertyId]] = textureLookup['s' + c.value];
            return p;
          }, {});
          self.ids.forEach((id, index) => {
            self.shapes[index] = shapeMap[id];
            if (self.shapes[index] === undefined) {
              self.shapes[index] = 7;
            }
          });
          self.pointsGeometry.setAttribute('gShape', new THREE.BufferAttribute(this.shapes, 1));
          ChartScene.instance.render();
          break;
          case DataDecoratorTypeEnum.COLOR:
            self.updateDecoratorBasedOnStoredColors(decorator);
            const colorsMap = decorator.values.reduce((p, c) => {
              const color = new THREE.Color();
              color.set(c.value);
              p[c[propertyId]] = color;
              return p;
            }, {});
            self.ids.forEach((id, index) => {
              let col = null;
              if(colorsMap.hasOwnProperty(id)) {
                col = colorsMap[id] 
              } else {
                col = new THREE.Color(0x000000);
              }
              self.colors[index * 3] = col.r;
              self.colors[index * 3 + 1] = col.g;
              self.colors[index * 3 + 2] = col.b;
            });
            self.pointsGeometry.setAttribute('gColor', new THREE.BufferAttribute(this.colors, 3));
            ChartScene.instance.render();
            break;
          case DataDecoratorTypeEnum.SIZE:
            let markerScales:Float32Array = new Float32Array(this.ids.length);
            const sizesMap = decorator.values.reduce((p, c) => {
              const aSize:number =  c.value;
              p[c[propertyId]] = aSize;
              return p;
            }, {});
            let outerIndex:number = -1; 
            self.ids.forEach((id, index) => {
              try {
                outerIndex = index;
                let size = 0;
                if(sizesMap.hasOwnProperty(id)) {
                  size = sizesMap[id] 
                }
                markerScales[index] = size;
                 /* let xval:any = decorator.values[index];
                markerScales[index] = xval.value ; */
              } catch (err) {
                console.error('Error setting size in geom. Index=' + outerIndex );
              }
            });
            self.pointsGeometry.setAttribute('gMarkerScale', new THREE.BufferAttribute(markerScales, 1));
            ChartScene.instance.render();
            break;
          }
    });
    ChartScene.instance.render();
    this.selectionController.points = this.points;
    this.selectionController.tooltips = this.ids.map(v => {
      return [{ key: 'id', value: v }];
    });
  }

  public adjustGraphDetailsBasedOnZoomChange(oldZoom:number, newZoom:number, addHistory: boolean) {
    let sc = this.selectionController ;
    if(addHistory){
      sc.addZoomHistory(oldZoom, newZoom);
    }
  }

  updateMarkerBaseSize(baseSize:number) {
    console.log('MJ ========================= updateMarkerBaseSize ' + baseSize);
    this.pointsMaterial.uniforms.uMarkerBaseSize.value = baseSize;
    setTimeout(ChartScene.instance.render, 10);
  }

  
  private onShow(e: any): void {}

  updateData(config: GraphConfig, data: any) {
    super.updateData(config, data);
    this.removeObjects();
    this.addObjects(this._config.entity);
  }

  enable(truthy: boolean) {
    super.enable(truthy);
    this.view.controls.enableRotate = true;
  }


  addObjects(type: EntityTypeEnum) {
    this.lines = [];
    const propertyId = this._config.entity === EntityTypeEnum.GENE ? 'mid' : 'sid';
    this.ids = this._data[propertyId];
    this.positionsFrame = 0;
    // these were "this._data.resultScaled.length - 1"
    let arrayPositionsCount:number =this._data.resultScaled.length; // was ... - 1
    this.positionsPrev = new Float32Array(arrayPositionsCount * 3);
    this.positions = new Float32Array(arrayPositionsCount * 3);
    this.colors = new Float32Array(arrayPositionsCount * 3);
    this.shapes = new Float32Array(arrayPositionsCount);
    this.selected = new Float32Array(arrayPositionsCount);
    this.sizes = new Float32Array(arrayPositionsCount);
    console.log(`AddObjects ${this._data.resultScaled.length} now in visualization.abstract.scatter.components.ts at ${Date.now()}.`);

    this._data.resultScaled.forEach((point, index) => {
      this.selected[index] = 0.0;
      this.shapes[index] = 0.0;
      this.sizes[index] = -1.0; // Anything < 0 means use default size. TBD TEMPNOTE: Pass in value from mat-slider.
      this.colors[index * 3] = this.defaultPointColorR;
      this.colors[index * 3 + 1] = this.defaultPointColorG;
      this.colors[index * 3 + 2] = this.defaultPointColorB;
      for (let i = 0; i < 3; i++) {
        this.positionsPrev[index * 3 + i] = point[i];
        this.positions[index * 3 + i] = point[i];
      }
    });

    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsGeometry.setAttribute('gPositionFrom', new THREE.BufferAttribute(this.positionsPrev, 3));
    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.pointsGeometry.setAttribute('gColor', new THREE.BufferAttribute(this.colors, 3));
    this.pointsGeometry.setAttribute('gShape', new THREE.BufferAttribute(this.shapes, 1));
    this.pointsGeometry.setAttribute('gMarkerScale', new THREE.BufferAttribute(this.sizes, 1));
    // this.pointsGeometry.setAttribute('gSize', new THREE.BufferAttribute(this.sizes, 1));
    // this.pointsGeometry.setAttribute('gAlpha', new THREE.BufferAttribute(this.alphas, 1));
    this.pointsGeometry.setAttribute('gSelected', new THREE.BufferAttribute(this.selected, 1));

    let uniforms = Object.assign(
      { uAnimationPos: { value: this.positionsFrame } ,
        uMarkerBaseSize: {value: 10.0}}
      // AbstractScatterVisualization.textures
    );

    this.pointsMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      vertexShader: vertShader, //vertShaderNoAttenuation, // vertShader,
      fragmentShader: fragShader,
      alphaTest: 0.5
    });

    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    this.points.userData['ids'] = this.ids;
    this.meshes.push(this.points);
    this.view.scene.add(this.points);
    this.selectionController.points = this.points;
    this.selectionController.tooltips = this.ids.map(v => {
      return [{ key: 'id', value: v }];
    });

    this.tooltipController.targets = this.meshes;


    // /* MJ Could add AxesHelper and some GridHelpers to give orientation context . -MJ */
    // var axesHelper = new THREE.AxesHelper(400);
    // this.view.scene.add( axesHelper );
    
    // var gridV = new THREE.GridHelper(150, 5, 0x0000ff, 0x808080);
    // gridV.position.y = 75;
    // gridV.position.x = 75;
    // gridV.rotation.x = -Math.PI / 2;
    // this.view.scene.add(gridV);

    // /*
    // gridV = new THREE.GridHelper(150, 5, 0x0000ff, 0x808080);
    // gridV.position.y = 75;
    // gridV.position.x = 75;
    // gridV.rotation.y = -Math.PI / 2;
    // this.view.scene.add(gridV);
    // gridV = new THREE.GridHelper(150, 5, 0x0000ff, 0x808080);
    // gridV.position.y = 75;
    // gridV.position.x = 75;
    // gridV.rotation.z = -Math.PI / 2;
    // this.view.scene.add(gridV);
    // */

    this.updateDecorator(this.config, this.decorators);
    console.log(`before a configPerspectiveOrbit ${this.view.camera.position.length()}`);
    // this.tooltipController.targets = this.points;
    ChartFactory.configPerspectiveOrbit( 
      this.view,
      new THREE.Box3(new Vector3(-250, -250, -250), new THREE.Vector3(250, 250, 250))
    );
    console.log(`after configPerspectiveOrbit ${this.view.camera.position.length()}`);
    this.lastZoomDistance = this.view.camera.position.length();
    this.originalZoomDistance = this.lastZoomDistance;

    setTimeout(ChartScene.instance.render, 300);
    // requestAnimationFrame(ChartScene.instance.render);
    // this.onRequestRender.emit(this.config.graph);
  }

  removeObjects() {
    this.view.scene.remove(...this.meshes);
    this.meshes.length = 0;
  }

  onShowLabels(): void {
    // const labelOptions = new LabelOptions(this.view, 'FORCE');
    // labelOptions.offsetX3d = 1;
    // labelOptions.maxLabels = 100;
    // this.labels.innerHTML = LabelController.generateHtml(
    //   this.meshes,
    //   labelOptions
    // );
  }
}
