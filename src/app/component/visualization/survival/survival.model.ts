import { EntityTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { GraphData } from 'app/model/graph-data.model';
import { Legend } from './../../../model/legend.model';


export class SurvivalConfigModel extends GraphConfig {
    constructor() {
        super();
        this.entity = EntityTypeEnum.PATIENT;
        this.visualization = VisualizationEnum.SURVIVAL;
        this.label = 'Survival';
        this.enableCohorts = true;
        this.enableGenesets = false;
        this.enableLabel = false;
        this.enableColor = false;
        this.enableShape = false;
        this.enableSupplemental = false;
    }
    censorEvent: string;
    cohortsToCompare: Array<string> = [];

    static isPatientDead = (v) => {
        return v.vital_status ==='dead'
        || v.vital_status === '1'
        || v.os_status ==='DECEASED'
        || v.os_status ==='deceased';
    };

    // Clinical data harmonization: Support GDC/TCGA  and cBioPortal fields.
    // See https://wiki.fhcrc.org/display/ON/Clinical+Data+Harmonization -MJ

    static patientHasSurvivalData = (v) => {
        let hasTcgaSurvival:boolean =
        v['vital_status'] &&
        (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup']);
        

        let hasCbioportalSurvival:boolean =
        v['os_status'] &&
        v['os_months'];

        return hasTcgaSurvival || hasCbioportalSurvival;
    }

    static survivalTime = (v) => {
        if (
            v['vital_status'] &&
            (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup'])) {
            // Use GDC/TCGA fields
            if (SurvivalConfigModel.isPatientDead(v)) {
                return v['days_to_death'];
            } else {
                return (v['days_to_last_follow_up'] === undefined
                ? v['days_to_last_followup']
                : v['days_to_last_follow_up']);
            }
        } else {
            if (
            v['os_status'] &&
            v['os_months']) {
                // Use cBioPortal fields
                return v['os_months'];
            } else {
                // Neither GDC/TCGA nor cBioPOrtal fields are valid, treat as missing.
                return -1;
            }
        }
    }    
}
export interface SurvivalDatumModel {
    line: Array<[number, number]>;
    upper: Array<[number, number]>;
    lower: Array<[number, number]>;
    range: Array<[number, number]>;
    name: string;
    color: number;
}
export interface SurvivalDataModel extends GraphData {
    legends: Array<Legend>;
    survival: Array<SurvivalDatumModel>;
}
