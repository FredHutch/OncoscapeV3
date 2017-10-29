import { GraphData } from './../../../model/graph-data.model';
import { Legend } from './../../../model/legend.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { VisualizationEnum, DimensionEnum, GraphEnum, EntityTypeEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory } from 'app/model/data-field.model';

export class BoxWhiskersConfigModel extends GraphConfig {
    constructor() {
        super();
        this.entity = EntityTypeEnum.GENE;
        this.visualization = VisualizationEnum.CHROMOSOME;
    }

    displayType: DimensionEnum = DimensionEnum.THREE_D;
    domain: Array<number> = [-500, 500];
    chromosome = '4';
}

export interface BoxWhiskersDataModel extends GraphData {
    // legends: Array<Legend>;
    genes: any;
    links: any;
    // bands: any;
    // chromo: Array<{'chr': string, 'P': number, 'C': number, 'Q': number}>;
    // showAllGenes: Boolean;
    // showBands: Boolean;
    // allowRotation: Boolean;
}
