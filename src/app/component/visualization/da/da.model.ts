import { DimensionEnum } from './../../../model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class DaConfigModel extends VisualizationAbstractScatterConfigModel {
  dimension: DimensionEnum = DimensionEnum.THREE_D;
  domain: Array<number> = [-500, 500];
}

export interface DaDataModel extends GraphData {
  result: any;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;
}
