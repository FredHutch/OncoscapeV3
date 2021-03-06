import { CollectionTypeEnum } from 'app/model/enum.model';
import { ChartSelection } from './../../../model/chart-selection.model';
import { SelectionToolConfig } from 'app/model/selection-config.model';
import { ScatterConfigModel } from './../../visualization/scatter/scatter.model';
import { UmapConfigModel } from './../../visualization/umap/umap.model';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
// tslint:disable-next-line:max-line-length
import { LinearDiscriminantAnalysisConfigModel } from 'app/component/visualization/lineardiscriminantanalysis/lineardiscriminantanalysis.model';
import { PathwaysConfigModel } from 'app/component/visualization/pathways/pathways.model';
import { TimelinesConfigModel } from 'app/component/visualization/timelines/timelines.model';
import { DataField } from 'app/model/data-field.model';
import { DirtyEnum, GraphEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphData } from 'app/model/graph-data.model';
import { DataService } from 'app/service/data.service';
import { WorkspaceConfigModel } from '../../../model/workspace.model';
import { HistogramConfigModel } from '../../visualization/histogram/histogram.model';
import { DataTable } from './../../../model/data-field.model';
import { DataDecorator, DataDecoratorTypeEnum, DataDecoratorValue,
  LegendFilter } from './../../../model/data-map.model';
import { EntityTypeEnum, PanelEnum, WorkspaceLayoutEnum } from './../../../model/enum.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { ModalService } from './../../../service/modal-service';
import { BoxWhiskersConfigModel } from './../../visualization/boxwhiskers/boxwhiskers.model';
import { ChromosomeConfigModel } from './../../visualization/chromosome/chromosome.model';
import { DaConfigModel } from './../../visualization/da/da.model';
import { DeConfigModel } from './../../visualization/de/de.model';
import { DendogramConfigModel } from './../../visualization/dendogram/dendogram.model';
import { DictionaryLearningConfigModel } from './../../visualization/dictionarylearning/dictionarylearning.model';
import { EdgeConfigModel } from './../../visualization/edges/edges.model';
import { FaConfigModel } from './../../visualization/fa/fa.model';
import { FastIcaConfigModel } from './../../visualization/fastica/fastica.model';
import { GenomeConfigModel } from './../../visualization/genome/genome.model';
import { HazardConfigModel } from './../../visualization/hazard/hazard.model';
import { HeatmapConfigModel } from './../../visualization/heatmap/heatmap.model';
import { HicConfigModel } from './../../visualization/hic/hic.model';
import { IsoMapConfigModel } from './../../visualization/isomap/isomap.model';
import { LdaConfigModel } from './../../visualization/lda/lda.model';
import { LinkedGeneConfigModel } from './../../visualization/linkedgenes/linkedgenes.model';
import { LocalLinearEmbeddingConfigModel } from './../../visualization/locallinearembedding/locallinearembedding.model';
import { MdsConfigModel } from './../../visualization/mds/mds.model';
import { SavedPointsConfigModel } from './../../visualization/savedpoints/savedpoints.model';
// tslint:disable-next-line:max-line-length
import { MiniBatchDictionaryLearningConfigModel } from './../../visualization/minibatchdictionarylearning/minibatchdictionarylearning.model';
import { MiniBatchSparsePcaConfigModel } from './../../visualization/minibatchsparsepca/minibatchsparsepca.model';
import { NmfConfigModel } from './../../visualization/nmf/nmf.model';
import { ParallelCoordsConfigModel } from './../../visualization/parallelcoords/parallelcoords.model';
import { PcaConfigModel } from './../../visualization/pca/pca.model';
import { PcaIncrementalConfigModel } from './../../visualization/pcaincremental/pcaincremental.model';
import { PcaKernalConfigModel } from './../../visualization/pcakernal/pcakernal.model';
import { PcaSparseConfigModel } from './../../visualization/pcasparse/pcasparse.model';
import { PlsConfigModel } from './../../visualization/pls/pls.model';
// tslint:disable-next-line:max-line-length
import { QuadradicDiscriminantAnalysisConfigModel } from './../../visualization/quadradicdiscriminantanalysis/quadradicdiscriminantanalysis.model';
import { SomConfigModel } from './../../visualization/som/som.model';
import { SpectralEmbeddingConfigModel } from './../../visualization/spectralembedding/spectralembedding.model';
import { SurvivalConfigModel } from './../../visualization/survival/survival.model';
import { TruncatedSvdConfigModel } from './../../visualization/truncatedsvd/truncatedsvd.model';
import { TsneConfigModel } from './../../visualization/tsne/tsne.model';
import { PlsSvdConfigModel } from './../../visualization/pls-svd/pls-svd.model';
import { PlsRegressionConfigModel } from './../../visualization/plsregression/plsregression.model';
import { PlsCanonicalConfigModel } from './../../visualization/plscanonical/plscanonical.model';
import { CCAConfigModel } from './../../visualization/cca/cca.model';
import { LinearSVCConfigModel } from './../../visualization/linearsvc/linearsvc.model';
import { LinearSVRConfigModel } from './../../visualization/linearsvr/linearsvr.model';
import { NuSVRConfigModel } from './../../visualization/nusvr/nusvr.model';
import { SVRConfigModel } from './../../visualization/svr/svr.model';
import { NuSVCConfigModel } from './../../visualization/nusvc/nusvc.model';
import { OneClassSVMConfigModel } from './../../visualization/oneclasssvm/oneclasssvm.model';
import { MatTabChangeEvent } from '@angular/material';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { Preprocessing } from 'app/model/preprocessing.model';
import { ProteinConfigModel } from 'app/component/visualization/protein/protein.model';
import { ChartScene } from '../chart/chart.scene';
import { OncoData } from 'app/oncoData';

declare var $: any;

@Component({
  selector: 'app-workspace-graph-panel',
  templateUrl: './graph-panel.component.html',
  styleUrls: ['./graph-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class GraphPanelComponent implements AfterViewInit, OnDestroy {
  // @ViewChild('panel')
  // buttons: ElementRef;
  // @ViewChild('panelButton')
  // panelButton: ElementRef;

  @Input()
  datasetDescription: DatasetDescription;
  @Input()
  title: string;
  @Input()
  cid: string;
  @Input()
  tables: Array<DataTable>;
  @Input()
  fields: Array<DataField>;
  @Input()
  events: Array<{ type: string; subtype: string }>;
  @Input()
  molecularData: Array<string>;
  @Input()
  entityType: EntityTypeEnum;
  @Output()
  hide: EventEmitter<any> = new EventEmitter();
  @Output()
  help: EventEmitter<GraphConfig> = new EventEmitter();
  @Output()
  showPanel: EventEmitter<PanelEnum> = new EventEmitter();
  @Output()
  colorCluster: EventEmitter<GraphConfig> = new EventEmitter();
  @Output()
  configChange: EventEmitter<GraphConfig> = new EventEmitter();
  // @Output()
  // selectClusteringAlgorithm: EventEmitter<GraphConfig> = new EventEmitter();
  @Output()
  selectGeneSignature: EventEmitter<GraphConfig> = new EventEmitter();
  @Output()
  selectGeneset: EventEmitter<any> = new EventEmitter();
  @Output()
  selectCohort: EventEmitter<any> = new EventEmitter();
  @Output()
  saveSelection: EventEmitter<{
    name: string;
    selection: ChartSelection;
  }> = new EventEmitter();
  // @Output()
  // selectionToolChange: EventEmitter<{
  //   config: GraphConfig;
  //   selectionTool: SelectionToolConfig;
  // }> = new EventEmitter();
  @Output()
  threeDOption: EventEmitter<{
    config: GraphConfig;
    option: string;
    value: any;
  }> = new EventEmitter();
  
  @Output()
  decoratorAdd: EventEmitter<{
    config: GraphConfig;
    decorator: DataDecorator;
  }> = new EventEmitter();
  @Output()
  decoratorDel: EventEmitter<{
    config: GraphConfig;
    decorator: DataDecorator;
  }> = new EventEmitter();
  @Output()
  decoratorDelAll: EventEmitter<{ config: GraphConfig }> = new EventEmitter();
  @Output()

  @Output()
  legendFilterAdd: EventEmitter<{
    config: GraphConfig;
    legendFilter: LegendFilter;
  }> = new EventEmitter();
  legendFilterDel: EventEmitter<{
    config: GraphConfig;
    legendFilter: LegendFilter;
  }> = new EventEmitter();
  @Output()
  legendFilterDelAll: EventEmitter<{ config: GraphConfig }> = new EventEmitter();

  @Output()
  workspaceConfigChange: EventEmitter<{
    config: WorkspaceConfigModel;
  }> = new EventEmitter();
  @Output()
  edgeConfigChange: EventEmitter<{
    config: EdgeConfigModel;
  }> = new EventEmitter();

  methodName = '';
  methodSummary = '';
  workspaceLayoutOptions = [WorkspaceLayoutEnum.HORIZONTAL, WorkspaceLayoutEnum.VERTICAL, WorkspaceLayoutEnum.OVERLAY];
  workspaceEdgeOptions: Array<DataField> = [];
  get getGraphId() {
    return this.config.graph;
  }

  get decoratorsWithLegends(): Array<DataDecorator> {
    const edges = this.edgeDecorators.filter(v => v.legend);
    edges.forEach(v => {
      if (v.legend.name.indexOf('Edge //') === -1) {
        v.legend.name = 'Edge // ' + v.legend.name;
      }
    });
    return edges.concat(this.decorators.filter(v => v.legend));
  }
  @Input()
  selectionToolConfig: SelectionToolConfig;
  @Input()
  decorators: Array<DataDecorator>;
  @Input()
  edgeDecorators: Array<DataDecorator> = [];
  @Input()
  legendFilters: Array<LegendFilter>;
  @Input()
  data: GraphData;
  @Input()
  genesets: Array<any>;
  @Input()
  cohorts: Array<any>;
  @Input()
  pathways: Array<any>;
  @Input()
  preprocessings: Array<Preprocessing>;

  isCollapsed = true;

  // This is a very important setter + is probably doing to much work.
  // It is comparing the previous config with the proposed config.
  // If the vis changes it updates the help
  // If the entity changes it updates the edges
  // If the matrix changes it reruns the decorators
  private _config: GraphConfig = null;
  get config(): GraphConfig {
    return this._config;
  }
  @Input()
  set config(value: GraphConfig) {
    if (value === null) {
      return;
    }

    // Update Help
    if (this._config === null || this._config.visualization !== value.visualization) {
      console.log('disabled legend emit');
      //this.legendFilterDelAll.emit({ config: this._config });

      this.dataService.getHelpInfo(value).then(v => {
        this.methodName = v.method;
        this.methodSummary = v.summary;
        this.cd.detectChanges();
      });
    }

    // If dataset changed, remove all decorators
    if (this._config !== null) {
      if (this._config.database !== value.database) {
        this.decoratorDelAll.emit({ config: this._config });
        console.log('disabled legend emit');
        // this.legendFilterDelAll.emit({ config: this._config });
      }
    }

    // If entity changed and change involved a gene ... remove all decorators
    if (this._config !== null) {
      if (this._config.entity !== value.entity) {
        if (this._config.entity === EntityTypeEnum.GENE || value.entity === EntityTypeEnum.GENE) {
          this.decoratorDelAll.emit({ config: this._config });
          console.log('disabled legend emit');
          // this.legendFilterDelAll.emit({ config: this._config });
        }
      }
    }

    // Finally Update Config
    this._config = value;


  }

  public panelShow(panel: string): void {
    this.isCollapsed = false;
    this.cd.markForCheck();
  }
  public panelHide(e: MatTabChangeEvent): void {
    if (e.index === 5) {
      this.isCollapsed = true;
      this.cd.markForCheck();
    }
  }
  helpClick(): void {
    this.help.emit(this.config);
  }

  onCohortChange($event: Event) {
    const selected = this.cohorts.find(v => v.n === $event.target['value']);
    this.config.patientFilter = selected.pids;
    this.config.sampleFilter = selected.sids;
    this.config.dirtyFlag = DirtyEnum.LAYOUT;
    this.configChange.emit(this.config);
  }
  onGenesetChange($event: Event) {
    const selected = this.genesets.find(v => v.n === $event.target['value']);
    this.config.markerFilter = selected.g;
    this.config.dirtyFlag = DirtyEnum.LAYOUT;
    this.configChange.emit(this.config);
  }

  onVisualizationChange($event: Event) {
    if ($event instanceof CustomEvent) {
      console.log('disabled legend emit');
      // this.legendFilterDelAll.emit({ config: this._config });
      const el = $event.target as HTMLSelectElement;
      const visualizationEnumValue = parseInt(el.value, 10);
      this.setVisualization(visualizationEnumValue);
    }
  }

  onClearSelection(): void {
    const selectionDecorator = this.decorators.filter(v => v.type === DataDecoratorTypeEnum.SELECT)[0];
    this.decoratorDel.emit({ config: this._config, decorator: selectionDecorator });
  }

  onInvertSelection(): void {
    alert("NYI")
  }
  
  onSaveSelection(e: { graph: GraphConfig; name: string }): void {
    const selectionDecorator = this.decorators.find(v => v.type === DataDecoratorTypeEnum.SELECT);
    if (selectionDecorator === null) {
      alert('Unable to save empty selection');
      return;
    }
    const type = selectionDecorator.values[0].key;
    const key = type === EntityTypeEnum.SAMPLE ? 'sid' : 'mid';
    const ids = selectionDecorator.values.map(v => v[key]);
    const chartSelection: ChartSelection = { type: type, ids: ids };
    this.saveSelection.emit({ name: e.name, selection: chartSelection });
  }


  // onDecoratorAdd(decorator: DataDecorator) {
  //   this.decoratorAdd.emit({ config: this.config, decorator: decorator });
  // }

  // onDecoratorDel(decorator: DataDecorator) {
  //   this.decoratorDel.emit({ config: this.config, decorator: decorator });
  // }

  setVisualization(visualizationEnumValue): void {
    let gc: GraphConfig;
    switch (visualizationEnumValue) {
      case VisualizationEnum.SPREADSHEET:
        this.showPanel.emit(PanelEnum.SPREADSHEET);
        return;
      case VisualizationEnum.DASHBOARD:
        this.showPanel.emit(2048);
        return;
      case VisualizationEnum.TIMELINES:
        gc = new TimelinesConfigModel();
        break;
      case VisualizationEnum.PATHWAYS:
        gc = new PathwaysConfigModel();
        break;
      case VisualizationEnum.PROTEINS:
        gc = new ProteinConfigModel();
        break;
      case VisualizationEnum.CHROMOSOME:
        gc = new ChromosomeConfigModel();
        break;
      case VisualizationEnum.GENOME:
        gc = new GenomeConfigModel();
        break;
      case VisualizationEnum.SURVIVAL:
        gc = new SurvivalConfigModel();
        break;
      case VisualizationEnum.HAZARD:
        gc = new HazardConfigModel();
        break;
      case VisualizationEnum.PCA:
        gc = new PcaConfigModel();
        break;
      case VisualizationEnum.PLS:
        gc = new PlsConfigModel();
        break;
      case VisualizationEnum.TSNE:
        gc = new TsneConfigModel();
        break;
      case VisualizationEnum.UMAP:
        gc = new UmapConfigModel();
        break;
      case VisualizationEnum.SCATTER:
        gc = new ScatterConfigModel();
        break;
      case VisualizationEnum.HEATMAP:
        gc = new HeatmapConfigModel();
        break;
      case VisualizationEnum.DENDOGRAM:
        gc = new DendogramConfigModel();
        break;
      case VisualizationEnum.BOX_WHISKERS:
        gc = new BoxWhiskersConfigModel();
        break;
      case VisualizationEnum.PARALLEL_COORDS:
        gc = new ParallelCoordsConfigModel();
        break;
      case VisualizationEnum.LINKED_GENE:
        gc = new LinkedGeneConfigModel();
        break;
      case VisualizationEnum.HIC:
        gc = new HicConfigModel();
        break;
      case VisualizationEnum.SOM:
        gc = new SomConfigModel();
        break;
      case VisualizationEnum.DA:
        gc = new DaConfigModel();
        break;
      case VisualizationEnum.DE:
        gc = new DeConfigModel();
        break;
      case VisualizationEnum.FA:
        gc = new FaConfigModel();
        break;
      case VisualizationEnum.MDS:
        gc = new MdsConfigModel();
        break;
      case VisualizationEnum.SAVED_POINTS:
        gc = new SavedPointsConfigModel();
        break;
      case VisualizationEnum.MINI_BATCH_SPARSE_PCA:
        gc = new MiniBatchSparsePcaConfigModel();
        break;
      case VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING:
        gc = new MiniBatchDictionaryLearningConfigModel();
        break;
      case VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS:
        gc = new LinearDiscriminantAnalysisConfigModel();
        break;
      case VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS:
        gc = new QuadradicDiscriminantAnalysisConfigModel();
        break;
      case VisualizationEnum.LDA:
        gc = new LdaConfigModel();
        break;
      case VisualizationEnum.NMF:
        gc = new NmfConfigModel();
        break;
      case VisualizationEnum.FAST_ICA:
        gc = new FastIcaConfigModel();
        break;
      case VisualizationEnum.DICTIONARY_LEARNING:
        gc = new DictionaryLearningConfigModel();
        break;
      case VisualizationEnum.TRUNCATED_SVD:
        gc = new TruncatedSvdConfigModel();
        break;
      case VisualizationEnum.ISOMAP:
        gc = new IsoMapConfigModel();
        break;
      case VisualizationEnum.LOCALLY_LINEAR_EMBEDDING:
        gc = new LocalLinearEmbeddingConfigModel();
        break;
      case VisualizationEnum.SPECTRAL_EMBEDDING:
        gc = new SpectralEmbeddingConfigModel();
        break;
      case VisualizationEnum.INCREMENTAL_PCA:
        gc = new PcaIncrementalConfigModel();
        break;
      case VisualizationEnum.KERNAL_PCA:
        gc = new PcaKernalConfigModel();
        break;
      case VisualizationEnum.SPARSE_PCA:
        gc = new PcaSparseConfigModel();
        break;
      case VisualizationEnum.HISTOGRAM:
        gc = new HistogramConfigModel();
        break;
      case VisualizationEnum.PLSSVD:
        gc = new PlsSvdConfigModel();
        break;
      case VisualizationEnum.PLSREGRESSION:
        gc = new PlsRegressionConfigModel();
        break;
      case VisualizationEnum.PLSCANONICAL:
        gc = new PlsCanonicalConfigModel();
        break;
      case VisualizationEnum.CCA:
        gc = new CCAConfigModel();
        break;
      case VisualizationEnum.LINEAR_SVC:
        gc = new LinearSVCConfigModel();
        break;
      case VisualizationEnum.LINEAR_SVR:
        gc = new LinearSVRConfigModel();
        break;
      case VisualizationEnum.NU_SVR:
        gc = new NuSVRConfigModel();
        break;
      case VisualizationEnum.NU_SVC:
        gc = new NuSVCConfigModel();
        break;
      case VisualizationEnum.ONE_CLASS_SVM:
        gc = new OneClassSVMConfigModel();
        break;
      case VisualizationEnum.SVR:
        gc = new SVRConfigModel();
        break;
    }

    gc.graph = this.title === 'Graph A' ? GraphEnum.GRAPH_A : GraphEnum.GRAPH_B;

    // Null out any feedback data from last visualization.
    if(window['computedFeedbackForForm'] == null) {
      window['computedFeedbackForForm'] = {};
    }
    delete window['computedFeedbackForForm'][gc.graph.toString() +'_'+ visualizationEnumValue]
    
    const prevConfig = this.config;

    // MJ see if we have a saved config, in OncoData.instance.lastData_<vizName>.results.config,
    // using the newly created gc's vizName.
    // If so, repopulate gc with it.
    let vizName:string = VisualizationEnum[gc.visualization];
    if (OncoData.instance.lastData[vizName]) {
      console.log(`PRIOR --- MJ viz ${vizName} should get copied.`);
      let lastStoredConfigForNewVis:GraphConfig = OncoData.instance.lastData[vizName].results.config;
      if (lastStoredConfigForNewVis.database == gc.database) {
        gc = GraphConfig.cloneFromAny(lastStoredConfigForNewVis);
        console.log(`MJ viz ${vizName} was copied.`);
      }
    }

    gc.table = prevConfig.table;
    const Forced_CollectionTypeEnum_MOLECULAR:number = 296888;
    const Forced_CollectionTypeEnum_PATIENT:number = 4;
    const Forced_CollectionTypeEnum_EVENT:number = 16384;

    let tablesToCheck = OncoData.instance.dataLoadedAction.tables;
    let molecularTables = tablesToCheck.filter(v => (v.ctype & Forced_CollectionTypeEnum_MOLECULAR) > 0);
    let patientTables = tablesToCheck.filter(v => ((v.ctype & Forced_CollectionTypeEnum_PATIENT) > 0));
    let eventTables = tablesToCheck.filter(v => ((v.ctype & Forced_CollectionTypeEnum_EVENT) > 0));
    // MJ Set table to use. This needs work. TODO TBD
    switch (visualizationEnumValue) {
      case VisualizationEnum.SURVIVAL:
      case VisualizationEnum.HAZARD:
        if (patientTables.length > 0) {
          gc.table = patientTables[0];
        } else {
          console.log(`TEMPNOTE: ERROR - Cannot find patient table for ${visualizationEnumValue}.`);
        }
        break;
      case VisualizationEnum.TIMELINES:
        if (eventTables.length > 0) {
          gc.table = eventTables[0];
        } else {
          console.log(`TEMPNOTE: ERROR - Cannot find event table for ${visualizationEnumValue}.`);
        }
        break;

      case VisualizationEnum.GENOME:
      case VisualizationEnum.PCA:
      case VisualizationEnum.PLS:
      case VisualizationEnum.TSNE:
      case VisualizationEnum.UMAP:
      case VisualizationEnum.SCATTER:
      case VisualizationEnum.DENDOGRAM:
      case VisualizationEnum.BOX_WHISKERS:
      case VisualizationEnum.PARALLEL_COORDS:
      case VisualizationEnum.SOM:
      case VisualizationEnum.DA:
      case VisualizationEnum.DE:
      case VisualizationEnum.FA:
      case VisualizationEnum.MDS:
      case VisualizationEnum.SAVED_POINTS:
      case VisualizationEnum.MINI_BATCH_SPARSE_PCA:
      case VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING:
      case VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS:
      case VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS:
      case VisualizationEnum.LDA:
      case VisualizationEnum.NMF:
      case VisualizationEnum.FAST_ICA:
      case VisualizationEnum.DICTIONARY_LEARNING:
      case VisualizationEnum.TRUNCATED_SVD:
      case VisualizationEnum.ISOMAP:
      case VisualizationEnum.LOCALLY_LINEAR_EMBEDDING:
      case VisualizationEnum.SPECTRAL_EMBEDDING:
      case VisualizationEnum.KERNAL_PCA:
      case VisualizationEnum.SPARSE_PCA:
      case VisualizationEnum.PLSSVD:
      case VisualizationEnum.PLSREGRESSION:
      case VisualizationEnum.PLSCANONICAL:
      case VisualizationEnum.CCA:
      case VisualizationEnum.LINEAR_SVC:
      case VisualizationEnum.LINEAR_SVR:
      case VisualizationEnum.NU_SVR:
      case VisualizationEnum.NU_SVC:
      case VisualizationEnum.ONE_CLASS_SVM:
      case VisualizationEnum.SVR:
        if (molecularTables.length > 0) {
          gc.table = molecularTables[0];
        } else {
          console.log(`TEMPNOTE: ERROR - Cannot find molecular table "0" for ${visualizationEnumValue}.`);
        }
        break;
      case VisualizationEnum.CHROMOSOME:
      case VisualizationEnum.HEATMAP:
      case VisualizationEnum.HIC:
      case VisualizationEnum.HISTOGRAM:
      case VisualizationEnum.PATHWAYS:
      case VisualizationEnum.LINKED_GENE:
      case VisualizationEnum.INCREMENTAL_PCA:
      case VisualizationEnum.PROTEINS:
        if (molecularTables.length > 1) { 
          gc.table = molecularTables[1];
        } else {
          console.warn(`TEMPNOTE: WARN - Cannot find molecular table "1"" for ${visualizationEnumValue}.`);
          if (molecularTables.length > 0) { // TEMPNOTE: This was looking for [1]. Why? TODO 
            gc.table = molecularTables[0];
          } else {
            console.log(`TEMPNOTE: ERROR - Cannot find molecular table "0"" for ${visualizationEnumValue}.`);
          }
        }
        break;
      }
    gc.datasetName = prevConfig.datasetName;
    gc.pathwayUri = prevConfig.pathwayUri;
    gc.pathwayName = prevConfig.pathwayName;
    gc.proteinName = prevConfig.proteinName;
    gc.cohortName = prevConfig.cohortName;
    gc.markerName = prevConfig.markerName;
    gc.sampleFilter = prevConfig.sampleFilter;
    gc.markerFilter = prevConfig.markerFilter;
    gc.patientFilter = prevConfig.patientFilter;
    gc.sampleSelect = prevConfig.sampleSelect;
    gc.markerSelect = prevConfig.markerSelect;
    gc.patientSelect = prevConfig.patientSelect;
    this.configChange.emit(gc);
  }

  graphPanelSetConfig(value: GraphConfig) {
    // MJ TODO: Should we just do cloneFromAny? Or are some fields protected?
    // Likewise, same question for above?
    value.enableCohorts = this._config.enableCohorts;
    value.enableGenesets = this._config.enableGenesets;
    value.enablePathways = this._config.enablePathways;
    value.enableSupplemental = this._config.enableSupplemental;
    value.enableLabel = this._config.enableLabel;
    value.enableColor = this._config.enableColor;
    value.enableShape = this._config.enableShape;
    value.enableSize = this._config.enableSize;
    value.enableMarkerBaseSize = this._config.enableMarkerBaseSize;
    value.enableGenesetOverlay = this._config.enableGenesetOverlay;
    value.firstGenesetOverlay = this._config.firstGenesetOverlay;
    value.secondGenesetOverlay = this._config.secondGenesetOverlay;
    value.pathwayUri = this._config.pathwayUri;
    value.pathwayName = this._config.pathwayName;
    value.proteinName = this._config.proteinName;
    value.cohortName = this._config.cohortName;
    value.markerName = this._config.markerName;
    value.sampleFilter = this._config.sampleFilter;
    value.markerFilter = this._config.markerFilter;
    value.patientFilter = this._config.patientFilter;
    value.sampleSelect = this._config.sampleSelect;
    value.markerSelect = this._config.markerSelect;
    value.patientSelect = this._config.patientSelect;
    value.label = this._config.label;
    value.isScatterVisualization = this._config.isScatterVisualization;
    value.hasAppliedMetafileOverrides = this._config.hasAppliedMetafileOverrides;
    
    this.configChange.emit(value);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  constructor(private ms: ModalService, private cd: ChangeDetectorRef, private dataService: DataService) {
    this.genesets = [];
    this.cohorts = [];

    this.cid = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');
  }
}
