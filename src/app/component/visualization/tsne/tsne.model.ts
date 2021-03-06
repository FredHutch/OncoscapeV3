import { VisualizationEnum, EntityTypeEnum, DimensionEnum } from 'app/model/enum.model';
import { GraphData } from './../../../model/graph-data.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { VisualizationAbstractScatterConfigModel } from "../visualization.abstract.scatter.model";

export class TsneMetric {
    public static EUCLIDEAN = 'euclidean';
    public static MANHATTAN = 'manhattan';
    public static CITYBLOCK = 'cityblock';
    public static COSINE = 'cosine';
    public static L1 = 'l1';
    public static L2 = 'l2';
    public static BRAYCURTIS = 'braycurtis';
    public static CANBERRA = 'canberra';
    public static CHEBYSHEV = 'chebyshev';
    public static HAMMING = 'hamming';
    public static CMATCHING = 'matching';
    public static MINKOWSKI = 'minkowski';
    public static ROGERSTANIMOTO = 'rogerstanimoto';
    public static RUSSELLRAO = 'russellrao';
    public static SOKALMICHENER = 'sokalmichener';
    public static SQEUCLIDEAN = 'sqeuclidean';
    public static KULSINSKI = 'kulsinski';

}

export class TsneMethod {
    public static BARNES_HUT = 'barnes_hut';
    public static EXACT = 'exact';

}

export class TsneConfigModel extends VisualizationAbstractScatterConfigModel {

    constructor() {
        super();
        this.entity = EntityTypeEnum.SAMPLE;
        this.visualization = VisualizationEnum.TSNE;
        this.label = 'T-SNE';
    }

    dimension = DimensionEnum.THREE_D;
    n_components = 3;
    perplexity = 5;
    early_exaggeration = 5;
    learning_rate = 500;
    n_iter = 250;
    n_iter_without_progress = 300;
    min_grad_norm = 1e-7;
    metric = TsneMetric.EUCLIDEAN;
    sk_method = TsneMethod.BARNES_HUT;
    pcx = 1;
    pcy = 2;
    pcz = 3;
}

export interface TsneDataModel extends GraphData {
    result: any;
    resultScaled: Array<Array<number>>;
    sid: Array<string>;
    mid: Array<string>;
    pid: Array<string>;

    embedding: any;
    klDivergence: any;
    nIter: any;
}
