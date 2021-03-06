import { DimensionEnum, EntityTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';
import { Legend } from './../../../model/legend.model';

export class LinkedGeneConfigModel extends GraphConfig {
    constructor() {
        super();
        this.entity = EntityTypeEnum.GENE;
        this.visualization = VisualizationEnum.LINKED_GENE;
        this.label = 'Linked Geneww';
    }

    displayType: DimensionEnum = DimensionEnum.THREE_D;
    domain: Array<number> = [-500, 500];
    chromosomeOption = 'Cytobands';
}

export interface LinkedGeneDataModel extends GraphData {
    legends: Array<Legend>;
    genes: any;
    bands: any;
    chromo: Array<{ 'chr': string, 'P': number, 'C': number, 'Q': number }>;
    showAllGenes: Boolean;
    showBands: Boolean;
    allowRotation: Boolean;
}
