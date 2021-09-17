import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Renderer2
} from '@angular/core';
import * as d3 from 'd3';
 
import { WidgetComponent } from "./widget.component";
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator, DataDecoratorTypeEnum } from '../../../model/data-map.model';
import { DataService } from 'app/service/data.service';
import { ComputeWorkerUtil } from 'app/service/compute.worker.util';
import { WorkspaceComponent } from '../workspace.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { CollectionTypeEnum, EntityTypeEnum } from 'app/model/enum.model';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { LoadedTable, OncoData } from 'app/oncoData';
import { DiffexpResult, DiffexpResults } from  '../common-side-panel/diffexpResults';
import { TooltipContextObject } from '../common-side-panel/tooltipContextObject';
import { Cohort } from './../../../model/cohort.model';

@Component({
  selector: 'diffexp-widget',
  templateUrl: './widget.html',
  styleUrls: ['./common-side-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class DiffexpWidgetComponent extends WidgetComponent {
  constructor(
    renderer: Renderer2
  ) 
  { 
    super(renderer);
    this.model.name = "Differential Expression";
    this.model.preferredHeight = "190px";
  }

  drawSvg(svg:any, options:any ):void{
    let self = this;
    this.clearSvg();

    let has = WorkspaceComponent.instance.hasLoadedTable(options.tableName);
    let lt:LoadedTable = WorkspaceComponent.instance.getLoadedTable(options.tableName);

    if(lt == null) {
      console.warn('** DE widget seeing null for loaded table. Remove debugging. **')
      return;
    }

    let deResults:DiffexpResults= new DiffexpResults();
    deResults.geneResults =[]
    // get decorators from viz in graphA, else graphB?
    
    let width = this.svgdiv.nativeElement.clientWidth;
    let chartHeight = this.svgdiv.nativeElement.clientHeight;


    let debugChartSceneInstance = ChartScene.instance;
    console.log('About to check decorator '+debugChartSceneInstance);

    let selectionDecoratorType:number = 0 + DataDecoratorTypeEnum.SELECT ;
    let selectionDecorators:DataDecorator[]= [];
    let views = ChartScene.instance.views;
    if(views){
      selectionDecorators = views[0].chart.decorators
        .filter(v => v.type == selectionDecoratorType);
      if (selectionDecorators.length ==0){
        selectionDecorators = views[1].chart.decorators
        .filter(v => v.type == selectionDecoratorType);
      }
    } else {
      console.warn('WARN: DiffExp failed to find ChartScene.instance.views.');
      return;
    }

    if (selectionDecorators.length ==0
      && OncoData.instance.currentSelectionController.highlightIndexes.size == 0){
      svg.append("text")
          .attr("text-anchor",   "middle")
          .attr("x", width / 2)
          .attr("y", chartHeight / 2)
          .text("No samples selected");
      return;
    }

    let sids = selectionDecorators[0].values.map(v=>{
      return v.sid;
    })

    let cohortA:Cohort =   {
      n:"tempA",
      pids: [],
      sids: sids,
      conditions: []
    }  
    // make set to speed up test in cohortB creation.
    var setOfSids = new Set(sids);

    // cohortB will be all except cohortA.
    let amap = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.sampleMap;
    let allKeys = Object.keys(amap);

    let unusedKeys = allKeys.filter(v=> setOfSids.has(v)==false);
    let cohortB:Cohort =   {
      n:"tempB",
      pids: [],
      sids: unusedKeys,
      conditions: []
    }      
    
    let limitedExprData = lt.data;
    let markerFilter = OncoData.instance.currentCommonSidePanel.config.markerFilter;
    if(markerFilter == null || markerFilter.length ==0){
      console.log('ONLY testing with first few genes in entire table.'); // !!!
      limitedExprData = (lt.data as Array<Object>).slice(0,1000);
    } else {
      let mfSet:Set<string> = new Set(markerFilter);
      limitedExprData = (lt.data as Array<Object>).filter(v => mfSet.has(v["m"]));
    }
    deResults = DiffexpWidgetComponent.gutsOfNaiveDiffExp(
      lt.map, limitedExprData, cohortA, cohortB
    );
    console.log('after DERESULTS....');
    console.log(deResults);

    if(deResults.geneResults.length==0) {
      svg.append("text")
        .attr("text-anchor",   "middle")
        .attr("x", width / 2)
        .attr("y", chartHeight / 2)
        .text("No differences");
      return;
    }
    
    let metric = "absolute";
    let margin = ({top: 30, right: 60, bottom: 10, left: 60})
    let numBars = Math.ceil(((chartHeight - margin.bottom)- margin.top) / (10+2)); //10;
    let data = deResults.geneResults.slice(0,numBars-1).map(v=>{
      let valLimited =  Math.min(Math.max(v.logFoldChange, -9.876), 9.876);
      return { name: v.hugoName, value: valLimited}
    });
    data.push({name:"", value: 0}); // Hacky - Forces showing of labels in case where all values are positive.


    let barHeight = 10;
    console.log(`${Date.now()} DE tbl rna? ${WorkspaceComponent.instance.hasLoadedTable('rna')}.`);

    let format = d3.format("+.1f")  
    let tickFormat =  d3.formatPrefix(".1f", 1)  

    let x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .rangeRound([margin.left, width - margin.right])

    data.pop(); // Remove hacky "0" value, now that x scale is set.

    let y = d3.scaleBand()
      .domain(data.map(v=>v.name))  // [0, data.length-1])  // d3.range(data.length))
      .rangeRound([margin.top, chartHeight - margin.bottom])
      .padding(0.1)

    let xAxis = g => g
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(x).ticks(width / 80).tickFormat(tickFormat))
      .call(g => g.select(".domain").remove())

    // Names of genes.
    let yAxis = g => g
      .attr("transform", `translate(${x(0)},0)`)
      .call(d3.axisLeft(y).tickFormat(i => { return i; // i is the gene name. //data[i].name
      }).tickSize(0).tickPadding(6))
      .call(g => g.selectAll(".tick text").filter(i => data.find(v=>v.name==i).value < 0)
        .attr("text-anchor", "start")
        .attr("x", 6));

    // bars
    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
        .attr("fill", d => d3.schemeSet1[d.value > 0 ? 0 : 1]) // Red for pos, blue for neg
        .attr("x", d => x(Math.min(d.value, 0)))
        .attr("y", (d, i) => y(data[i].name))
        .attr("width", d => Math.abs(x(d.value) - x(0)))
        .attr("height", y.bandwidth())
        .on("mouseover",function(d){
          d3.select(this)
            .classed("inactive",false)

            let cemo = {
              tooltipContextObject : new TooltipContextObject(
                EntityTypeEnum.GENE,
                d.name
              ),
              mouseEvent: d3.event
            }
            self.showOrHideTooltip(cemo, true);

            // TOOL TIP
            if(self.tooltips){
              console.log(`tooltip on: ${d.name}`);
              //self.tooltips.innerHTML =`${d.name}`;
              //self.tooltips.style.visibility="visible"
            }
        })
        .on("mouseout",function(d){
          d3.select(this);
            //.classed("inactive",true)

          let cemo = {
            tooltipContextObject : new TooltipContextObject(
              EntityTypeEnum.GENE,
              d.name
            ),
            mouseEvent: d3.event
          }
          self.showOrHideTooltip(cemo, false);


          if(self.tooltips){
            console.log(`tooltip off`);
            //self.tooltips.innerHTML =``;
            //self.tooltips.style.visibility="hidden"
          }
        })
  
    // textual values to left/right of bar.
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("text")
      .data(data)
      .join("text")
        .attr("text-anchor", d => d.value < 0 ? "end" : "start")
        .attr("x", d => x(d.value) + Math.sign(d.value - 0) * 4)
        .attr("y", (d, i) => {
          // console.log('textloop i='+i);
          let newY = y(data[i].name) + y.bandwidth() / 2
          return newY
        })
        .attr("dy", "0.35em")
        .text(d => format(d.value));
  
      svg.append("g")
      .call(xAxis);

      svg.append("g")
        .call(yAxis);

  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {}

  static mean = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

  static median(values){
    if(values.length ===0) return 0;
  
    values.sort(function(a,b){
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
  
    if (values.length % 2)
      return values[half];
  
    return (values[half - 1] + values[half]) / 2.0;
  }

  static gutsOfNaiveDiffExp(storedMapData, expressionData, cohortA:Cohort, cohortB:Cohort):DiffexpResults {

    let deResults:DiffexpResults = new DiffexpResults();
    if(cohortA.sids.length==0 || cohortB.sids.length==0){
      return deResults;
    }

    //console.log(`Table data is ${expressionData.length} rows.`);
    //console.log(`And we still see mapData is ${storedMapData.length} rows.`);

    // expressionData[4].d = 337 records, for the 337 samples in the map.
    // Build a list of id positions for cohortA, and another list for cohortB.
    // Here are the sampleIDs, in proper order.
    let sampleIdsInOrder:Array<string> = storedMapData.sort((a, b) => a.i - b.i).map(a => a.s);
    let cohortASidPositions:Array<number> = 
      cohortA.sids.map(sid => sampleIdsInOrder.findIndex(x => x == sid)).filter(v => v>=0);
    let cohortBSidPositions:Array<number> = 
      cohortB.sids.map(sid => sampleIdsInOrder.findIndex(x => x == sid)).filter(v => v>=0);

      if(cohortASidPositions.length==0){ 
        cohortASidPositions=[];
        console.warn('cohortASidPositions has no samples.');
        return deResults;
      }      
      if(cohortBSidPositions.length==0){ 
        cohortBSidPositions=[];
        console.warn('cohortBSidPositions has no samples.');
        return deResults;
      }


    let geneStatList = []; // each 
    // tweak             self.progressValue  if we want, but the actual loop is fast.

    var errorReported = false;
    var startTime = Date.now();
    expressionData.forEach(function(element){
      let cohortAValues:Array<number> = [];
      let cohortBValues:Array<number> = [];
      cohortASidPositions.forEach(function(sidPos) {
        if (sidPos > -1) {
          let rawVal = element.d[sidPos];
          cohortAValues.push(rawVal==0 ? 0 : Math.log(rawVal));
        }
      });
      cohortBSidPositions.forEach(function(sidPos) {
        if (sidPos > -1) {
          let rawVal = element.d[sidPos];
          cohortBValues.push(rawVal==0 ? 0 : Math.log(rawVal));
        }
      });

      let noNaNcohortAValues = cohortAValues.filter(v => isNaN(v)==false);
      let noNaNcohortBValues = cohortBValues.filter(v => isNaN(v)==false);
      let aMean = DiffexpWidgetComponent.mean(noNaNcohortAValues);
      let bMean = DiffexpWidgetComponent.mean(noNaNcohortBValues);

      if(isFinite(aMean)==false||isFinite(bMean)==false || isNaN(aMean) || isNaN(aMean)){
        if(errorReported==false){
          console.warn('infinity or NaN');
          errorReported = true;
        }
      } else {
        if (aMean != bMean) {  // Ignore the gene if the cohorts have same stats.
          let absDiff = Math.abs(aMean - bMean);
          let geneStat = {
            geneName: element.m,
            aMedian: DiffexpWidgetComponent.median(cohortAValues),
            bMedian: DiffexpWidgetComponent.median(cohortBValues),
            aMean: aMean,
            bMean: bMean,
            absDiff: absDiff
          };
          geneStatList.push(geneStat);
        }
      }
      
    });

    let firstPartTime = Date.now() - startTime;
    console.log(`Diffexp #1 = ${firstPartTime} ms`);

    if (geneStatList.length == 0) {
      deResults.error= 'No genes showed a difference between those cohorts. ';
    } else {
      geneStatList.sort((a, b) => a.absDiff - b.absDiff).reverse();

      let secondPartTime = (Date.now() - startTime)-firstPartTime;
      console.log(`Diffexp #2 = ${secondPartTime} ms`);

      let topGenes = geneStatList.slice(0,200);
      //console.dir(topGenes);
      let geneNames = topGenes.map(g => g.geneName).join(' ' );
      //console.log(geneNames);
      
      let topDiffexpResults = topGenes.map(g => {
        // Start with absDiff, so we can use log2 without getting NaN.
        // But then return pos or neg.
        let val = Math.log2(g.absDiff+0.0000001);
        return new DiffexpResult(g.geneName, g.aMean>g.bMean ? val : 0-val, null);
      })
      deResults.geneResults = topDiffexpResults; // already sliced/cloned above.

    }
  
    return deResults;
  }

}