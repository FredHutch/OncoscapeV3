import { DatasetService } from './../../service/dataset.service';
import { DataService } from 'app/service/data.service';
import { VisualizationEnum } from 'app/model/enum.model';

import { GraphConfig } from 'app/model/graph-config.model';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { PanelEnum } from 'app/model/enum.model';
import * as downloadjs from 'downloadjs';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { CbioService } from 'app/service/datasource/cbio.service';
import { ChartComponent } from '../workspace/chart/chart.component';
import { AbstractVisualization } from './../visualization/visualization.abstract.component';
import { AbstractScatterVisualization } from '../visualization/visualization.abstract.scatter.component';
import { CommonSidePanelComponent } from '../workspace/common-side-panel/common-side-panel.component';

declare var $: any;

@Component({
  selector: 'app-application-bar',
  templateUrl: './application-bar.component.html',
  styleUrls: ['./application-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationBarComponent implements OnInit, OnDestroy {
  // TODO:  COME BACK AND CLEAN OUT
  @Output()
  togglePanelsChange = new EventEmitter<boolean>();
  @Output()
  splitScreenChange = new EventEmitter<boolean>();
  @Output()
  showPanel = new EventEmitter<PanelEnum>();
  public datasetSelected = false;
  public _config: GraphConfig;
  @Input()
  set config(config: GraphConfig) {
    this.datasetSelected = config !== null;
    this._config = config;
    this.cd.detectChanges();
  }

  // @Output() graphPanelToggle = new EventEmitter<GraphPanelEnum>();
  @Output()
  genesetPanelToggle = new EventEmitter();
  @Output()
  dataPanelToggle = new EventEmitter();
  @Output()
  pathwayPanelToggle = new EventEmitter();
  @Output()
  preprocessingPanelToggle = new EventEmitter();
  @Output()
  private togglePanels = false;
  private split = false;
  public uploader: FileUploader = new FileUploader({ url: '' });

  // @HostListener('document:keydown.shift', ['$event'])
  // keyEventDown(event: KeyboardEvent) {
  //   if (event.keyCode === 16) {
  //     this.togglePanels = true;
  //     $('.graphPanel').css('max-width', '0px');
  //   }
  // }
  // @HostListener('document:keyup.shift', ['$event'])
  // keyEventUp(event: KeyboardEvent) {
  //   if (event.keyCode === 16) {
  //     this.togglePanels = true;
  //     $('.graphPanel').css('max-width', 'inherit');
  //   }
  // }
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.shiftKey) {
      return;
    }
    switch (event.key.toLowerCase()) {
      // case 'a': this.graphPanelToggle.emit(1); break;
      // case 'b': this.graphPanelToggle.emit(2); break;
      case 'g':
        this.genesetPanelToggle.emit();
        break;
      case 'd':
        this.dataPanelToggle.emit();
        break;
      case 'p':
        this.pathwayPanelToggle.emit();
        break;
      case 'e':
        this.viewPanel(PanelEnum.COHORT);
        break;
      case 't':
        this.onTogglePanels();
        break;
      case 'p':
        this.exportImageAsJpg();
        break;
      case 'i':
        this.toggleBackgroundColor();
        break;
      case 'm':
          this.viewPanel(PanelEnum.DATA);
          break;
      case 'd':
        this.viewPanel(PanelEnum.DASHBOARD);
        break;
      case 's':
        this.viewPanel(PanelEnum.CITATION);
        break;
      case 'f':
        this.viewPanel(PanelEnum.FEEDBACK);
        break;
      case 'z':
        this.viewPanel(PanelEnum.PREPROCESSING);
        break;
    }
  }

  takeTour(){
    if(CommonSidePanelComponent.instance != null ){
    CommonSidePanelComponent.instance.startTour();
    } else {
      alert("To take a tour, first choose a data set.")
    }
  }

  undoFromMenu(): void {
    console.log('undoFromMenu called');
    try {
      let g = ChartScene.instance.views[0].chart as AbstractVisualization;
      if(g as AbstractScatterVisualization){
        let s = (g as AbstractScatterVisualization).selectionController;
        if(s){
          s.scatterHistory.undo();
        }
      }
    } catch(err) {

    }
  }

  redoFromMenu(): void {
    console.log('redoFromMenu called');
    try {
      let g = ChartScene.instance.views[0].chart as AbstractVisualization;
      if(g as AbstractScatterVisualization){
        let s = (g as AbstractScatterVisualization).selectionController;
        if(s){
          s.scatterHistory.redo();
        }
      }
    } catch(err) {

    }
  }

  undoExists(): boolean {
    console.log('tbd undoexists called');
    return true;
  }
  redoExists(): boolean {
    console.log('tbd redoexists called');
    return true;
  }


  onViewCohort(): void {
    this.viewPanel(PanelEnum.COHORT);
  }
  onViewGeneset(): void {
    this.viewPanel(PanelEnum.GENESET);
  }
  onViewPreprocessing(): void {
    this.viewPanel(PanelEnum.PREPROCESSING);
  }

  reload(): void {
    window.location.reload(true);
  }
  viewPanel(panel: PanelEnum): void {
    console.log(`MJ viewPanel called with [${JSON.stringify(panel)}]`);
    this.showPanel.emit(panel);
  }
  onTogglePanels(): void {
    this.togglePanels = !this.togglePanels;
    $('.graphPanel').css('max-width', this.togglePanels ? '0px' : 'inherit');
  }
  onSplitScreenChange(): void {
    if(ChartScene.instance.views[0].config.visualization == VisualizationEnum.TIMELINES){
      alert("Timeline view can only be seen by itself, not within a split screen.")
    } else {
      this.split = !this.split;
      this.splitScreenChange.next(this.split);
    }
  }
  toggleBackgroundColor(): void {
    const isBlack = ChartScene.instance.renderer.getClearColor().r === 0;
    ChartScene.instance.renderer.setClearColor(isBlack ? 0xffffff : 0x000000, 1);
    ChartScene.instance.render();
  }

  deleteAllCaches(): void {
    this.dataService.deleteAllDataSets().then(v => {
      window.location.reload(true);
    });
  }

  changeFile(evt: any) {
    // this.fileOpen.next(evt.target);
  }
  print() {
    // window.print();
  }

  initGui() {
    ChartScene.instance.initGlobalGuiControls();
  }

  exportJpg() {
    const jpg = $('canvas')[0].toDataURL('image/jpeg', 1);
    downloadjs(jpg, 'export.jpg', 'image/jpeg');
  }
  exportImageAsJpg() {
    this.exportJpg();
    alert('The image file "export.jpg" has been downloaded.');
  }

  exportSvg() {
    //const svg = $('canvas')[0].toDataURL('image/jpeg', 1);
    let svg;
    let svgTimelineMain:SVGGraphicsElement = (document.getElementById("rightSvgTimeline") as unknown) as SVGGraphicsElement;
    if(svgTimelineMain){
      console.warn('svgTimelineMain.getBBox...');
      var myPathBox = svgTimelineMain.getBBox();
      console.log(myPathBox);

      let xAxisSvg:SVGGraphicsElement = (document.getElementById("xAxisSvg") as unknown) as SVGGraphicsElement;
      let axisYOffset = xAxisSvg.getBBox().height;
      svg = `<svg>
      <g id="xAxisSvgGroup" transform="translate(0, ${myPathBox.y - axisYOffset})">
      ${xAxisSvg.innerHTML}
      </g>
      ${svgTimelineMain.innerHTML.replace(/idDataForSvg=/g, 'id=')}
      </svg>`;

    } else {
      svg = ChartScene.instance.renderToSvg($('canvas')[0]);
    }


    downloadjs(svg, 'export.svg', 'image/svg');
  }
  exportImageAsSvg() {
    try {
      this.exportSvg();
      alert('The SVG image file has been downloaded.\n\nWARNING: *** There may be scaling issues! This feature is experimental. ***');
    } catch (err) {
      console.error('ERROR trying to export as SVG.')
      console.dir(err);
      alert('Sorry, export as SVG is not supported yet for this visualization.');
    }
  }

  ngOnInit() {}

  ngOnDestroy() {}
  constructor(public cd: ChangeDetectorRef, protected dataService: DatasetService, protected cbio: CbioService) {}
}
