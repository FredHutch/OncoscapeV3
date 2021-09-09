import { DimensionEnum, EntityTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class IsoMapEigenSolver {
  public static AUTO = 'auto';
  public static DENSE = 'dense';
  public static ARPACK = 'arpack';
}

export class IsoMapPathMethod {
  public static AUTO = 'auto';
  // public static FW = 'FW';
  // public static D = 'D';
}

export class IsoMapNeighborsAlgorithm {
  public static AUTO = 'auto';
  // public static BRUTE = 'brute';
  // public static KD_TREE = 'kd_tree';
  // public static BALL_TREE = 'ball_tree';
}

export class IsoMapConfigModel extends VisualizationAbstractScatterConfigModel {
  constructor() {
    super();
    this.entity = EntityTypeEnum.SAMPLE;
    this.visualization = VisualizationEnum.ISOMAP;
    this.label = 'ISOMAP';
    this.enableSupplemental = false;
  }

  n_components = 10;
  dimension = DimensionEnum.THREE_D;
  tol = 0;
  n_neighbors = 5;
  eigen_solver = IsoMapEigenSolver.AUTO;
  path_method = IsoMapPathMethod.AUTO;
  neighbors_algorithm = IsoMapNeighborsAlgorithm.AUTO;
  pcx = 1;
  pcy = 2;
  pcz = 3;
}

export interface IsoMapDataModel extends GraphData {
  result: any;
  resultScaled: Array<Array<number>>;
  sid: Array<string>;
  mid: Array<string>;
  pid: Array<string>;

  embedding: any;
}
