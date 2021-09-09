import {
  DimensionEnum,
  EntityTypeEnum,
  VisualizationEnum
} from 'app/model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";
import { SavedPointsCompleteAction } from 'app/action/compute.action';

export class SavedPointsConfigModel extends VisualizationAbstractScatterConfigModel {
  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.SAVED_POINTS;
    this.label = 'Saved Points';
    this.enableBehaviors = true;


  }
  savedPointsName = '';
  n_components = 3;

}

export interface SavedPointsDataModel extends GraphData {
  result: any;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;

}

export class SavedPoints {
  result: Array<Array<number>>;
  sid: Array<string>;
  pid: Array<string>;
}

export class SavedPointsWrapper {
  savedPoints: SavedPoints;
  created: number; // Date.now
  name: string
}