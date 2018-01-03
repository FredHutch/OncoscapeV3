import { Legend } from './../../../model/legend.model';

import { GraphConfig } from 'app/model/graph-config.model';
import { VisualizationEnum, DimensionEnum, GraphEnum, EntityTypeEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory } from 'app/model/data-field.model';

export class TimelinesStyle {
    public static CONTINUOUS = 'Continuous Bar';
    public static TICKS = 'Ticks';
    public static ARCS = 'Arcs';
}

export class TimelinesConfigModel extends GraphConfig {
    constructor() {
        super();
        this.visualization = VisualizationEnum.TIMELINES;
        this.entity = EntityTypeEnum.PATIENT;
    }
    align = 'Diagnosis';
    sort = 'Death';
    timescale = 'Linear';
    visibleElements: any;
    treatmentStyle = TimelinesStyle.TICKS;
    statusStyle = TimelinesStyle.TICKS;
}

export interface TimelinesDataModel {
    legends: Array<Legend>;
    result: any;
}
