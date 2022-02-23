import { GraphConfig } from 'app/model/graph-config.model';
import { DataDecorator } from 'app/model/data-map.model';
import { TooltipConfig } from 'ngx-bootstrap';
import { TooltipOverride } from './dataset-table-info.model';

export class DatasetUpdates {
  public codeBuild: number = 0;
  public version: number = 0;
  public title: string;
  public savedPoints = [];
  public defaultVizConfig:GraphConfig = null;
  public decorators:Array<DataDecorator> = [];
  public tooltips:Array<TooltipOverride> = [];
  public customColors = {}; // dictionary-like object, entries of form: "Sample group!gtex": "\"#9ACD32\"".  Note the "!" between legend and item names.
}
