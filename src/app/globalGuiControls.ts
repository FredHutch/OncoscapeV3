import * as dat from   './../../src/dat.gui.min'  
import { ChartScene } from './component/workspace/chart/chart.scene';
import { EdgesGraph } from './component/visualization/edges/edges.graph';
import { GraphEnum, VisualizationEnum, SelectionTypeEnum } from  './../app/model/enum.model';
import { GenomeGraph } from './component/visualization/genome/genome.graph';
import { TimelinesGraph } from './component/visualization/timelines/timelines.graph';
import { SvgTimelinesGraph } from './component/visualization/timelines/svgtimelines.graph';

export class GlobalGuiControls {
  public undoTime:number = 300;
  public spriteOpacity:number = 0.7;
  public edgeOpacity:number = 0.5;
  public edgeUnhoveredOpacity:number = 0.1;
  public edgeDelayBeforeRender:number = 150;
  public edgeAutoOpacity:boolean = true;
  public zOfEdges:number = -1000.0;
  public zOfGenomeGenes:number = 0.0;
  public edgeColor:any = "#5094b3"; //"#81d4fa";
  public edgeHideUnhovered:boolean = true;
  public genomeMouseoverHighlightColor:any = "#3208fa";
  public geneLineDashSize:number = 0.02;
  public geneLineGapSize:number = 0.02;
  public geneLeftRightOfffset:number = 2;
  public timelineCircleBorder:boolean = false;

  private _gui:dat.GUI = null;
  public static instance: GlobalGuiControls;

  public init(){
    let self = this;
    self._gui = new dat.GUI(); // { autoPlace: false } 
    self._gui.domElement.id = 'gui';
    document.getElementById('gui').setAttribute('style', 'position: relative;top: 0px; right: -130px;');

    let edgeFolder = self._gui.addFolder('EDGES');

    self._gui.add(GlobalGuiControls.instance, 'spriteOpacity').onChange(function(newValue){
      self.renderAndTimeIt('spriteOpacity');
    });  

    self._gui.add(GlobalGuiControls.instance, 'undoTime', 0, 1000, 10).onChange(function(newValue){
      // self.renderAndTimeIt('undoTime');
    });  

    edgeFolder.addColor(GlobalGuiControls.instance, 'edgeColor').onChange(function(newValue){
      ChartScene.instance.invalidatePrerender();
      self.renderAndTimeIt('edgeColor');
    });  

    edgeFolder.add(GlobalGuiControls.instance, 'edgeHideUnhovered').onChange(function(newValue){
      ChartScene.instance.invalidatePrerender();
      self.renderAndTimeIt('edgeHideUnhovered');
    });  

    edgeFolder.add(GlobalGuiControls.instance, 'edgeOpacity', 0, 1.0, 0.002).onChange(function(newValue){
      if(ChartScene.instance.views[2]) {
        let edgesGraph = ChartScene.instance.views[2].chart as EdgesGraph;
        // Square the 0.1-1.0 value to get a true, stretched opacity.
        edgesGraph.updateAllOpacity(newValue * newValue);
        self.renderAndTimeIt('edgeOpacity');
      }
    }).listen();  

    self._gui.add(GlobalGuiControls.instance, 'edgeAutoOpacity').onChange(function(newValue){
      // self.renderAndTimeIt('spriteOpacity');
    });  

    edgeFolder.add(GlobalGuiControls.instance, 'edgeUnhoveredOpacity', 0, 1.0, 0.002).onChange(function(newValue){
      if(ChartScene.instance.views[2]) {
        self.renderAndTimeIt('edgeUnhoveredOpacity');
      }
    });  

    edgeFolder.add(GlobalGuiControls.instance, 'edgeDelayBeforeRender', 0, 600, 1).onChange(function(newValue){
      if(ChartScene.instance && ChartScene.instance.views[2]) {
        if(ChartScene.instance.views[2].config.visualization == VisualizationEnum.EDGES) {
          let eg = ChartScene.instance.views[2].chart as EdgesGraph;
          if(eg) {   
            ChartScene.instance.invalidatePrerender();
            eg.setPrerenderDebounce(this.edgeDelayBeforeRender)
            self.renderAndTimeIt('edgeDelayBeforeRender');
          }
        }
      }
    });  

    edgeFolder.add(GlobalGuiControls.instance, 'zOfEdges', -3000, 3000, 10).onChange(function(newValue){
      ChartScene.instance.invalidatePrerender();
      self.renderAndTimeIt('zOfEdges');
    });  
    edgeFolder.open();

    let genomeFolder = self._gui.addFolder('GENOME');

    genomeFolder.add(GlobalGuiControls.instance, 'geneLeftRightOfffset', 0, 6, 0.05).onChange(function(newValue){
      self.renderAndTimeIt('geneLeftRightOfffset');
    });  

    genomeFolder.add(GlobalGuiControls.instance, 'geneLineDashSize', 0, 0.1, 0.001).onChange(function(newValue){
      ChartScene.instance.invalidatePrerender();
      self.renderAndTimeIt('geneLineDashSize');
      if(ChartScene.instance && ChartScene.instance.views[1]) {
        if(ChartScene.instance.views[1].config.visualization == VisualizationEnum.GENOME) {
          let gg = ChartScene.instance.views[1].chart as GenomeGraph;
          if(gg) {   
            gg.recreate();
            self.renderAndTimeIt('genome recreate');
          }
        }
      }
    });  

    genomeFolder.add(GlobalGuiControls.instance, 'geneLineGapSize', 0, 0.1, 0.001).onChange(function(newValue){
      ChartScene.instance.invalidatePrerender();
      self.renderAndTimeIt('geneLineGapSize');
      if(ChartScene.instance && ChartScene.instance.views[1]) {
        if(ChartScene.instance.views[1].config.visualization == VisualizationEnum.GENOME) {
          let gg = ChartScene.instance.views[1].chart as GenomeGraph;
          if(gg) {   
            gg.recreate();
            self.renderAndTimeIt('genome recreate');
          }
        }
      }
    });  

    // genomeFolder.add(GlobalGuiControls.instance, 'zOfGenomeGenes', -3000, 3000, 10).onChange(function(newValue){
    //   ChartScene.instance.invalidatePrerender();
    //   self.renderAndTimeIt('zOfGenomeGenes');
    //   if(ChartScene.instance && ChartScene.instance.views[1]) {
    //     if(ChartScene.instance.views[1].config.visualization == VisualizationEnum.GENOME) {
    //       let gg = ChartScene.instance.views[1].chart as GenomeGraph;
    //       if(gg) {   
    //         gg.recreate();
    //         self.renderAndTimeIt('genome recreate');
    //       }
    //     }
    //   }
    // });  
    // genomeFolder.addColor(GlobalGuiControls.instance, 'genomeMouseoverHighlightColor').onChange(function(newValue){
    //   //ChartScene.instance.invalidatePrerender();
    //   //self.renderAndTimeIt('genomeMouseoverHighlightColor');
    // });  
    genomeFolder.open();

    let timelineFolder = self._gui.addFolder('TIMELINE');

    self._gui.add(GlobalGuiControls.instance, 'timelineCircleBorder').onChange(function(newValue){
      if(ChartScene.instance && ChartScene.instance.views[0]) {
        if(ChartScene.instance.views[0].config.visualization == VisualizationEnum.TIMELINES) {
          let gg;
          if(document.location.href.endsWith('time=old')) {
            gg = ChartScene.instance.views[0].chart as TimelinesGraph;
          //} else {
          //  gg = ChartScene.instance.views[0].chart as SvgTimelinesGraph;
          }
  
          
          if(gg) {   
            gg.recreate();
            self.renderAndTimeIt('timelineCircleBorder recreate');
          }
        }
      }    });  

    timelineFolder.open();
  }

  public renderAndTimeIt(label:string) {
    let startTime = Date.now();
    ChartScene.instance.render();
    let timeDiff = Date.now() - startTime;
    console.log(`renderAndTimeIt [${label}] = ${timeDiff} ms.`);
  }
  constructor() {
    GlobalGuiControls.instance = this;
  }  
}
