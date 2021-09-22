import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator } from '../../../model/data-map.model';
import { Legend } from '../../../model/legend.model';
import { ChartFactory } from '../chart/chart.factory';
import { count } from 'rxjs/operators';
import * as THREE from 'three';
import { CommonSidePanelComponent } from '../common-side-panel/common-side-panel.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { OncoData } from 'app/oncoData';
import { ChartScene } from '../chart/chart.scene';
import { VisualizationView } from '../../../model/chart-view.model';

@Component({
  selector: 'app-workspace-legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LegendItemComponent implements AfterViewInit, OnDestroy {
  public autoUpdate = true; 

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.visibleEyeLevel = this.legend.visibility[this.i];
  }
  
  ngOnDestroy() {}
  
  public visibleEyeLevel: number; // 1=visible, 0=invisible.

  @Input() legend: Legend;
  @Input() i: number;

  checkVisibleEyeFlag():boolean{
    let returnVal = this.visibleEyeLevel == 1;
    return returnVal;
  }

  legendItemEyeClick(event, legend: Legend, i:number){
    console.log('visClick');
    let clickedLabel = Legend.clickedPidsFromLegendItem(legend, i);
    if(clickedLabel){
      console.log('Yes, visclick success . ' + i);
      console.dir(event);

      if(this.visibleEyeLevel == 1) {
        this.visibleEyeLevel = 0;
        this.legend.visibility[this.i] = 0;
      } else {
        this.visibleEyeLevel = 1;
        this.legend.visibility[this.i] = 1;
      }

      console.warn('== Assuming view 0 in legendItemEyeClick ==');
      let view:VisualizationView = ChartScene.instance.views[0];
      view.chart.updateDecorator(view.config, view.chart.decorators);
      console.warn('==would like to render==');
      ChartScene.instance.render();
      OncoData.instance.currentCommonSidePanel.drawWidgets();
    }
  }



  public update(): void {
    if (!this.autoUpdate) {
      return;
    }
    // console.log('MJ update in legendpanel');
    let self = this;
    // const decorators = this._decorators.map(decorator =>
    //   self.legendFormatter(decorator.legend)
    // );

    try {
    // const legends = this._legends.map(legend => this.legendFormatter(legend));
    // this.allLegends = [].concat(...decorators, ...legends);

    this.cd.detectChanges();
    } catch (err) {
      console.error(`TEMPNOTE: error in legend update, probably bad _legends. ${err}`);
    }
  }

  constructor(public cd: ChangeDetectorRef) {
    // LegendItemComponent.setLegends.subscribe(this.onSetLegends.bind(this));
    console.warn('--setting to FALSE in constructor--------');
    
  }
}
