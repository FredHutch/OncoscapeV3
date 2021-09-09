import {
  DimensionEnum,
  EntityTypeEnum,
  VisualizationEnum
} from 'app/model/enum.model';
import { GraphConfig } from '../../../model/graph-config.model';
import { GraphData } from '../../../model/graph-data.model';

export class TableLoaderConfigModel extends GraphConfig {
  tableName:string;
  mapData:any;

  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.TABLE_LOADER;
    this.label = 'TABLE-LOADER';
    this.enableBehaviors = true;
  }

}

export interface TableLoaderDataModel extends GraphData {
  result: any;

}










