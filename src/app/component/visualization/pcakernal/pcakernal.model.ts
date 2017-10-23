import { VisualizationEnum, GraphEnum, EntityTypeEnum, DimensionEnum, ShapeEnum } from 'app/model/enum.model';
import { GraphData } from './../../../model/graph-data.model';
import { Legend } from './../../../model/legend.model';
import { DataFieldFactory } from './../../../model/data-field.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataField } from 'app/model/data-field.model';

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

export class PcaKernalConfigModel extends GraphConfig {
    constructor() {
        super();
        this.entity = EntityTypeEnum.SAMPLE;
        this.visualization = VisualizationEnum.KERNAL_PCA;
    }
    n_components = 3;
    dimension = DimensionEnum.THREE_D;
    kernel = PcaKernalMethods.LINEAR;
    degree = 3;
    coef0 = 1;
    alpha = 1.0;
    fit_inverse_transform = false;
    eigen_solver = PcaKernalEigenSolver.AUTO;
    tol = 0;
    remove_zero_eig = false;
}


export interface PcaKernalDataModel extends GraphData {
    result: Array<Array<number>>;
    resultScaled: Array<Array<number>>;
    pointColor: Array<number>;
    pointSize: Array<number>;
    pointShape: Array<ShapeEnum>;
    sampleIds: Array<string>;
    markerIds: Array<string>;
    patientIds: Array<string>;
    lambdas: any;
    alphas: any;
    dualCoef: any;
    X_transformed_fit_: any;
    X_fit_: any;
}
