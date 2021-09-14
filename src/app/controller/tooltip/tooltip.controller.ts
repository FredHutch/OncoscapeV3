import { AfterViewInit, OnDestroy } from '@angular/core';
import { AbstractMouseController } from './../abstract.mouse.controller';
//import { IToolTip } from './tooltip.controller';
import { ChartEvent, ChartEvents } from './../../component/workspace/chart/chart.events';
import { VisualizationView } from './../../model/chart-view.model';
import { EventEmitter } from '@angular/core';
import * as THREE from 'three';
import { ChartObjectInterface } from './../../model/chart.object.interface';
import { EntityTypeEnum, GraphEnum, VisualizationEnum } from 'app/model/enum.model';
import { OncoData } from 'app/oncoData';
import { Legend } from 'app/model/legend.model';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { DataDecorator, DataDecoratorTypeEnum, DataDecoratorValue } from '../../model/data-map.model';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { TooltipOverride } from 'app/model/dataset-table-info.model';

export interface IToolTip {
    position: THREE.Vector3|THREE.Vector2;
    userData: { tooltip: string | ComplexTooltipData, color: string };
}
export class TooltipOptions  {

    classes: Array<string> = [];    // CSS Classes To Apply
    fontsize = 12;
    offsetX = 0;                    // Offset Computed X Position By Amount After 2D Transform
    offsetY = 0;                    // Offset Computed Y Position By Amount After 2D Transform
    offsetX3d = 1;                  // Offset Computed X Position By Amount Before 2D Transform
    offsetY3d = 0;                  // Offset Computed Y Position By Amount Before 2D Transform
    offsetZ3d = 0;                  // Offset Computed Y Position By Amount Before 2D Transform
    absoluteX: number = null;       // Replace Computed X Position By Amount
    absoluteY: number = null;       // Replace Computed Y Position By Amount
    rotate = 0;                       // Degrees To Rotate Text
    origin: 'LEFT' | 'CENTER' | 'RIGHT' = 'RIGHT';   // Origin For Transforms + Positions
    prefix = '';                    // Copy To Add Before Label
    postfix = '';                   // Copy To Add After Label
    align: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED' = 'LEFT';    // Text Alignment

    generateCss(): string {
        let css = '';
        css += 'font-size:' + this.fontsize + 'px;';
        css += 'transform-origin: ' + ((this.origin === 'LEFT') ? '0%' : (this.origin === 'RIGHT') ? '100%' : '50%') + ' 50%';
        css += ';text-align: ' + this.align.toLocaleLowerCase();
        css += ';transform: rotate(' + this.rotate + 'deg) ';
        css += ';position:absolute;pointer-events:auto;cursor:auto;';
        return css;
    }
}

// For tooltip cases where the hovered item is not the same entity type
// as the whole graph (e.g., and EVENT within a PATIENT graph like Timelines),
// pass a ComplexTooltipData for tooltip, instead of just an ID string.
// The relatedEntityType and relatedId is the "parent" item, matching the
// graph's entity type.
export class ComplexTooltipData {
    entityType: EntityTypeEnum; // e.g., EVENT
    id:string;
    relatedEntityType: EntityTypeEnum; // parent, like PATIENT
    relatedId: string;
    detailObject: any;  // e.g., in case of EVENT, it is event object from Timeline
    placeholderHtml: string; // If we don't know how to handle it, use this instead.

    public toString():string {
        return this.id;
    }

    constructor(entityType: EntityTypeEnum, id:string,relatedEntityType: EntityTypeEnum,
            relatedId: string,detailObject: any,placeholderHtml: string){
        this.entityType = entityType;
        this.id = id;
        this.relatedEntityType = relatedEntityType;
        this.relatedId = relatedId;
        this.detailObject = detailObject;
        this.placeholderHtml = placeholderHtml;
    }

}

export class TooltipController extends AbstractMouseController  {
    // State
    protected _options; TooltipOptions;
    protected _hoverObjectId: number;
    protected _hoverObject: any;

    public onShow: EventEmitter<{ text: string, color: string, event: ChartEvent, complexTooltip: ComplexTooltipData }>;
    public onHide: EventEmitter<any>;
    
    private static generatePatientValuesHtml(pid:string):string {
        let patientData:any = OncoData.instance.currentCommonSidePanel.commonSidePanelModel
            .patientData.find(v => v.p==pid);
        if(patientData) {
            let result = JSON.stringify(patientData);
            return result;
        } else {
            return '';
        }

    }

    private static generateDetailsHtml(view:VisualizationView, chartEntity: EntityTypeEnum, tooltipObject: IToolTip): string {
        // "view" is not available within widgets. TBD: handle widgets.

        let result = '';
        if (tooltipObject.userData.tooltip == null || tooltipObject.userData.tooltip == '') {
            return result;
        }
        let tooltipString:string = tooltipObject.userData.tooltip.toString();
        let pid:string = '';

        let ctd:ComplexTooltipData;
        let entityTypeToUse:EntityTypeEnum = chartEntity;
        let tooltip:string|ComplexTooltipData = tooltipObject.userData.tooltip;
        if(typeof tooltip != 'string'){
            ctd = (tooltip as ComplexTooltipData);
            entityTypeToUse = ctd.entityType;
        }

        // Build list of fields. If one is the color legend field, replace it.
        // window.reachableOncoData.dataLoadedAction.datasetTableInfo.tooltips
        let tooltipFields:Array<{key:string, val:string}> = [];
        // tooltipFields.push({key:'Foo', val:'bar'});

        let tooltipOverride:TooltipOverride = null;
        if(OncoData.instance.dataLoadedAction.datasetTableInfo.tooltips){
            tooltipOverride = OncoData.instance.dataLoadedAction.datasetTableInfo
                .tooltips.find(tt => tt.entity == entityTypeToUse);
        }

        switch(entityTypeToUse){
            case EntityTypeEnum.SAMPLE:
                // Why *wouldn't* we have a sample map? In the case of SavedPoints
                // if there is no supporting info about patients.
                if(OncoData.instance.currentCommonSidePanel.commonSidePanelModel.sampleMap) {
                    result = result + '<hr />';
                    pid = OncoData.instance.currentCommonSidePanel.commonSidePanelModel
                        .sampleMap[tooltipString];
                    if(pid) {
                        let colorDecorator:DataDecorator = null;
                        

                        if(view){
                            // not a widget, a legit viz view.
                            colorDecorator = view.chart.decorators.find(v => v.type == DataDecoratorTypeEnum.COLOR);

                            let colorSnippet = view.chart.tooltipSnippetFromColorDecorator(tooltipString, tooltipOverride);
                            result = result + colorSnippet;
                        }

                        if(tooltipOverride){
                            tooltipOverride.fields.map(f => {
                                // Skip this if it is the colorSnippet field.
                                if(colorDecorator==null || (colorDecorator.field.key != f.name )){
                                    let fieldVal = "---";
                                    if (f.originEntity){
                                        // e.g., "Patients", lookup data from patient.
                                        let pd = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData;
                                        let patientKeyValue = pd.find(p => p.p == pid)[f.name];
                                        if(patientKeyValue) {
                                            if(f.excludedValues.indexOf(patientKeyValue) == -1){
                                                let newField = {key: f.title, val: patientKeyValue};
                                                tooltipFields.push(newField);
                                            }
                                        }
                                    } else {
                                        // just use this Sample's data for the field.
                                    }
                                }
                            });

                            tooltipFields.map(f =>{
                                result = result + `<b>${f.key}:</b> ${f.val}<br />`; 
                            })
                        } else {
                            if (pid != tooltipString){
                                // Only show PatientID if it differs from SampleId.
                                result = result + `PatientID: ${pid}<br />`;
                            }
                            let patientInfo = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData.find(v=>v.p==pid);
                            if(patientInfo){
                                if(patientInfo["diagnosis"]) {
                                    result = result + `Diagnosis: ${patientInfo["diagnosis"]}<br />`; 
                                }
                                if(patientInfo["vital_status"]){
                                result = result + `Vital Status: ${patientInfo["vital_status"]}<br />`; 

                                if(patientInfo["vital_status"]=="dead") {
                                    result = result + `Days to Death: ${patientInfo["days_to_death"]}<br />`; 
                                } else {
                                    result = result + `Last Follow-Up: ${patientInfo["days_to_last_follow_up"]}<br />`; 
                                }
                                }
                            }
                        }
                    } else {
                        result = result + `Unknown ID "${tooltipString}".<br />`;
                    }
                }

                break;

            case EntityTypeEnum.GENE:
                result = result + '<hr />' +
                ` <a target="_blank" href="https://www.genecards.org/cgi-bin/carddisp.pl?gene=${tooltipString}">GeneCard</a>
                | <a target="_blank" href="https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=${tooltipString}">COSMIC</a>
                `;

                let cnaData:any = OncoData.instance.currentCommonSidePanel.getCnaDataForGene(tooltipString);
                // form of   {m: "TP53", d: Array(1090), min: -2, max: 2, mean: -0.05779816513761468}
                if(cnaData) {
                    result = result + '<hr />' +
                    `CNA: Min=${cnaData.min} Max=${cnaData.max} Mean=${(cnaData.mean as number).toPrecision(4)}<br />`;
                }
                break;

            case EntityTypeEnum.PATIENT:
                pid = tooltipString;
                if(pid !=''){
                    result = result + '<hr />';
                    result = result + this.generatePatientValuesHtml(pid)+'<br />';
                }
                break;

            case EntityTypeEnum.EVENT:
                if(ctd){
                    let useStart = ctd.detailObject.originalStart ? ctd.detailObject.originalStart : ctd.detailObject.start;
                    let useEnd = ctd.detailObject.originalEnd ? ctd.detailObject.originalEnd : ctd.detailObject.end;
                    result = result + 
                    `<b>Patient:</b>&nbsp;${ctd.relatedId}&nbsp;&nbsp;&nbsp;<b>EventID:</b>&nbsp;${ctd.id}<br />
                    <b>Start:</b>&nbsp;${useStart}&nbsp;&nbsp;&nbsp;<b>End:</b>&nbsp;${useEnd}&nbsp;&nbsp;&nbsp;<b>Duration:</b>&nbsp;${useEnd-useStart}<br />
                    <hr />`;
                    let dataParts = Object.keys(ctd.detailObject.data);
                    dataParts.map(v => {
                        if (v != 'id' && v != 'type' && v != 'event_type' && v != 'event_type' && v != 'event_date (stop_date)' && v != 'event_date_diff' && v != 'rel_date (start_date)') {
                            result = result + `<b>${v}:</b>&nbsp;${ctd.detailObject.data[v].toString()}<br />`;
                        }
                    })
                } else {
                    result = result + "[ERROR: expected ComplexTooltipData for Event.]";
                }
                break;

            case EntityTypeEnum.EDGE:
                break;

             default:
                 result = result + '(unexpected entity type)'
        }
        return result;
    }

    private static getEntityIconPath(entity:EntityTypeEnum):string {
        let result = null;
        switch(entity){
            case EntityTypeEnum.SAMPLE:
                result = './assets/icons/freepik/test-tube-with-liquid.png';
                break;

            case EntityTypeEnum.GENE:
                result = './assets/icons/freepik/dna-chain.png';
                break;

            case EntityTypeEnum.PATIENT:
                result = './assets/icons/freepik/female-student-silhouette.png';
                break;

            case EntityTypeEnum.EVENT:
                result = './assets/icons/freepik/wall-clock.png';
                break;

             default:
                 result = result + ' (unexpected entity type)'
        }
        return result;
    }

    private static getTooltipTitle(chartEntity:EntityTypeEnum, tooltip:string|ComplexTooltipData):string {
        let result = tooltip.toString();
        let entityTypeToUse:EntityTypeEnum = chartEntity;
        let ctd:ComplexTooltipData;
        if(typeof tooltip != 'string'){
            ctd = (tooltip as ComplexTooltipData);
            entityTypeToUse = ctd.entityType;
        }
        switch(entityTypeToUse){
            case EntityTypeEnum.EVENT:
                // Just ID is not descriptive, so add event type.
                let type:string = ctd.detailObject.type; // e.g., "Treatment"
                let subtype:string = ctd.detailObject.subtype; // e.g., "Radiation"
                result = type;
                if(subtype){
                    result = result + " : " + subtype;
                }
                break;

        }

        return result;
    }

    // Used to use class "z-tooltip", which can now be deprecated.
    public static generateHtml(view:VisualizationView, chartEntity:EntityTypeEnum, tooltipObject: IToolTip, options: TooltipOptions): string {
        let css = options.generateCss(); 

        let alignmentOffset = (options.align === 'LEFT') ? 0 : (options.align === 'CENTER') ? 50 : -100;
        alignmentOffset =alignmentOffset + 5; // MJ - to allow wheel events to get through
        const translate = 'left:' +
            Math.round(tooltipObject.position.x + alignmentOffset + options.offsetX) + 'px; top:' +
            Math.round(tooltipObject.position.y + options.offsetY) + 'px;';
        // console.log(`gen,objY=${object.position.y},offY=${options.offsetY}.`)
        // console.log(translate)

        let entityTypeToUse:EntityTypeEnum = chartEntity;
        let tooltip:string|ComplexTooltipData = tooltipObject.userData.tooltip;
        if(typeof tooltip != 'string'){
            let ctd:ComplexTooltipData = (tooltip as ComplexTooltipData);
            entityTypeToUse = ctd.entityType;
        }

        let entityIconPath:string = 'https://www.flaticon.com/svg/static/icons/svg/46/46498.svg';
        entityIconPath = this.getEntityIconPath(entityTypeToUse);
        let detailsHtml:string = this.generateDetailsHtml(view, chartEntity, tooltipObject);
        let title = this.getTooltipTitle(chartEntity, tooltipObject.userData.tooltip);
        if(title.length > 13){
            let shortTitle = title.substring(0,12) +'…';
            title = `<a class="no-decorate-unhovered-tooltip" href="#" onclick="alert('ID: ${title}');">${shortTitle}</a>`
        }        
        const html = `
            <span class="xtooltiptext" id="theTooltip_${chartEntity}"
              style="${css + translate};border: 3px solid ${tooltipObject.userData.color}; ">
              <span ><img 
                style="vertical-align:middle" src="${entityIconPath}" width="16" height="16" />
                ${options.prefix}&nbsp;<b>${title}</b>${options.postfix}
                <div class="xtooltipexpando">${detailsHtml}</div>
              
            </span>
          `;
            
        return html;
    }

    public get lastHoverObjectId():number { return this._hoverObjectId; }
    public get lastHoverObject():any { return this._hoverObject; }

    constructor(view: VisualizationView, events: ChartEvents, chart: ChartObjectInterface, tooltipsDivEl:HTMLDivElement, debounce: number = 10) {
        super(view, events, debounce);
        this._options = new TooltipOptions();
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
        this._hoverObjectId = -1;

        let params:any = {
            Mesh: {},
            Line: { threshold: 1 },
            LOD: {},
            Points: { threshold: 5 },
            Sprite: {}
        }
        this._raycaster.params = params;
    }

    public get options(): TooltipOptions { return this._options; }
    public set options(value: TooltipOptions) {
        this._options = value;
    }


    public destroy(): void {
        super.destroy();
        this.onShow.unsubscribe();
        this.onHide.unsubscribe();
        this._options = null;
    }

    public mouseIsInside:boolean = false;

    private rectContainsPoint(rect:DOMRect, x, y):boolean {
        let rcp:boolean = 
            x >= rect.left
            && x <= rect.right 
            && y >= rect.top
            && y <= rect.bottom;
        return rcp;
    }

    public onMouseMove(e: ChartEvent): void {

    }

    public manualMouseMove(e: ChartEvent, xoffset:number): void {
        this.mouseIsInside=false;
        //let el = document.getElementsByClassName('xtooltiptext')[e.chart - 1] as HTMLDivElement;
        let el = (this._view.chart as any ).tooltips as HTMLDivElement;
        if(el.innerText != ''){
            // tooltip is showing
            let rect:DOMRect;
            let rawRect:ClientRect = el.children[0].getBoundingClientRect() ;
            
            rect = new DOMRect (
                rawRect.left - xoffset, // adjust rect if we are in right side.
                rawRect.top,
                rawRect.width,
                rawRect.height);

            this.mouseIsInside = this.rectContainsPoint(rect, e.mouse.xs, e.mouse.ys);
        }

        if (this.mouseIsInside){
            // console.log('within tooltip');
        } else {
            const intersects = this.getIntersects(this._view, e.mouse, this._targets);

            let targetCount = 0;
            this._targets.map(v => {
                if (v as THREE.Sprite) {
                    targetCount++;
                } else {
                    if (v as THREE.Mesh) {
                        targetCount++;
                    } else {
                        let g= v as any; 
                        targetCount = targetCount + g.geometry.attributes.position.array.length;
                    }
                }
            });
            // console.log(`TEMPNOTE: tooltipController looking at ${targetCount} targets.`);

            if (intersects.length === 0) {
                if (this._hoverObjectId !== -1) { 
                    //console.log(`MJ Leaving the THREE object ${JSON.stringify(this._hoverObjectId)}.`);
                    this.onHide.emit(); 
                }
                this._hoverObjectId = -1;
                this._hoverObject = null;
                return;
            }

            let preferredItemIndex = 0; 
            // It's the "closest", but if it's one of a bunch of
            // intersected items at the same z level,
            // is it the last one added? Last added at same z level should be used.

            if (intersects.length > 1) {
                // debug z-fighting
                let firstDistance = intersects[0].distance.toFixed(9);
                let biggestId = intersects[0].object.id;
                for(let i=1; i<intersects.length; i++) {
                    let iDistance = intersects[i].distance.toFixed(9);
                    if (iDistance == firstDistance){
                        // console.log('tooltip.controller same distance');
                        if(intersects[i].object.id > biggestId) {
                            preferredItemIndex = i;
                            biggestId = intersects[i].object.id;
                        }
                    }
                }
            }
            let intersection:THREE.Intersection = intersects[preferredItemIndex];
            let itemIndex:number = intersection.index;
            // We're hovering over the same thing if object id is the same,
            // and index is the same.
            if (this._hoverObjectId === intersection.object.id) { 
                if (itemIndex == null || itemIndex == 0) {
                    return;
                }
                if (this._hoverObject && itemIndex != this._hoverObject.index) {
                // new index found, stay here.
                } else {
                    return;
                }
            }
            let complexTooltip:ComplexTooltipData = null;

            this._hoverObjectId = intersection.object.id;
            this._hoverObject = intersection.object;
            const data = intersects[preferredItemIndex].object.userData;
            let tooltipData = data.tooltip;
            if(tooltipData == null) {
                tooltipData = '';
                if (data['ids']) {
                    tooltipData = data['ids'][itemIndex];
                }
                // if (intersects[0].object && intersects[0].object["geometry"] && intersects[0].object["geometry"].attributes.gMarkerScale) {
                //     let markerScaleArray = intersects[0].object["geometry"].attributes.gMarkerScale;
                //     text = text + '<hr>MarkerScale:&nbsp;' + markerScaleArray.array[itemIndex] ;
                // }
            } else {
                if(typeof tooltipData == 'string') {
                    // the string value should be the hovered object's ID, given the graph's entity type. E.g., for Sample entity, should be the sample ID.
                } else {
                   complexTooltip = tooltipData;
                   console.log(`Complex tooltipData == [${complexTooltip.entityType}:${complexTooltip.id} within ${complexTooltip.relatedEntityType}:${complexTooltip.relatedId}]`);
                }
            }
            let color = 0x0099CC;
            if(data.hasOwnProperty('color')) {
                color = data.color;
            } else {
                if (data['ids'] && this._view.chart){
                    let id = data['ids'][itemIndex];
                    console.log('Figure out color');
                    color = this._view.chart.tooltipColorFromDecorator(id, color);
                }
            }

            if (tooltipData === '') { 
                return; 
            }

            const hex = '#' + (0xffffff + color + 1).toString(16).substr(1);
            this.onShow.emit({
                text: tooltipData,
                color: hex,
                event: e,
                complexTooltip: complexTooltip
            });
        }
    }
}
