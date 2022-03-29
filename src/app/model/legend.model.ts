/**
 * Represents a visual legend
 */
//import { ChartScene } from './../../app/component/workspace/chart/chart.scene';
import * as THREE from 'three';

import { DataDecorator } from "./data-map.model";
import { VisualizationEnum } from './enum.model';

export class Legend {
  result: any; // data results from compute call, but might be null.
  name: string;
  type: 'COLOR' | 'SHAPE' | 'SIZE' | 'INTERSECT' | 'IMAGE';
  display: 'CONTINUOUS' | 'DISCRETE';
  labels: Array<string>;
  values: Array<any>;
  counts: Array<number>;
  decorator: DataDecorator;
  visibility: Array<number>;

  get items(): Array<{ label: string, value: string }> {
    return this.labels.map((lbl, i) => ({
      label: lbl,
      value: this.values[i]
    }));
  }

  public get formattedCountStrings(): Array<string> {
    if(this.counts && this.counts.length > 0) {
    return this.counts.map(c => '&nbsp;&nbsp;&nbsp;(' + + ')');
    } else {
      return new Array(200).fill(' xyzMJ'); 
    }
  }

  public static create(result: any, name: string, labels: Array<string>,
      values: Array<string>, 
      type: 'COLOR' | 'SHAPE' | 'SIZE' | 'INTERSECT' | 'IMAGE', 
      display: 'CONTINUOUS' | 'DISCRETE' ): Legend {
    const l = new Legend();
    console.log("----create legend-----");
    l.result = null; // WWWWWWWWW MJ TODO result;
    l.display = display;
    l.name = name;
    l.type = type;
    l.labels = labels;
    l.values = values;
    l.counts = []; // fill in later
    l.visibility = new Array(labels.length).fill(1) // fully visible, to start.
    return l;
  }

  static clickedPidsFromLegendItem(legend: Legend, i:number, visEnum: VisualizationEnum): any {
    if (legend.decorator == null) {
      console.warn('Null decorator in clickedPidsFromLegendItem.');
      return;
    }

    if (legend.decorator && legend.decorator.pidsByLabel != null) {
      let clickedColorValue:string = legend.values[i];
      let clickedPids = legend.decorator.pidsByLabel.find(v => v.label == clickedColorValue);
      if(!clickedPids){
        let a:THREE.Color = new THREE.Color(clickedColorValue);
        let colorInt = a.getHex();
        clickedPids = legend.decorator.pidsByLabel.find(v => v.label == colorInt.toString());
      }
      if (clickedPids){
        console.log(`clickedPids.length = ${clickedPids.pids.length}.`)
        console.dir(clickedPids);
        return clickedPids;
      } else {
        return null;
      }
    }   else {
      return null;
    }
  }

}

