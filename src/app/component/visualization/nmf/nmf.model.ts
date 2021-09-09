import {
  DimensionEnum,
  EntityTypeEnum,
  VisualizationEnum
} from 'app/model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class NmfInit {
  public static RANDOM = 'random';
  public static NNDSVD = 'nndsvd';
  public static NNDSVDA = 'nndsvda';
  public static NNDSVDAR = 'nndsvdar';
}
export class NmfSolver {
  public static CD = 'cd';
  public static MU = 'mu';
}
export class NmfBetaLoss {
  public static FROBENIUS = 'frobenius';
  public static KULLBACK_LEIBLER = 'kullback-leibler';
  public static ITAKURA_SAITO = 'itakura-saito';
}

export class NmfConfigModel extends VisualizationAbstractScatterConfigModel {
  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.NMF;
    this.label = 'Non-Negative Matrix Factorization';
    this.enableBehaviors = true;
  }

  n_components = 10;
  dimension = DimensionEnum.THREE_D;
  init = NmfInit.RANDOM;
  solver = NmfSolver.CD;
  beta_loss = NmfBetaLoss.FROBENIUS;
  tol = 1e-4;
  pcx = 1;
  pcy = 2;
  pcz = 3;
}

export interface NmfDataModel extends GraphData {
  result: any;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;
  components: any;
  reconstruction_err: any;
  nIter: any;
}
