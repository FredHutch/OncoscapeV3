import { VisualizationEnum, GraphEnum, EntityTypeEnum, DimensionEnum, ShapeEnum } from 'app/model/enum.model';
import { GraphData } from './../../../model/graph-data.model';
import { Legend } from './../../../model/legend.model';
import { DataFieldFactory } from './../../../model/data-field.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataField } from 'app/model/data-field.model';

export class FaSvdMethod {
    public static RANDOMIZED = 'randomized';
    public static LAPACK = 'lapack';
}

export class FaConfigModel extends GraphConfig {

    constructor() {
        super();
        this.entity = EntityTypeEnum.SAMPLE;
        this.visualization = VisualizationEnum.FA;
        this.label = 'Factor Analysis';
    }

    dimension = DimensionEnum.THREE_D;
    n_components = 3;
    svd_method = FaSvdMethod.RANDOMIZED;
    tol = 0.01;
}


export interface FaDataModel extends GraphData {
    result: any;
    resultScaled: Array<Array<number>>;
    sid: Array<string>;
    mid: Array<string>;
    pid: Array<string>;
    loglike: any;
    noiseVariance: any;
    nIter: any;
}
