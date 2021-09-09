/**
 * Represents a visual legend
 */

import { DataDecorator } from "./data-map.model";

export class Legend {
  result: any; // data results from compute call, but might be null.
  name: string;
  type: 'COLOR' | 'SHAPE' | 'SIZE' | 'INTERSECT' | 'IMAGE';
  display: 'CONTINUOUS' | 'DISCRETE';
  labels: Array<string>;
  values: Array<any>;
  counts: Array<number>;
  decorator: DataDecorator;

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
    l.result = null; // WWWWWWWWW MJ TODO result;
    l.display = display;
    l.name = name;
    l.type = type;
    l.labels = labels;
    l.values = values;
    l.counts = []; // fill in later
    return l;
  }
}

