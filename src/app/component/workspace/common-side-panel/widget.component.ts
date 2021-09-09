import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  Renderer2 
} from '@angular/core';
import * as d3 from 'd3';
 
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator } from '../../../model/data-map.model';
import { Legend } from '../../../model/legend.model';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { SavedPointsWrapper } from '../../visualization/savedpoints/savedpoints.model';
import { ChartFactory } from '../chart/chart.factory';
import { DataService } from 'app/service/data.service';
import { ComputeWorkerUtil } from 'app/service/compute.worker.util';
import { ScatterSelectionLassoController } from 'app/controller/scatter/scatter.selection.lasso.controller';
import { WorkspaceComponent } from '../workspace.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { genomeConstants, genomeCompute } from 'app/component/visualization/genome/genome.compute';
import { CollectionTypeEnum, EntityTypeEnum } from 'app/model/enum.model';
import { DataTable } from '../../../model/data-field.model';
import { VisualizationView } from '../../../model/chart-view.model';
import { sample } from 'rxjs/operators';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';
import { WidgetModel } from './widgetmodel';
import { Vector2, Vector3, Camera } from 'three';

import { TooltipController, ComplexTooltipData } from '../../../controller/tooltip/tooltip.controller';
import { TooltipOptions } from '../../../controller/tooltip/tooltip.controller';
import { TooltipContextObject } from './tooltipContextObject';

import { CommonSidePanelModel } from './commonSidePanelModel';

import {
  Cohort,
  CohortCondition,
  CohortField
} from './../../../model/cohort.model';
//import { CommonSidePanelModel } from './commonSidePanelModel';

@Component({
  selector: 'widget',
  templateUrl: './widget.html',
  styleUrls: ['./common-side-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class WidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myId') myId: ElementRef;
  @ViewChild('mysvgdiv') svgdiv: ElementRef;

  model= new WidgetModel();
  protected wutil  = new ComputeWorkerUtil();  // Not for remote cpu calls, just for data access utility functions.

  public tooltips: HTMLElement;
  public tooltip: string | ComplexTooltipData;
  public tooltipColor: string;
  protected tooltipOptions: TooltipOptions;
  protected tooltipController: TooltipController;

  public commonSidePanelModel:CommonSidePanelModel = null;

  constructor(
    public renderer: Renderer2
  ) { 
    this.tooltipOptions = new TooltipOptions();
    this.tooltip = '';
    this.tooltips = <HTMLDivElement>document.createElement('div');
    this.tooltips.id = 'visTooltipsDiv' + this.getSvgName();
    this.tooltips.className = 'xtooltiptext' ; 
    let self = this;
    console.warn('WIDGET constructor.');
    //////this.commonSidePanel = CommonSidePanelComponent.instance; // MJ
    this.tooltips.style.visibility="hidden";

  }

  public onHideTooltip(): void {
    this.tooltips.style.display = "none";
    //visibility="hidden";
    //(this.tooltips.children[0] as HTMLElement).style.visibility="hidden";
  }

  public processConfigChange(config:any): void {
    console.log('processConfigChange for ' + this.getSvgName());
    // Use  this.commonSidePanelModel.graphConfig
  }

  showOrHideTooltip(currentEventMousedOver, shouldShow:boolean){
    console.log('WIDGET showOrHideTooltip.'); 
    if(currentEventMousedOver && shouldShow) {
      // Contains:
      // tooltipContextObject: what we want tooltip to talk about,
      // mouseEvent: the mouse move event
      let contextObject = currentEventMousedOver.tooltipContextObject;
      let mouseMoveEvent = currentEventMousedOver.mouseEvent;

      this.tooltip= this.complexTooltipFromContextObject(contextObject);
      this.tooltipColor = contextObject.color;
      let yFudge = 20;  // Don't know why tooltip is too low, so fudge factor.
      let generatedHTML = TooltipController.generateHtml(null, 
        this,
        {
          position: new Vector2(mouseMoveEvent.x+15, mouseMoveEvent.y-yFudge), //x + 15, e.event.clientY - 20, 0),
          userData: { tooltip: this.tooltip, color: this.tooltipColor }
        },
        this.tooltipOptions
      );
      this.tooltips.innerHTML = generatedHTML;
      this.tooltips.style.display = "block";
    } else {
      this.onHideTooltip();
    }
  }

  complexTooltipFromContextObject(contextObject: TooltipContextObject): ComplexTooltipData {
    let shmooltip = '<div>Placeholder</dive>';
    let complexTooltip = new ComplexTooltipData(
      contextObject.entityType,
      contextObject.entityId,
      null, // related entityType?
      null,
      event,
      shmooltip
    );
    return (complexTooltip);
  }

  clearSvg(){
    console.log('clearSvg '+ this.model.name );
    d3.select(this.svgdiv.nativeElement)
    .selectAll("svg > *").remove();
  }

  getName() {
    return this.model.name;
  }

  getSvgName() {
    return "svgContainer_" + this.model.name.replace(' ','_');
  }

  svgNode:HTMLElement;
  svgD3Selection = null;

  ngOnInit() {
    let self = this;

    // this.el.nativeElement.style.color = 'blue';
    this.renderer.setStyle(this.svgdiv.nativeElement, 'color', 'blue');
    this.renderer.setStyle(this.svgdiv.nativeElement, 'height', this.model.preferredHeight);
    this.renderer.setValue(this.svgdiv.nativeElement, "wjf");

    let parentOfSvg = (this.svgdiv.nativeElement as HTMLDivElement);
    this.svgD3Selection = d3
        .select(parentOfSvg)
        .append('svg')
        .attr('width',  OncoData.instance.currentCommonSidePanel.commonSidePanelModel.width)
        .attr('height', this.model.preferredHeight)
        ; 
    this.svgNode = this.svgD3Selection.node() as HTMLElement;
    parentOfSvg.getElementsByTagName("svg")[0].addEventListener("mouseenter", handleMouseEnterGeneralSvg);

    function handleMouseEnterGeneralSvg(this: HTMLElement) {
      self.tooltips.style.display = "none";
    }


    this.tooltips.id = 'visTooltipsDiv' + this.getSvgName();
    document.body.appendChild(this.tooltips);

    const button = document.querySelector("button");
    this.tooltips.addEventListener("mouseenter", handleMouseenter);
    
    function handleMouseenter(this: HTMLElement) {
      console.log("MOUSEENTER tooltip!");
      self.tooltips.style.display = "block";
      // let tt = self.tooltips.getElementsByClassName("xtooltiptext");
      // if(tt.length>0) {
      //   tt[0].addEventListener("mouseout", handleMouseout);
      //   console.log('added mouseout handler tooltip.');
      // }
    }    
    // function handleMouseout(this: HTMLElement) {
    //   console.log("MOUSEOUT tooltip!");
    //   //self.tooltips.style.display = "none";
    // }    


  }

  ngAfterViewInit() {
    //this.svgdiv.nativeElement.value
    console.log('WDGET about to run...')
    //console.log('WDGET== ' +  this.myId.nativeElement);
  }

  ngAfterViewChecked(){
    console.log('ngAfterViewChecked called')
  }

  ngOnDestroy() {}

}