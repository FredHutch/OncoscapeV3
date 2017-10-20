import { VisualizationEnum, GraphEnum, EntityTypeEnum, DimensionEnum, ShapeEnum } from 'app/model/enum.model';
import { GraphData } from './../../../model/graph-data.model';
import { Legend } from './../../../model/legend.model';
import { DataFieldFactory } from './../../../model/data-field.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataField } from 'app/model/data-field.model';

export class TruncatedSvdAlgorithem {
    public static RANDOMIZED = 'randomized';
    public static ARPACK = 'arpack';
}

export class TruncatedSvdConfigModel extends GraphConfig {
    constructor() {
        super();
        this.entity = EntityTypeEnum.SAMPLE;
        this.visualization = VisualizationEnum.TRUNCATED_SVD;
    }
    dimension = DimensionEnum.THREE_D;
    algorithm = TruncatedSvdAlgorithem.RANDOMIZED;
    n_components = 3;
    tol = 0;
    n_iter = 5;
}

export interface TruncatedSvdDataModel extends GraphData {
    result: any;
    resultScaled: Array<Array<number>>;
    pointColor: Array<number>;
    pointSize: Array<number>;
    pointShape: Array<ShapeEnum>;
    sampleIds: Array<string>;
    markerIds: Array<string>;
    patientIds: Array<string>;
    components: any;
    explainedVariance: any;
    explainedVarianceRatio: any;
    singularValues: any;
}
