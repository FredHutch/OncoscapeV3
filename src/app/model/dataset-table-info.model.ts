import { GraphConfig } from 'app/model/graph-config.model';
import { DataDecorator } from 'app/model/data-map.model';
import { EntityType } from 'aws-sdk/clients/iam';
import { EntityTypeEnum } from './enum.model';

export class TooltipFieldRule {
  public name: string;
  public title: string;
  public originEntity: string = null;
  public excludedValues: Array<string> = [];
}

export class TooltipOverride {
  public entity: EntityTypeEnum;
  public fields: Array<TooltipFieldRule> = [];
}

// The record that gets saved in "dataset" table.
export class DatasetTableInfo {
  public name: string; // databse name
  public title: string; // human friendly data set title
  //public codeBuild: number = 0;
  public version: number = 0;
  //public savedPoints = [];
  public events:Array<any> =[];
  public fields:Array<any> =[];
  public tables:Array<any> =[];

  public updateVersion:number = 0;
  public defaultVizConfig:GraphConfig = null;
  public decorators:Array<DataDecorator> = [];
  public tooltips:Array<TooltipOverride> = [];
}
