import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator } from '../../../model/data-map.model';
import { Legend } from '../../../model/legend.model';

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
  if(this.legend && this.legend.visibility){
    try {
      this.visibleEyeLevel = this.legend.visibility[this.i];
     } catch (err) {
        console.warn('CAUGHT: ' + err) 
      }
    }
  }
  
  ngOnDestroy() {}
  
  public visibleEyeLevel: number = 1; // 1=visible, 0=invisible.

  @Input() legend: Legend;
  @Input() i: number;

  checkVisibleEyeFlag():boolean{
    let returnVal = this.visibleEyeLevel == 1;
    return returnVal;
  }

  @Output() eyeClickItemEvent = new EventEmitter<any>();

  legendItemEyeClick(event, legend: Legend, i:number){
      this.eyeClickItemEvent.emit({legend: legend, i: i, event: event});
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
  }
}
