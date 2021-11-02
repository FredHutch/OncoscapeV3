import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator, LegendFilter } from './../../../model/data-map.model';
import { Legend } from './../../../model/legend.model';
import { ChartFactory } from '../chart/chart.factory';
import { count } from 'rxjs/operators';
import * as THREE from 'three';
import { CommonSidePanelComponent } from '../common-side-panel/common-side-panel.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { OncoData } from 'app/oncoData';
import { debug } from 'console';
import { AnalyticsProvider } from 'aws-amplify';
import { ChartScene } from '../chart/chart.scene';
import { VisualizationView } from '../../../model/chart-view.model';
import { AbstractScatterVisualization } from '../../visualization/visualization.abstract.scatter.component';
import { LegendItemComponent } from '../legend-item/legend-item.component';

@Component({
  selector: 'app-workspace-legend-panel',
  templateUrl: './legend-panel.component.html',
  styleUrls: ['./legend-panel.component.v002.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LegendPanelComponent implements AfterViewInit, OnDestroy {

  @ViewChildren(LegendItemComponent) legendItems: QueryList<LegendItemComponent>

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

  public _legendFilters: Array<LegendFilter> = [];
  @Input()
  public set legendFilters(value: Array<LegendFilter>) {
    if (value === null) {
      console.log(`TEMPNOTE: Input legendFilters for legend-panel was null.`);
      return;
    }
    console.log('setting legendFilters in legendPanel');
    this._legendFilters = value;
    this.updateLegendFilters();
  }

  updateLegendFilters(){
    console.warn('## updateLegendFilters NYI ##');
  }

  public select(): void {}

  public deselect(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy() {}


  customizeColor(legend: Legend, i:number): void {
    console.log(`MJ click on legend item [${i}] color box`);
    let color = prompt('Type a color name like red or green, or a web color code like #440080.', '#440080')
    if(color) {
      ChartFactory.writeCustomValueToLocalStorage(this._config.database, 'legendColors', legend.name + '!' + ChartFactory.cleanForLocalStorage(legend.labels[i]), color);
      window.setTimeout(this.update, 100);
    }
  }


  private setLegendItemVisibility(li:LegendItemComponent, i:number, beVisible:boolean){
      li.visibleEyeLevel = beVisible ? 1 : 0
      li.legend.visibility[i] = beVisible ? 1 : 0;
  }

  eyeClickItem(activity: any) { // i, legend, event
    console.warn('In eyeClickItem, in legend panel.');
    console.dir(activity)

    if(this.config.isScatterVisualization == false) {
      console.warn('In eyeClickItem, clicking non-scatter vis. Not yet supported..');
      return;
    }

    //let clickedLabel = Legend.clickedPidsFromLegendItem(legend, i);

    // Get current vis of clicked item.
    let currentEyeVis = true;
    this.legendItems.forEach( (li, i) => {
      if(i == activity.i){
        currentEyeVis = li.visibleEyeLevel == 1
      }
    });

    this.legendItems.forEach( (li, i) => {
      if(i == activity.i){
        this.setLegendItemVisibility(li, i, currentEyeVis == false)
      } else {
        if((activity.event as MouseEvent).altKey){
          this.setLegendItemVisibility(li, i, currentEyeVis) // e.g., if item was true, all others now become true.
        }
      }
    });

    console.warn('== Assuming view 0 in legendItemEyeClick ==');
    let view:VisualizationView = ChartScene.instance.views[0];
    let thisScatterGraph  = view.chart as AbstractScatterVisualization;
    if(thisScatterGraph && thisScatterGraph.isBasedOnAbstractScatter){
      thisScatterGraph.removeInvisiblesFromSelection(view.config, view.chart.decorators);
    } else {
      console.warn('This vis does not support removeInvisiblesFromSelection.');
    }
    ChartScene.instance.render();
    OncoData.instance.currentCommonSidePanel.drawWidgets();
  }


  legendItemClick(legend: Legend, i:number): void {
    console.log(`MJ click on legend item [${i}] text itself`);
    
    // build list of matching patient IDs, then pass it off to 
    // commonSidePanel.setSelectionPatientIds.
    // List length should match legend.counts[i].
    let clickedLabel = Legend.clickedPidsFromLegendItem(legend, i);

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
