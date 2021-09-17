import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  Renderer2
} from '@angular/core';
import * as d3 from 'd3';
 
import { WidgetComponent } from "./widget.component";
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
import { CollectionTypeEnum } from 'app/model/enum.model';
import { DataTable } from '../../../model/data-field.model';
import { VisualizationView } from '../../../model/chart-view.model';
import { sample } from 'rxjs/operators';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';
//import { CommonSidePanelComponent } from './common-side-panel.component';

@Component({
  selector: 'copynumber-widget',
  templateUrl: './widget.html',
  styleUrls: ['./common-side-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class CopynumberWidgetComponent extends WidgetComponent {
  private sidGainPixelLists = {};
  private sidLossPixelLists = {};
  private copynumberWidgetReadyToDraw:boolean = false;
  // public patientMap = null;
  private totalChrSizes:number;
  private spaceBetweenChrs:number = 0;  // 20000000 is a visible space
  private totalWidthWithSpacing:number;
  private chrMetaData:Array<any>;
  private chrStartingPositions:Array<number>;

  private cnaFilteredGenes = [];
  private cnaPixelatedGeneDict = {};
  copynumberSvgMargin = ({top: 1, right: 2, bottom: 14, left: 10});
  copynumberSvgHeight = 130;
  public selectedCurveWidth = "2.2";
  public unSelectedCurveWidth = "0.9";

  constructor(
    renderer: Renderer2
  ) 
  { 
    super(renderer);
    let self=this;
    this.model.name = "Copy Number";
    this.model.preferredHeight = "130px";
    this.sidGainPixelLists = {};
    this.sidLossPixelLists = {};
    // // // this.commonSidePanel = commonSidePanel;

    this.chrMetaData = genomeConstants.ct19.map(v => { return {chr: v.chr, size: v.Q}})
    this.totalChrSizes = genomeConstants.ct19.reduce(function(acc,b){
      return acc + b.Q;
    }, 0);
    console.log(`total chr sizes = ${this.totalChrSizes}`);
    this.chrStartingPositions = [];
    let currentStartingPos = 0;
    this.chrMetaData.map(function(v) {
      self.chrStartingPositions.push(currentStartingPos);
      currentStartingPos = currentStartingPos + v.size + self.spaceBetweenChrs;
    });
    this.totalWidthWithSpacing = this.totalChrSizes + (this.chrMetaData.length-1) * this.spaceBetweenChrs;
    console.log(`totalWidthWithSpacing = ${this.totalWidthWithSpacing}`);
  }

  private findPixelsForEachFilteredGene(){
    let self = this;
    const xScaleForCopynumbers = d3.scaleLinear()
    .domain([0, self.totalWidthWithSpacing]) 
    .range([self.copynumberSvgMargin.left, this.commonSidePanelModel.width - self.copynumberSvgMargin.right]);

    const yScaleForCopynumber = d3.scaleLinear()
    .domain([0, 100]).nice()
    .range([self.copynumberSvgHeight - self.copynumberSvgMargin.bottom, self.copynumberSvgMargin.top]);

    let pixelsPerFilteredGene = {};
    let i=0;
    this.cnaFilteredGenes.map(function(gene){
      // Example:  ["RNU6-1253P", "1", "p32.3", 51215968, 51215968, 51216025, 1, "snRNA"]
      // [4],[5] is the range.

      let geneRelStart = gene[4];
      let geneRelEnd = gene[5];
      let chrAsInt = gene[1] == "X" ? 23 : (gene[1] == "Y" ? 24 : Math.round(gene[1]));
      pixelsPerFilteredGene[gene[0]] = {start: geneRelStart, end: geneRelEnd, chr: gene[1], chrIndex: chrAsInt-1};
      let startingPos = self.chrStartingPositions[chrAsInt-1];
      let xGeneS = xScaleForCopynumbers(startingPos + geneRelStart);
      // Assume any gene is 1 pixel wide. (Otherwise, we'd do let xGeneE = xScaleForCopynumbers(startingPos + geneRelEnd);)
      let startPixel:number = Math.round(xGeneS);
      pixelsPerFilteredGene[gene[0]]['pixel'] = startPixel;

    });
    self.cnaPixelatedGeneDict = pixelsPerFilteredGene;
    console.log('End of findPixelsForEachFilteredGene. cnaPixelatedGeneDict...');
    console.dir(self.cnaPixelatedGeneDict);
  }


  async drawCopynumbers(): Promise<any> {
    let self = this;

    let debugCNAkey = OncoData.instance.dataLoadedAction.dataset + '_hasShownSkipCNA';
    if(window[debugCNAkey] == null) {
      window.alert("******** SKIP drawCopynumbers *****");
    }
    window[debugCNAkey]=true;
    return;








    // if(this._config.table && 
    //   (this._config.table.tbl.toLowerCase().endsWith('cna') ||
    //    this._config.table.ctype== CollectionTypeEnum.GISTIC || 
    //    this._config.table.ctype== CollectionTypeEnum.GISTIC_THRESHOLD)){
   
    while (this.copynumberWidgetReadyToDraw ==false || this.commonSidePanelModel.genesData == null || this.commonSidePanelModel.genesData.length == 0) {
      console.log('=== wait loop in drawCopynumbers');
      window.setTimeout(() => {
        self.drawCopynumbers();
      }, 200);
      return;
    }
    console.log('=== Got past loop in drawCopynumbers');

    // We probably don't need to ever get patients here,
    // as we probably already loaded them. Test this for a while
    // and remove if not needed. MJ TBD
    let promiseNeededToGetPatients:Promise<any> = null;
    if(this.commonSidePanelModel.patientData == null) {
      promiseNeededToGetPatients = this.wutil.getPatients([], this.commonSidePanelModel.graphConfig.database, 'patient');
    }
    Promise.all([
      promiseNeededToGetPatients
    ]).then(getPatientsResults => {
      // const allPatients = getPatientsResults[0];

      const xScaleForCopynumbers = d3.scaleLinear()
      .domain([0, self.totalWidthWithSpacing]) 
      .range([self.copynumberSvgMargin.left, this.commonSidePanelModel.width - self.copynumberSvgMargin.right]);
  
      const yScaleForCopynumber = d3.scaleLinear()
      .domain([0, 100]).nice()
      .range([self.copynumberSvgHeight - self.copynumberSvgMargin.bottom, self.copynumberSvgMargin.top]);


      const addChrRect = (item, index) =>{
        // item.chr and item.size
        svg.append("rect")
          .attr("x", xScaleForCopynumbers(self.chrStartingPositions[index]))
          .attr("y", yScaleForCopynumber(100)) // was straight 0
          .attr("width", xScaleForCopynumbers(item.size )-self.copynumberSvgMargin.left) 
          .attr("height", yScaleForCopynumber(0))
          .attr("stroke", "darkgrey")
          .attr("fill", "none")
          .attr("stroke-width", false ? self.selectedCurveWidth : self.unSelectedCurveWidth)
          svg.append("text")
          .attr("text-anchor",   "middle")
          .attr("font-size",   "9px")
          .attr("x", () => {
              let xStart = xScaleForCopynumbers(self.chrStartingPositions[index]) ;
              let xWidth = xScaleForCopynumbers(item.size )-self.copynumberSvgMargin.left;
              return xStart + (xWidth / 2);
            })
            .attr("y", yScaleForCopynumber(0)+10)
            .text( (index < 10 || ['12','14','16','18','20','22','X','Y'].includes(item.chr)) ? item.chr : "");
      };

      const addChrLine = (item, index) =>{
        // item.chr and item.size
        svg.append("line")
          .attr("x1", xScaleForCopynumbers(self.chrStartingPositions[index]))
          .attr("y1", yScaleForCopynumber(50)) // was 50
          .attr("x2", xScaleForCopynumbers(item.size + self.chrStartingPositions[index] ))  
          .attr("y2", yScaleForCopynumber(50)) // was 50
          .attr("stroke", "lightgrey")
          .attr("stroke-width", 1.0)
          ;
      };
              
      // Append 'svg'
      // let el = self.copynumberSvgContainer.nativeElement;
      let el = document.querySelector('#svgContainer_Copy_Number');

      const existingSvg = d3
        .select(el)
        .select('svg');
  
      let   svg:any = {}; // will be an SVG element
      if (existingSvg["_groups"][0] == "") {  // svg does not exist yet
        console.log('create svg');
        svg  = d3
          .select(el)
          .append('svg')
          .attr('width', this.commonSidePanelModel.width)
          //.attr('height', self.copynumberSvgHeight);

      } else {
        svg = d3.select(el.getElementsByTagName('svg')[0]);
      }

      // first remove contents
      svg.selectAll("*").remove();
    
      let hidingRect = svg.append("rect")
        .attr("width", "100%")
        //.attr("height", "5%")
        .attr("fill", "white")
        .attr("id", "hidingRect"  )
        .on("Click", function(){
          console.log('hide');
          d3.select('#hidingRect').style("opacity", 0);
        });
      
      for(let i=0; i< self.chrMetaData.length; i++) {
        addChrRect(self.chrMetaData[i], i);
      }

      for(let i=0; i< self.chrMetaData.length; i++) {
        addChrLine(self.chrMetaData[i], i);
      }

      // === Draw Gains
      // Let's draw lines at each pixel, based on percent of samples
      // (in selection (TBD)) above threshold. Stored in sidGainPixelLists.
      let pixelPercents = self.computePixelPercents(self.sidGainPixelLists);
      // Turn those percents into 0-50-100 values. Basically,
      // map 0-100 to 50-100, to represent % of samples with gains.
      pixelPercents.map(function(pp){
        let pixel:number = pp[0];
        let mappedPercent:number = 50 + (pp[1] / 2.0);
        svg.append("line")
        .attr("x1", pixel)
        .attr("y1", yScaleForCopynumber(50.01))
        .attr("x2", pixel)  
        .attr("y2", yScaleForCopynumber(mappedPercent))
        .attr("stroke", "red")
        .attr("stroke-width", 1.0)
        ;
      });

      // === Draw Losses, using sidLossPixelLists.
      pixelPercents = self.computePixelPercents(self.sidLossPixelLists);
      // Turn those percents into 0-50-100 values. Basically,
      // map 0-100 to 50-100, to represent % of samples with gains.
      pixelPercents.map(function(pp){
        let pixel:number = pp[0];
        let mappedPercent:number = 50 - (pp[1] / 2.0);
        svg.append("line")
        .attr("x1", pixel)
        .attr("y1", yScaleForCopynumber(49.99))
        .attr("x2", pixel)  
        .attr("y2", yScaleForCopynumber(mappedPercent))
        .attr("stroke", "blue")
        .attr("stroke-width", 1.0)
        ;
      });

    });    
 
  }

  // Pass in either self.sidGainPixelLists or self.sidLossPixelLists.
  private computePixelPercents(sidPixelLists:any){
    console.warn('check self in computePixelPercents');
    
    let self = this;
    // return like this: [[28,55], [72,40], [73,38], [114,89], [113,88], [74,20]];
    // Use sidPixelLists, a dict where ['sampleID0001']->[34,39,122] is list of pixels 
    // with >threshold gain on that pixel. 

    // First, generate a sample list. We assume everyone is selected right now.
    let sampleIds = Object.keys(self.commonSidePanelModel.sampleMap);
    if(self.commonSidePanelModel.selectionIds.length > 0) {
      console.warn('TBD: Need to support multiple-samples per patient in Copynumber widget.');
      // This converts list of selected patientIds to selected sampleIds. But we should be keepping list of selected sample IDs anyway.
      sampleIds = this.commonSidePanelModel.selectionIds.map(pid => this.commonSidePanelModel.patientMap[pid]);
    }
    let countsPerPixel:any = {};
    sampleIds.map(function(sid) {
      let pixelList = sidPixelLists[sid];
      if(pixelList) { // Were any genes above threshold for this sample?
        pixelList.map(function(pixel){
          countsPerPixel[pixel] = countsPerPixel[pixel] || 0;
          countsPerPixel[pixel] = countsPerPixel[pixel] + 1;
        });
      }
    });
    // now convert counts per pixel to percentage of sample list.
    let pixelPercents = [];
    let theCppKeys = Object.keys(countsPerPixel);
    theCppKeys.map(function(key) {
      let count = countsPerPixel[key];
      let percent = 100*(count / (sampleIds.length + 0.0000001));
      pixelPercents.push([parseInt(key), percent]);
    });
    return pixelPercents;
  }

  async loadCNAAndFilterIfNeeded(thisCopynumberWidget:CopynumberWidgetComponent, graphConfig: GraphConfig): Promise<any> {
    let self = this;

    let needToRecreateCnaCountsFiltered:boolean = false;
    this.copynumberWidgetReadyToDraw = false;
    if(this.commonSidePanelModel.datasetDescription.hasCopyNumber){
      if(this.commonSidePanelModel.tableNameUsedForCopynumber) { // a gistic-threshold table exists  
        if(this.commonSidePanelModel.cnaData == null) {
          let t;  // time, for stopwatches
          let dt; // difftime

          let tableNameMaybeSpacesRemoved = this.commonSidePanelModel.tableNameUsedForCopynumber;
          needToRecreateCnaCountsFiltered = true;
          let header:HTMLElement = document.getElementById("copynumberContainerHeader");
          let oldHtml = header.innerHTML;
          header.innerHTML = oldHtml + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>LOADING DATA...</i>";
          try {
            console.log('Clearing copynumber SVG.');
            this.clearSvg();
          } catch (e) {
            console.error(e);
          }

          // Get CNA data from new cache table (STTR-211), or from cna table and then cache it.
          let cnaData:Array<any>;
          let miscCnaDataCacheName='cnaDataCache';
          t = Date.now();
          let someResults = await this.commonSidePanelModel.dataService.getMiscMeta(graphConfig.database, miscCnaDataCacheName);
          dt = Date.now() - t;
          console.log(`TEMPNOTE: someResults null? ${someResults == null}. Time for getMiscMeta was ${dt} ms.`);
          if(someResults) {
            cnaData = someResults.data;
          } else {
            t = Date.now();
            let cna = await this.commonSidePanelModel.dataService.getTable(graphConfig.database, tableNameMaybeSpacesRemoved);
            dt = Date.now()-t;
            console.log(`MJ time for getTable = ${dt}.`);
            if(cna == 0) {
              // Could not find expected gistic threshold table, but it might be due to whitespace (Oncoscape's TCGA sets do this sometimes)
              if(tableNameMaybeSpacesRemoved.includes(' ')) {
                // Trying table load again without spaces.
                tableNameMaybeSpacesRemoved = tableNameMaybeSpacesRemoved.replace(/ /g, '');
                let t = Date.now();
                cna = await this.commonSidePanelModel.dataService.getTable(graphConfig.database, tableNameMaybeSpacesRemoved);
                let dt = Date.now()-t;
                console.log(`MJ time for spaceless getTable = ${dt}.`);
                if(cna == 0) {
                  console.error(`Even ignoring spaces, could not find expected gistic threshold table [${tableNameMaybeSpacesRemoved}]`);
                }
              }
            }
            t = Date.now();
            cnaData = await cna.toArray();
            dt = Date.now()-t;
            console.log(`TEMPNOTE: time for cna.ToArray = ${dt}.`);
            let setResults = await this.commonSidePanelModel.dataService.setMiscMeta(graphConfig.database, miscCnaDataCacheName, cnaData);
            console.log(`TEMPNOTE: wrote cnaData to misc table.`);
          }
          console.log('TEMPNOTE: Beyond loading CNA.');

          if(cnaData == null) {
            alert('CNA table not found.');
            return;
          } else {
            t = Date.now();
            let cnaMap = await this.commonSidePanelModel.dataService.getTable(graphConfig.database, tableNameMaybeSpacesRemoved+'Map');
            if(cnaMap == 0) {
              if(tableNameMaybeSpacesRemoved.includes(' ')) {
                // Trying table load again without spaces.
                tableNameMaybeSpacesRemoved = tableNameMaybeSpacesRemoved.replace(/ /g, '');
                cnaMap = await this.commonSidePanelModel.dataService.getTable(graphConfig.database, tableNameMaybeSpacesRemoved+'Map');
              }
            } 
            let cnaMapData = await cnaMap.toArray();
            dt = Date.now()-t;
            console.log(`MJ time for cnaMap and cnaMap.ToArray = ${dt}.`);

            t = Date.now();
            let sampleIdsInOrder:Array<string> = cnaMapData.sort((a, b) => a.i - b.i);
            dt = Date.now()-t;
            console.log(`MJ time for cnaMap and cnaMapData.sort = ${dt}.`);

            this.commonSidePanelModel.cnaSampleMapData = sampleIdsInOrder;  // if you take this.cnaMapData[35], it's same sample as in column 35 of this.cnaData.d.
            this.commonSidePanelModel.cnaData = cnaData;
            this.commonSidePanelModel.lastCopynumberProcessedDatabase = graphConfig.database;

            // build OncoData.instance.cnaRecords, of form {m, s, t}
            let cnaRecords:Array<{m:string, s:string, t:string}> = [];
            let loopCheck:number = -1;
            let markerCheck:string = 'no_gene';
            try {
              cnaData.map( gene => {
                let m = gene.m;
                markerCheck = m;
                gene.d.map((cnaVal, i) => {
                  loopCheck = i;
                  if (cnaVal != 0) {
                    let sid = this.commonSidePanelModel.cnaSampleMapData[i].s;
                    let cnaType;
                    switch(cnaVal) {
                      case 2:
                        cnaType = 'Amp';
                        break;
                      case 1:
                        cnaType = 'Gain';
                        break;
                      case -1:
                        cnaType = 'Loss';
                        break;
                      case -2:
                        cnaType = 'Deletion';
                        break;
                      }
                    let variant = {m: m, s: sid, t: cnaType};
                    cnaRecords.push(variant);
                  }
                });
              });
            } catch (err) {
              console.error(`cnaData map error. i=${loopCheck}. m=${markerCheck}.`);
            }
            OncoData.instance.cnaRecords = cnaRecords;
            this.commonSidePanelModel.notifyGraphsOfVariantChanges('cnaRecords');
            
          }
          header.innerHTML = oldHtml;
        }

        // Filter by markers, if first time or they have changed.
        let newMarkersAsString:string = graphConfig.markerFilter.join(" ");
        if(  this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString == null || 
          this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString != newMarkersAsString) {
          needToRecreateCnaCountsFiltered = true;

          if(newMarkersAsString == ''){
            // all genes
            this.cnaFilteredGenes = this.commonSidePanelModel.genesData;
          } else{
            this.cnaFilteredGenes = _.intersectionWith(this.commonSidePanelModel.genesData, graphConfig.markerFilter, function(geneDetails, geneNameInGeneSet){
              return geneDetails[0] === geneNameInGeneSet;
            });
          }
          this.findPixelsForEachFilteredGene();

          this.commonSidePanelModel.lastCopynumberProcessedMarkerFilterAsString = newMarkersAsString;
        } else {
          // console.dir('Did not need to filter by markers in loadCNAAndFilterIfNeeded.');
        }

        // Filter by cohort - TBD
        console.log('TBD: Filter by cohort in loadCNAAndFilterIfNeeded.');
        // be sure to set needToRecreateCnaCountsFiltered true.

        if(needToRecreateCnaCountsFiltered) {
          //Now figure out pixel location of each filtered gene.
          let gainThreshold = 1.0;
          let lossThreshold = -1.0;
          let sidGainPixelLists = {}; // key is sid, then posPixels=[123,456,etc] for genes we are above threshold on.
          let sidLossPixelLists = {}; 
          let startTime = Date.now();
          self.cnaFilteredGenes.map(function(filteredGene){
            let geneName = filteredGene[0];
            let genePixel:number = self.cnaPixelatedGeneDict[geneName].pixel;
            if (genePixel) {
              let geneRow = self.commonSidePanelModel.cnaData.find(v => v.m == geneName);
              if (geneRow != null) {

                // === Find gains ===
                let sidIndexesGainsAboveThreshold:Array<number> = 
                  geneRow.d.map((e,i) => e >= gainThreshold ? i : undefined).filter(x => x) ;
                sidIndexesGainsAboveThreshold.map(function(sampleIndex){
                  // Add a pixel record to each sample that met the threshold.
                  let sampleName = self.commonSidePanelModel.cnaSampleMapData[sampleIndex].s;
                  sidGainPixelLists[sampleName] = sidGainPixelLists[sampleName] || [];
                  if (sidGainPixelLists[sampleName].includes(genePixel) == false){
                    sidGainPixelLists[sampleName].push(genePixel);
                  }
                });

                // === Find losses ===
                let sidIndexesLossesBelowThreshold:Array<number> = 
                  geneRow.d.map((e,i) => e <= lossThreshold ? i : undefined).filter(x => x) ;
                sidIndexesLossesBelowThreshold.map(function(sampleIndex){
                  let sampleName = self.commonSidePanelModel.cnaSampleMapData[sampleIndex].s;
                  sidLossPixelLists[sampleName] = sidLossPixelLists[sampleName] || [];
                  if (sidLossPixelLists[sampleName].includes(genePixel) == false){
                    sidLossPixelLists[sampleName].push(genePixel);
                  }
                });

              } else {
                console.error(`No row in cnaData found for gene [${geneName}].`)
              }
            }
          });
          console.log(`Time for loadCNAAndFilterIfNeeded was ${Date.now() - startTime}.`);
          self.sidGainPixelLists = sidGainPixelLists;
          self.sidLossPixelLists = sidLossPixelLists;
        }

        this.copynumberWidgetReadyToDraw = true;
      }
    }
  }

  public processConfigChange(config:any): void {
    super.processConfigChange(config);
    this.copynumberWidgetReadyToDraw = false;
  }


  ngAfterViewInit(): void {}

  ngOnDestroy() {}

}