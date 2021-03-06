import {
  DimensionEnum,
  EntityTypeEnum,
  VisualizationEnum
} from 'app/model/enum.model';
import { GraphConfig } from '../../../model/graph-config.model';
import { GraphData } from '../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class LinearSVRRandomState {
  public static INSTANCE = 'instance';
  public static NONE = 'None';
}
export class LinearSVRLoss {
  public static EPSILON_INSENSITIVE = 'epsilon_insensitive';
  public static SQUARED_EPSILON_INSENITIVE = 'squared_epsilon_insensitive';
}


export class LinearSVRConfigModel extends VisualizationAbstractScatterConfigModel {
  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.LINEAR_SVR;
    this.label = 'Linear SVR';
    this.enableBehaviors = true;
  }

  n_components = 10;
  epsilon = 0.1; // optional
  tol = 1e-4; // optional
  c = 1; // optional
  linearSVRLoss = 'epsilon_insensitive'; // optional
  fit_intercept: Boolean = true; // optional
  intercept_scaling = 1; // optional
  dual: Boolean = true;
  verbose = 0;
  linearSVRRandomState = 'None'; // optional
  max_iter = 1000;
  dimension = DimensionEnum.THREE_D;
  batch_size: 'None';
  pcx = 1;
  pcy = 2;
  pcz = 3;
}

export interface LinearSVRDataModel extends GraphData {
  result: any;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;


  nComponents: any;
  coef: any;
  intercept: any;

}
