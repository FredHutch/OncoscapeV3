import {
  DimensionEnum,
  EntityTypeEnum,
  VisualizationEnum
} from 'app/model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class PcaKernalMethods {
  public static LINEAR = 'linear';
  public static POLY = 'poly';
  public static RBF = 'rbf';
  public static SIGMOID = 'sigmoid';
  public static COSINE = 'cosine';
  public static PRECOMPUTED = 'precomputed';
}
export class PcaKernalEigenSolver {
  public static AUTO = 'auto';
  public static DENSE = 'dense';
  public static ARPACK = 'arpack';
}

export class PcaKernalConfigModel extends VisualizationAbstractScatterConfigModel {
  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.KERNAL_PCA;
    this.label = 'PCA Kernal';
    this.enableSupplemental = false;
    this.enableBehaviors = true;
  }
  n_components = 10;
  dimension = DimensionEnum.THREE_D;
  kernel = PcaKernalMethods.LINEAR;
  degree = 3;
  coef0 = 1;
  alpha = 1.0;
  fit_inverse_transform = false;
  eigen_solver = PcaKernalEigenSolver.AUTO;
  tol = 0;
  remove_zero_eig = false;
  pcx = 1;
  pcy = 2;
  pcz = 3;
}

export interface PcaKernalDataModel extends GraphData {
  result: Array<Array<number>>;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;
  lambdas: any;
  alphas: any;
  dualCoef: any;
  X_transformed_fit_: any;
  X_fit_: any;
}
