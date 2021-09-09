import { EntityTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { GraphData } from './../../../model/graph-data.model';

export class TimelinesStyle {
    public static NONE = 'None';
    public static CONTINUOUS = 'Continuous Bar';
    public static TICKS = 'Bars';
    public static ARCS = 'Arcs';
    public static SYMBOLS = 'Symbols';
}

export class TimelinesConfigModel extends GraphConfig {
    constructor() {
        super();
        this.visualization = VisualizationEnum.TIMELINES;
        this.entity = EntityTypeEnum.PATIENT;
        // this.dirtyFlag = DirtyEnum.LAYOUT;
        this.label = 'Timelines';
        this.enableCohorts = true;
        this.enableGenesets = false;
        this.enableLabel = false;
        this.enableColor = false;
        this.enableShape = false;
        this.enableSupplemental = false;
    }
    firmColors = {};

    attrs = [];
    group = { label: 'None' };
    range = [0, 100];

    // TCGA default
    align:any = 'None'   // MJ | { label: 'None' };
    sort = { label: 'None' };
    sortComparison = 'First StartDate';
    bars = [
        { 'label': 'Status', 'style': TimelinesStyle.SYMBOLS, 'events': ['Follow Up', 'Diagnosis', 'Death'], row: 0, z: 0, track: 0, setAliases: {} },
        { 'label': 'Treatment', 'style': TimelinesStyle.ARCS, 'events': ['Drug', 'Radiation'], row: 0, z: 1, track: 0, setAliases: {} }
    ];

}

export interface TimelinesDataModel extends GraphData {
    result: any;
}
