import { Legend } from './../../../model/legend.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { VisualizationEnum, DimensionEnum, GraphEnum, EntityTypeEnum, DirtyEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory } from 'app/model/data-field.model';

export class TimelinesStyle {
    public static NONE = 'None';
    public static CONTINUOUS = 'Continuous Bar';
    public static TICKS = 'Ticks';
    public static ARCS = 'Arcs';
    public static SYMBOLS = 'Symbols';
}

export class TimelinesConfigModel extends GraphConfig {
    constructor() {
        super();
        this.visualization = VisualizationEnum.TIMELINES;
        this.entity = EntityTypeEnum.PATIENT;
        this.dirtyFlag = DirtyEnum.LAYOUT;
    }
    align = 'Diagnosis';
    sort = 'Death';
    attrs = ['age at diagnosis'];
    bars = [
        { 'label': 'Treatment', 'style': 'Ticks', 'events': ['Drug', 'Radiation'] },
        { 'label': 'Status', 'style': 'Ticks', 'events': ['Follow Up', 'Diagnosis','Death'] }
    ];
}

export interface TimelinesDataModel {
    legends: Array<Legend>;
    result: any;
}
