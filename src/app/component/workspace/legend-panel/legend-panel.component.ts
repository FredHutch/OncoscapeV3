import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator } from './../../../model/data-map.model';
import { Legend } from './../../../model/legend.model';
import { ChartFactory } from '../chart/chart.factory';
import { count } from 'rxjs/operators';
import * as THREE from 'three';
import { CommonSidePanelComponent } from '../common-side-panel/common-side-panel.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { OncoData } from 'app/oncoData';

@Component({
  selector: 'app-workspace-legend-panel',
  templateUrl: './legend-panel.component.html',
  styleUrls: ['./legend-panel.component.v002.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LegendPanelComponent implements AfterViewInit, OnDestroy {
  // TEMP DEL ME

  public static setLegends = new EventEmitter<{
    legend: Array<Legend>;
    graph: number;
  }>();
  public autoUpdate = true;

  public allLegends: Array<Legend> = [];
  public updateLegend = _.debounce(this.update, 600);



  public _config: GraphConfig;
  get config(): GraphConfig {
    return this._config;
  }
  @Input()
  set config(value: GraphConfig) {
    if (value === null) {
      return;
    }
    this._config = value;
    this.updateLegend();
  }

  private _decorators: Array<DataDecorator> = [];
  @Input()
  public set decorators(value: Array<DataDecorator>) {
    if (value === null) {
      return;
    }
    this._decorators = value;
    this.updateLegend();
  }

  public _legends: Array<Legend> = [];
  @Input()
  public set legends(value: Array<Legend>) {
    if (value === null) {
      console.log(`TEMPNOTE: Input for legend-panel was null.`);
      return;
    }
    this._legends = value;
    this.updateLegend();
  }

  //   // formatValues(legend: Legend): void {
  //   if(legend.type === 'COLOR') {
  //   for (let i = 0; i < legend.values.length; i++) {
  //     if (!isNaN(legend.values[i])) {
  //       legend.values[i] = '#' + (0xffffff + legend.values[i] + 1).toString(16).substr(1);
  //     }
  //   }
  // } else if (legend.type === 'SHAPE') {
  //   for (let i = 0; i < legend.values.length; i++) {
  //     legend.values[i] = './assets/shapes/shape-' + legend.values[i] + '-solid-legend.png';
  //   }
  // }
  // }
  public select(): void {}

  public deselect(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy() {}


  visibilityClick(i:number){
    window.alert(i);
  }

  customizeColor(legend: Legend, i:number): void {
    console.log(`MJ click on legend item [${i}] color box`);
    let color = prompt('Type a color name like red or green, or a web color code like #440080.', '#440080')
    ChartFactory.writeCustomValueToLocalStorage(this._config.database, 'legendColors', legend.name + '!' + ChartFactory.cleanForLocalStorage(legend.labels[i]), color);
    window.setTimeout(this.update, 100);
  }

  legendItemClick(legend: Legend, i:number): void {
    console.log(`MJ click on legend item [${i}] text itself`);
    
    // build list of matching patient IDs, then pass it off to 
    // commonSidePanel.setSelectionPatientIds.
    // List length should match legend.counts[i].

    if (legend.decorator  // && legend.display != 'not------DISCRETE' 
    && legend.decorator.pidsByLabel != null) {
      let countExpected = legend.counts[i] ? legend.counts[i] : 0;
      let labelExpected = legend.labels[i];
      let clickedColorValue:string = legend.values[i];
      let clickedLabel = legend.decorator.pidsByLabel.find(v => v.label == clickedColorValue);
      if(!clickedLabel){
        let a:THREE.Color = new THREE.Color(clickedColorValue);
        let colorInt = a.getHex();
        // let r = Math.round(a.r * 255);
        // let g = Math.round(a.g * 255);
        // let b = Math.round(a.b * 255);
        // let colorInt = (r << 16) + (g << 8) + (b);
////////////////        clickedLabelVals = legend.decorator.pidsByLabel[colorInt];
        clickedLabel = legend.decorator.pidsByLabel.find(v => v.label == colorInt.toString());
      }
      if(clickedLabel) {
        let mouseEvent:any = event;
        let selectionModifiers:SelectionModifiers = new SelectionModifiers();
        selectionModifiers.extend = mouseEvent.shiftKey;
        selectionModifiers.inverse = mouseEvent.altKey;

        let patientIds = clickedLabel.pids;
        window.setTimeout(() => {
          OncoData.instance.currentCommonSidePanel.setSelectionPatientIds(patientIds, 
            "Legend", selectionModifiers);
        }, 20);            
        OncoData.instance.currentCommonSidePanel.drawWidgets();
      } else {
        console.log('Click on label did not resolve by color.');
      }
      
    }

    // // from commonsidepanel...
    // if(index <= this.definedCohorts.length) {
    //   // this.svg._groups[0][0].getElementsByClassName('km-curve')[0]
    //   let mouseEvent:any = event;
    //   let c = this.definedCohorts[index];
    //   let selectionModifiers:SelectionModifiers = new SelectionModifiers();
    //   selectionModifiers.extend = mouseEvent.shiftKey;
    //   selectionModifiers.inverse = mouseEvent.altKey;

    //   window.setTimeout(() => {
    //     this.setSelectionPatientIds(c.pids, c, selectionModifiers);
    //   }, 20);
    // } else {
    //   alert(`Could not find defined cohort with index of ${index}.`);
    // }

    window.setTimeout(this.update, 100);
  }


  legendFormatter(legend: Legend): Legend {
    const rv = Object.assign({}, legend);
    if (rv.type === 'COLOR') {
      for (let i = 0; i < rv.values.length; i++) {
        if (!isNaN(rv.values[i])) {
          legend.values[i] =
            '#' + (0xffffff + legend.values[i] + 1).toString(16).substr(1);
        }
      }
    } else if (legend.type === 'SHAPE') {
      for (let i = 0; i < rv.values.length; i++) {
        if (!isNaN(rv.values[i])) {
          legend.values[i] =
            'https://oncoscape.v3.sttrcancer.org/assets/shapes/shape-' +
            legend.values[i] +
            '-solid-legend.png';
        }
      }
    }
    return rv;
  }

  public update(): void {
    if (!this.autoUpdate) {
      return;
    }
    // console.log('MJ update in legendpanel');
    let self = this;
    const decorators = this._decorators.map(decorator =>
      self.legendFormatter(decorator.legend)
    );

    try {
    const legends = this._legends.map(legend => this.legendFormatter(legend));
    this.allLegends = [].concat(...decorators, ...legends);

    // // // // Here is where we want to substitute custom colors in.
    // // // this.allLegends.map ( legend => { 
    // // //   if (legend.type =='COLOR' && legend.labels) {
    // // //     for (let label in legend.labels) {
    // // //       let cleanLabel:string = this.cleanForLocalStorage(legend.labels[label]);
    // // //       let customColor = this.readCustomValueFromLocalStorage('legendColors', legend.name + '!' + cleanLabel);
    // // //       if(customColor) {
    // // //         console.log(`customcolor = ${customColor}.`);
    // // //         legend.values[label] = customColor;
    // // //       }
    // // //     }
    // // //   }
    // // // });

    this.cd.detectChanges();
    } catch (err) {
      console.error(`TEMPNOTE: error in legend update, probably bad _legends. ${err}`);
    }
  }

  onSetLegends(e: { legend: Array<Legend>; graph: number }): void {
    if (this.config.graph !== e.graph) {
      return;
    }
    this.autoUpdate = false;
    this.allLegends = e.legend;
    this.cd.detectChanges();
  }
  constructor(public cd: ChangeDetectorRef) {
    LegendPanelComponent.setLegends.subscribe(this.onSetLegends.bind(this));
  }
}
