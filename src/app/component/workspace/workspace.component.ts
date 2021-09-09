import { DatasetService } from './../../service/dataset.service';
import Dexie from 'dexie';
import { GraphEnum } from 'app/model/enum.model';
import { Preprocessing } from './../../model/preprocessing.model';
import { SelectionToolConfig } from './../../model/selection-config.model';
import { ScatterConfigModel } from './../visualization/scatter/scatter.model';
import { getTipVisible, getTipEnabled } from './../../reducer/index.reducer';
import { DataService } from 'app/service/data.service';
import { SelectSaveSamplesAction, SelectSaveMarkersAction } from './../../action/compute.action';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as compute from 'app/action/compute.action';
import * as data from 'app/action/data.action';
import { PlsSvdConfigModel } from 'app/component/visualization/pls-svd/pls-svd.model';
import { PlsRegressionConfigModel } from 'app/component/visualization/plsregression/plsregression.model';
// tslint:disable-next-line:max-line-length
import { LinearDiscriminantAnalysisConfigModel } from 'app/component/visualization/lineardiscriminantanalysis/lineardiscriminantanalysis.model';
// tslint:disable-next-line:max-line-length
import { MiniBatchDictionaryLearningConfigModel } from 'app/component/visualization/minibatchdictionarylearning/minibatchdictionarylearning.model';
import { MiniBatchSparsePcaConfigModel } from 'app/component/visualization/minibatchsparsepca/minibatchsparsepca.model';
import { PathwaysConfigModel } from 'app/component/visualization/pathways/pathways.model';
// tslint:disable-next-line:max-line-length
import { QuadradicDiscriminantAnalysisConfigModel } from 'app/component/visualization/quadradicdiscriminantanalysis/quadradicdiscriminantanalysis.model';
import { TimelinesConfigModel } from 'app/component/visualization/timelines/timelines.model';
import { DataField } from 'app/model/data-field.model';
import * as enums from 'app/model/enum.model';
import { Legend } from 'app/model/legend.model';
import * as fromRoot from 'app/reducer/index.reducer';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Rx';
import {
  DataAddCohortAction,
  DataAddGenesetAction,
  DataUpdateGenesetAction,
  DataAddPreprocessingAction,
  DataAddPathwayAction,
  DataDelCohortAction,
  DataDelGenesetAction,
  DataDelPreprocessingAction,
  DataDelPathwayAction
} from './../../action/data.action';
import {
  DataDecoratorCreateAction,
  DataDecoratorDelAction,
  DataDecoratorDelAllAction,
  WorkspaceConfigAction,
  SelectionToolChangeAction,
  ThreeDRenderOptionAction
} from './../../action/graph.action';
import { HelpSetConfigAction } from './../../action/help.action';
import { GraphPanelToggleAction, LoaderShowAction, ModalPanelAction } from './../../action/layout.action';
import { ChartSelection } from './../../model/chart-selection.model';
import { Cohort } from './../../model/cohort.model';
import { DataTable } from './../../model/data-field.model';
import { DataDecorator } from './../../model/data-map.model';
import { EntityTypeEnum } from './../../model/enum.model';
import { GeneSet } from './../../model/gene-set.model';
import { GraphConfig } from './../../model/graph-config.model';
import { Pathway } from './../../model/pathway.model';
import { WorkspaceConfigModel } from './../../model/workspace.model';
import { BoxWhiskersConfigModel } from './../visualization/boxwhiskers/boxwhiskers.model';
import { ChromosomeConfigModel } from './../visualization/chromosome/chromosome.model';
import { DendogramConfigModel } from './../visualization/dendogram/dendogram.model';
import { DictionaryLearningConfigModel } from './../visualization/dictionarylearning/dictionarylearning.model';
import { EdgeConfigModel } from './../visualization/edges/edges.model';
import { FaConfigModel } from './../visualization/fa/fa.model';
import { FastIcaConfigModel } from './../visualization/fastica/fastica.model';
import { GenomeConfigModel } from './../visualization/genome/genome.model';
import { HazardConfigModel } from './../visualization/hazard/hazard.model';
import { HeatmapConfigModel } from './../visualization/heatmap/heatmap.model';
import { HicConfigModel } from './../visualization/hic/hic.model';
import { HistogramConfigModel } from './../visualization/histogram/histogram.model';
import { IsoMapConfigModel } from './../visualization/isomap/isomap.model';
import { LdaConfigModel } from './../visualization/lda/lda.model';
import { LinkedGeneConfigModel } from './../visualization/linkedgenes/linkedgenes.model';
import { LocalLinearEmbeddingConfigModel } from './../visualization/locallinearembedding/locallinearembedding.model';
import { MdsConfigModel } from './../visualization/mds/mds.model';
import { SavedPointsConfigModel } from './../visualization/savedpoints/savedpoints.model';
import { NmfConfigModel } from './../visualization/nmf/nmf.model';
import { ParallelCoordsConfigModel } from './../visualization/parallelcoords/parallelcoords.model';
import { PcaConfigModel } from './../visualization/pca/pca.model';
import { PcaIncrementalConfigModel } from './../visualization/pcaincremental/pcaincremental.model';
import { PcaKernalConfigModel } from './../visualization/pcakernal/pcakernal.model';
import { PcaSparseConfigModel } from './../visualization/pcasparse/pcasparse.model';
import { SomConfigModel } from './../visualization/som/som.model';
import { SpectralEmbeddingConfigModel } from './../visualization/spectralembedding/spectralembedding.model';
import { SurvivalConfigModel } from './../visualization/survival/survival.model';
import { TruncatedSvdConfigModel } from './../visualization/truncatedsvd/truncatedsvd.model';
import { TsneConfigModel } from './../visualization/tsne/tsne.model';
import { PlsCanonicalConfigModel } from './../visualization/plscanonical/plscanonical.model';
import { CCAConfigModel } from './../visualization/cca/cca.model';
import { LinearSVCConfigModel } from './../visualization/linearsvc/linearsvc.model';
import { LinearSVRConfigModel } from './../visualization/linearsvr/linearsvr.model';
import { NuSVRConfigModel } from './../visualization/nusvr/nusvr.model';
import { NuSVCConfigModel } from './../visualization/nusvc/nusvc.model';
import { OneClassSVMConfigModel } from './../visualization/oneclasssvm/oneclasssvm.model';
import { SVRConfigModel } from './../visualization/svr/svr.model';
import { TipSetVisualizationAction, TipSetEnabledAction, TipSetVisibleAction } from '../../action/tip.action';
import { UmapConfigModel } from '../visualization/umap/umap.model';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { ProteinConfigModel } from '../visualization/protein/protein.model';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { OncoData, LoadedTable } from 'app/oncoData';
import { TableLoaderConfigModel } from '../visualization/tableLoader/tableLoader';
import { DatasetUpdates } from 'app/model/dataset-updates.model';


@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  private static _instance: WorkspaceComponent;
  public static get instance(): WorkspaceComponent {
    return this._instance;
  }

  // Components
  @ViewChild('panelContainer')
  public panelContainer: ElementRef;
  
  // Version last saved in local database.
  updateVersion: number = 0;

  // If non-null, the new changes we want to save in local database.
  updatesIncomingData: DatasetUpdates = null;

  overrideShowPanel = true;

  pathways: Observable<Array<any>>;
  genesets: Observable<Array<any>>;
  cohorts: Observable<Array<any>>;
  preprocessings: Observable<Array<Preprocessing>>;
  loader: Observable<boolean>;
  graphALegend: Observable<Array<Legend>>;
  graphBLegend: Observable<Array<Legend>>;
  graphAConfig: Observable<GraphConfig>;
  graphBConfig: Observable<GraphConfig>;
  helpPanelConfig: Observable<GraphConfig>;
  workspaceConfig: Observable<WorkspaceConfigModel>;
  graphAData: Observable<any>;
  graphBData: Observable<any>;
  graphADecorators: Observable<Array<DataDecorator>>;
  graphBDecorators: Observable<Array<DataDecorator>>;
  graphASelectionToolConfig: Observable<SelectionToolConfig>;
  graphBSelectionToolConfig: Observable<SelectionToolConfig>;
  edgeDecorators: Observable<Array<DataDecorator>>;
  datasetDescription: Observable<DatasetDescription>;
  selectVisible: Observable<boolean>;
  selectSelection: Observable<ChartSelection>;
  selectStats: Observable<Array<any>>;

  edgeConfig: Observable<EdgeConfigModel>;
  edgeLegend: Observable<Array<Legend>>;
  $configChangeA: Subscription;
  $configChangeB: Subscription;
  $configChangeE: Subscription;

  graphPanelATab: Observable<enums.GraphPanelEnum>;
  graphPanelBTab: Observable<enums.GraphPanelEnum>;
  genesetPanelTab: Observable<enums.SinglePanelEnum>;
  modalPanel: Observable<enums.PanelEnum>;
  modalPanelNumber: number;

  selectedTool: Observable<enums.ToolEnum>;
  selectedGraph: Observable<enums.GraphEnum>;
  fields: Observable<Array<DataField>>;
  tables: Observable<Array<DataTable>>;
  events: Observable<Array<{ type: string; subtype: string }>>;
  queryData: Observable<any>;
  _selectedGraph: enums.GraphEnum; // This is super wrong

  tip: Observable<any>;
  tipVisible: Observable<boolean>;
  tipEnabled: Observable<boolean>;
  tipVisualization: Observable<enums.VisualizationEnum>;

  public static addDecorator(config: GraphConfig, decorator: DataDecorator): void {
    this._instance.graphPanelAddDecorator({ config: config, decorator: decorator });
  }

  projectName: string;

  constructor(private store: Store<fromRoot.State>, public ds: DataService) {
    WorkspaceComponent._instance = this;
    window['reachableWorkspaceComponent'] = this;
    this.pathways = store.select(fromRoot.getPathways);
    this.genesets = store.select(fromRoot.getGenesets);
    this.cohorts = store.select(fromRoot.getCohorts);
    this.preprocessings = store.select(fromRoot.getPreprocessing);
    this.graphPanelATab = store.select(fromRoot.getLayoutGraphPanelAState);
    this.graphPanelBTab = store.select(fromRoot.getLayoutGraphPanelBState);
    this.modalPanel = store.select(fromRoot.getLayoutModalPanelState);
    this.loader = store.select(fromRoot.getLayoutLoaderState);
    this.helpPanelConfig = store.select(fromRoot.getHelpConfigState);

    this.edgeConfig = store.select(fromRoot.getEdgesConfig);
    this.graphAConfig = store.select(fromRoot.getGraphAConfig);
    this.graphBConfig = store.select(fromRoot.getGraphBConfig);
    this.workspaceConfig = store.select(fromRoot.getWorkspaceConfig);

    this.graphAData = store.select(fromRoot.getGraphAData);
    this.graphBData = store.select(fromRoot.getGraphBData);

    this.graphASelectionToolConfig = store.select(fromRoot.getGraphASelectionToolConfig);
    this.graphBSelectionToolConfig = store.select(fromRoot.getGraphASelectionToolConfig);
    this.graphADecorators = store.select(fromRoot.getGraphADecorators);
    this.graphBDecorators = store.select(fromRoot.getGraphBDecorators);
    this.edgeDecorators = store.select(fromRoot.getEdgeDecorators);
    this.datasetDescription = store.select(fromRoot.getDatasetDescription);

    this.selectVisible = store.select(fromRoot.getSelectVisible);
    this.selectSelection = store.select(fromRoot.getSelectSelection);
    this.selectStats = store.select(fromRoot.getSelectStats);

    this.tables = store.select(fromRoot.getTables);
    this.fields = store.select(fromRoot.getFields);
    this.events = store.select(fromRoot.getEvents);

    this.tip = store.select(fromRoot.getTip);
    this.tipVisible = store.select(fromRoot.getTipVisible);
    this.tipEnabled = store.select(fromRoot.getTipEnabled);
    this.tipVisualization = store.select(fromRoot.getTipVisualization);
  }

  selectedId: string;
  ngOnInit() {
    console.log('ngOnInit of WorkspaceComponent');
    if (window.document.URL.includes("#")){
      let url = new URL(window.document.URL);
      var project = url.hash.substring(1+8); // remove '#project-'
      if (project != "" && project != null) {
        console.log('ngOnInit project = ' + project);
        this.projectName = project;
      }
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit of WorkspaceComponent');
    if (this.projectName != "" && this.projectName != null){
      console.log('NOW OPEN ' + this.projectName)
      this.fileLoadPublicShared(this.projectName);
      window.document.location.href="#"
    }
  }

  private loadedTables:Map<string, LoadedTable> = new Map<string, LoadedTable>(); 

  public getLoadedTable(key:string){
    return this.loadedTables.get(key);
  }

  public hasLoadedTable(key:string){
    return this.loadedTables.has(key);
  }

  public setLoadedTable(key:string, value:LoadedTable){
    this.loadedTables.set(key, value);
  }

  public clearLoadedTables(){
    this.loadedTables.clear();
    this.tableRetrievalInProgress=false;
  }

  private tableRetrievalInProgress = false;

  
  public requestLoadedTable(key:string){
    if(this.hasLoadedTable(key) ==false){
      if(this.tableRetrievalInProgress==false){
        this.tableRetrievalInProgress = true;
        this.loadTableAndMap(key);
      }
    }
  }

  select(selection: ChartSelection): void {
    switch (selection.type) {
      case EntityTypeEnum.SAMPLE:
        this.store.dispatch(new compute.SelectSamplesAction({ samples: selection.ids }));
        break;
      case EntityTypeEnum.GENE:
        this.store.dispatch(new compute.SelectMarkersAction({ markers: selection.ids }));
        break;
    }
  }

  saveSelection(event: { name: string; selection: ChartSelection }) {
    if (event.selection.type === EntityTypeEnum.SAMPLE) {
      this.store.dispatch(new compute.SelectSaveSamplesAction(event));
    } else if (event.selection.type === EntityTypeEnum.GENE) {
      this.store.dispatch(new compute.SelectSaveMarkersAction(event));
    }
  }

  edgeConfigChange(value: EdgeConfigModel): void {
    this.store.dispatch(new compute.EdgesAction({ config: value }));
  }

  loadTableAndMap(tableName:string):void {
    console.log(`loadTableAndMap ${Date.now()}.`);
    // TBD !!!!!! first do map
    let config:TableLoaderConfigModel = new TableLoaderConfigModel();
    config.tableName = tableName;
    config.graph = GraphEnum.GRAPH_A;
    config.database = OncoData.instance.dataLoadedAction.dataset
    config.datasetName =OncoData.instance.dataLoadedAction.datasetName;
    config.table= OncoData.instance.dataLoadedAction.tables.find(v=>v.tbl == tableName);

    this.ds.getTable(config.database, tableName+'Map' ).then(mapResult => {
      console.log(`Got map for loadTableAndMap of${tableName}.`);
      mapResult.toArray().then(mapData => {
        config.mapData = mapData;
        this.store.dispatch(
          new compute.TableLoaderAction({config})
        );
    
      });
    });


  }

  graphPanelSetConfig(graphConfigValue: GraphConfig): void {
    // TEMPNOTE: Here is our chance to override default config settings
    // with values generated for the specific dataset, such as
    // Timeline's config bars. As we start to store user prefs for a 
    // visualization, we can apply them too.
    // These values come from the visSettings Dexie table.

    // Now find setting overrides in visSettings Dexie table.
    // Note that we might only override one or two settings values.
    // When we process them, loop through each settings key value,
    // and write it into the gc.
    try {
      console.log(`TEMPNOTE: ==== Entering graphPanelSetConfig ...`);
//      DatasetService.db.table('visSettings').get({visEnum: graphConfigValue.visualization}).then(v => {


        if(graphConfigValue.hasAppliedMetafileOverrides == false) {
          let v:any = OncoData.instance.visSettings.find(v=> v.visEnum == graphConfigValue.visualization);
          if(v) {
            let settings = JSON.parse(v.settings);
            if (settings) {
              console.log(`TEMPNOTE: Found settings for visEnum=${graphConfigValue.visualization}...`);
              console.log(`TEMPNOTE: settings = ${v.settings}!`);
              let overrideKeys = Object.keys(settings);
              overrideKeys.map(ok => {
                console.log(`TEMPNOTE: override "${ok}" with "${JSON.stringify(settings[ok])}"!`);
                graphConfigValue[ok] = settings[ok];
              });
              // console.log('MJ settings overridden.');
              graphConfigValue.hasAppliedMetafileOverrides = true;
              console.log(`TEMPNOTE: New config = ${JSON.stringify(graphConfigValue)}!`);
            }
          }
          // console.log('MJ Now continue on with dispatching the vis.');
        }
        // console.log('MJ No more override: Has already applied meta overrides to this GraphConfig.');

        this.store.dispatch(new LoaderShowAction());
        // MJ Hide tooltips for visualizations. 2020-03-19. this.store.dispatch(new TipSetVisualizationAction(graphConfigValue.visualization));
        switch (graphConfigValue.visualization) {
          case enums.VisualizationEnum.NONE:
            this.store.dispatch(
              new compute.NoneAction({
                config: graphConfigValue as GraphConfig
              })
            );
            break;
          case enums.VisualizationEnum.EDGES:
            this.store.dispatch(
              new compute.EdgesAction({
                config: graphConfigValue as EdgeConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PCA:
            this.store.dispatch(
              new compute.PcaAction({
                config: graphConfigValue as PcaConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PATHWAYS:
            this.store.dispatch(
              new compute.PathwaysAction({
                config: graphConfigValue as PathwaysConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PROTEINS:
            this.store.dispatch(
              new compute.ProteinAction({
                config: graphConfigValue as ProteinConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.CHROMOSOME:
            this.store.dispatch(
              new compute.ChromosomeAction({
                config: graphConfigValue as ChromosomeConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.GENOME:
            this.store.dispatch(
              new compute.GenomeAction({
                config: graphConfigValue as GenomeConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.TSNE:
            this.store.dispatch(
              new compute.TsneAction({
                config: graphConfigValue as TsneConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.UMAP:
            this.store.dispatch(
              new compute.UmapAction({
                config: graphConfigValue as UmapConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SCATTER:
            this.store.dispatch(
              new compute.ScatterAction({
                config: graphConfigValue as ScatterConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.TIMELINES:
            this.store.dispatch(
              new compute.TimelinesAction({
                config: graphConfigValue as TimelinesConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.HEATMAP:
            this.store.dispatch(
              new compute.HeatmapAction({
                config: graphConfigValue as HeatmapConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.DENDOGRAM:
            this.store.dispatch(
              new compute.DendogramAction({
                config: graphConfigValue as DendogramConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PARALLEL_COORDS:
            this.store.dispatch(
              new compute.ParallelCoordsAction({
                config: graphConfigValue as ParallelCoordsConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.BOX_WHISKERS:
            this.store.dispatch(
              new compute.BoxWhiskersAction({
                config: graphConfigValue as BoxWhiskersConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LINKED_GENE:
            this.store.dispatch(
              new compute.LinkedGeneAction({
                config: graphConfigValue as LinkedGeneConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.HIC:
            this.store.dispatch(
              new compute.HicAction({
                config: graphConfigValue as HicConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SOM:
            this.store.dispatch(
              new compute.SomAction({
                config: graphConfigValue as SomConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.MDS:
            this.store.dispatch(
              new compute.MdsAction({
                config: graphConfigValue as MdsConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SAVED_POINTS:
            this.store.dispatch(
              new compute.SavedPointsAction({
                config: graphConfigValue as SavedPointsConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.FA:
            this.store.dispatch(
              new compute.FaAction({
                config: graphConfigValue as FaConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LDA:
            this.store.dispatch(
              new compute.LdaAction({
                config: graphConfigValue as LdaConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.FAST_ICA:
            this.store.dispatch(
              new compute.FastIcaAction({
                config: graphConfigValue as FastIcaConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.DICTIONARY_LEARNING:
            this.store.dispatch(
              new compute.DictionaryLearningAction({
                config: graphConfigValue as DictionaryLearningConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.NMF:
            this.store.dispatch(
              new compute.NmfAction({
                config: graphConfigValue as NmfConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.TRUNCATED_SVD:
            this.store.dispatch(
              new compute.TruncatedSvdAction({
                config: graphConfigValue as TruncatedSvdConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.ISOMAP:
            this.store.dispatch(
              new compute.IsoMapAction({
                config: graphConfigValue as IsoMapConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LOCALLY_LINEAR_EMBEDDING:
            this.store.dispatch(
              new compute.LocalLinearEmbeddingAction({
                config: graphConfigValue as LocalLinearEmbeddingConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SPECTRAL_EMBEDDING:
            this.store.dispatch(
              new compute.SpectralEmbeddingAction({
                config: graphConfigValue as SpectralEmbeddingConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.INCREMENTAL_PCA:
            this.store.dispatch(
              new compute.PcaIncrementalAction({
                config: graphConfigValue as PcaIncrementalConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.KERNAL_PCA:
            this.store.dispatch(
              new compute.PcaKernalAction({
                config: graphConfigValue as PcaKernalConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SPARSE_PCA:
            this.store.dispatch(
              new compute.PcaSparseAction({
                config: graphConfigValue as PcaSparseConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING:
            this.store.dispatch(
              new compute.MiniBatchDictionaryLearningAction({
                config: graphConfigValue as MiniBatchDictionaryLearningConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.MINI_BATCH_SPARSE_PCA:
            this.store.dispatch(
              new compute.MiniBatchSparsePcaAction({
                config: graphConfigValue as MiniBatchSparsePcaConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS:
            this.store.dispatch(
              new compute.LinearDiscriminantAnalysisAction({
                config: graphConfigValue as LinearDiscriminantAnalysisConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SURVIVAL:
            this.store.dispatch(
              new compute.SurvivalAction({
                config: graphConfigValue as SurvivalConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.HAZARD:
            this.store.dispatch(
              new compute.HazardAction({
                config: graphConfigValue as HazardConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.HISTOGRAM:
            this.store.dispatch(
              new compute.HistogramAction({
                config: graphConfigValue as HistogramConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PLSSVD:
            this.store.dispatch(
              new compute.PlsSvdAction({
                config: graphConfigValue as PlsSvdConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PLSREGRESSION:
            this.store.dispatch(
              new compute.PlsRegressionAction({
                config: graphConfigValue as PlsRegressionConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.PLSCANONICAL:
            this.store.dispatch(
              new compute.PlsCanonicalAction({
                config: graphConfigValue as PlsCanonicalConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS:
            this.store.dispatch(
              new compute.QuadraticDiscriminantAnalysisAction({
                config: graphConfigValue as QuadradicDiscriminantAnalysisConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.CCA:
            this.store.dispatch(
              new compute.CCAAction({
                config: graphConfigValue as CCAConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LINEAR_SVC:
            this.store.dispatch(
              new compute.LinearSVCAction({
                config: graphConfigValue as LinearSVCConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.LINEAR_SVR:
            this.store.dispatch(
              new compute.LinearSVRAction({
                config: graphConfigValue as LinearSVRConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.NU_SVR:
            this.store.dispatch(
              new compute.NuSVRAction({
                config: graphConfigValue as NuSVRConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.NU_SVC:
            this.store.dispatch(
              new compute.NuSVCAction({
                config: graphConfigValue as NuSVCConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.ONE_CLASS_SVM:
            this.store.dispatch(
              new compute.OneClassSVMAction({
                config: graphConfigValue as OneClassSVMConfigModel
              })
            );
            break;
          case enums.VisualizationEnum.SVR:
            this.store.dispatch(
              new compute.SVRAction({
                config: graphConfigValue as SVRConfigModel
              })
            );
            break;
        }
    
    } catch (eee) {
      console.log(`TEMPNOTE: Caught failure to look at visSettings. ${JSON.stringify(eee)}.`);
    }

  }

  tipHide(): void {
    this.store.dispatch(new TipSetVisibleAction(false));
  }
  graphPanelSetSelectionToolConfig(e: { config: GraphConfig; selectionTool: SelectionToolConfig }): void {
    console.warn('==== graphPanelSetSelectionToolConfig...');
    console.dir(e.selectionTool);
    this.store.dispatch(
      new SelectionToolChangeAction({
        config: e.config,
        selectionTool: e.selectionTool
      })
    );
  }
  
 
  //ThreeDRenderOptionAction
  setThreeDOptions(e: { config: GraphConfig; option: string; value: any }): void {
    this.store.dispatch(
      new ThreeDRenderOptionAction({
        config: e.config,
        option: e.option,
        value: e.value
      })
    );
  }
  

  edgeAddDecorator(e: { config: EdgeConfigModel; decorator: DataDecorator }): void {
    this.store.dispatch(
      new DataDecoratorCreateAction({
        config: e.config,
        decorator: e.decorator
      })
    );
  }
  edgeDelDecorator(e: { config: EdgeConfigModel; decorator: DataDecorator }): void {
    this.store.dispatch(new DataDecoratorDelAction({ config: e.config, decorator: e.decorator }));
  }
  graphPanelAddDecorator(e: { config: GraphConfig; decorator: DataDecorator }): void {
    this.store.dispatch(
      new DataDecoratorCreateAction({
        config: e.config,
        decorator: e.decorator
      })
    );
  }
  graphPanelDelDecorator(e: { config: GraphConfig; decorator: DataDecorator }): void {
    this.store.dispatch(new DataDecoratorDelAction({ config: e.config, decorator: e.decorator }));
  }
  graphPanelDelAllDecorators(e: { config: GraphConfig }): void {
    this.store.dispatch(new DataDecoratorDelAllAction({ config: e.config }));
  }
  addPathway(value: { database: string; pathway: Pathway }): void {
    this.store.dispatch(new DataAddPathwayAction(value));
  }
  delPathway(value: { database: string; pathway: Pathway }): void {
    this.store.dispatch(new DataDelPathwayAction(value));
  }
  addGeneset(value: { database: string; geneset: GeneSet }): void {
    this.store.dispatch(new DataAddGenesetAction(value));
  }
  delGeneset(value: { database: string; geneset: GeneSet }): void {
    this.store.dispatch(new DataDelGenesetAction(value));
  }
  updateGeneset(value: { database: string; geneset: GeneSet }): void {
    this.store.dispatch(new DataUpdateGenesetAction(value));
  }
  addPreprocessing(value: { database: string; preprocessing: Preprocessing }): void {
    this.store.dispatch(new DataAddPreprocessingAction(value));
  }
  delPreprocessing(value: { database: string; preprocessing: Preprocessing }): void {
    this.store.dispatch(new DataDelPreprocessingAction(value));
  }
  addCohort(value: { database: string; cohort: Cohort }): void {
    this.store.dispatch(new DataAddCohortAction(value));
  }
  delCohort(value: { database: string; cohort: Cohort }): void {
    this.store.dispatch(new DataDelCohortAction(value));
  }
  helpPanelToggle(config: GraphConfig): void {
    this.store.dispatch(new HelpSetConfigAction(config));
    this.store.dispatch(new ModalPanelAction(enums.PanelEnum.HELP));
  }
  splitScreenChange(value: boolean): void {
    const model = new WorkspaceConfigModel();
    model.layout = value ? enums.WorkspaceLayoutEnum.HORIZONTAL : enums.WorkspaceLayoutEnum.SINGLE;
    this.store.dispatch(new WorkspaceConfigAction(model));
    this.store.dispatch(new GraphPanelToggleAction(enums.GraphPanelEnum.GRAPH_B));
  }
  setPanel(value: enums.PanelEnum): void {
    if (value === enums.PanelEnum.NONE && this.overrideShowPanel) {
      value = enums.PanelEnum.DATA;
    }
    this.store.dispatch(new ModalPanelAction(value));
  }

  workspacePanelSetConfig(value: WorkspaceConfigModel) {
    this.store.dispatch(new WorkspaceConfigAction(value));
  }

  fileLoadPrivate(value: { bucket: string; env: string }) {
    console.log(`fileLoadPrivate, input is ${JSON.stringify(value)}`);
    this.overrideShowPanel = false;
    //value.token = '';
    this.store.dispatch(new data.DataLoadFromPrivate(value));
    this.store.dispatch(new ModalPanelAction(enums.PanelEnum.NONE));
    this.store.dispatch(new LoaderShowAction());
  }

  // For loading a publicly-shared private-upload set, like site.com?project=myproject
  fileLoadPublicShared(publicName: string) {
    console.log('Starting fileLoadPublicShared');
    let value = {
      img: "DSbreast",
      name: "Breast",
      prefix: "tcga_brca_",
      src: "tcga",
      uid: "tcga_brca"      
    }

    value.src = "public"
    value.img = publicName
    value.name = publicName
    value.prefix = ""
    value.uid = publicName

    this.fileLoadPublic(value);
    console.log('Completed fileLoadPublicShared')
  }

  fileLoadPublic(value: any) {

    this.ds.resolveGeneSymbols();
    if (value.hasOwnProperty('content')) {
      // console.log('MJ == Should not be trying zbd ==');
      alert('These semi-private datasets are not currently supported. Contact Matt Jensen with questions (mnjensen@fredhutch.org).'); // MJ
      // const v = {
      //   bucket: 'zbd' + value.project.split('|')[0],
      //   token: '',
      //   name: value.content.name
      // };
      // this.overrideShowPanel = false;
      // this.store.dispatch(new data.DataLoadFromPrivate(v));
      // this.store.dispatch(new ModalPanelAction(enums.PanelEnum.NONE));
      // this.store.dispatch(new LoaderShowAction());
    } else {
      console.log('MJ == In fileLoadPublic, no "content" property.');
      this.overrideShowPanel = false;
      this.store.dispatch(new data.DataLoadFromPublic(value));
      this.store.dispatch(new ModalPanelAction(enums.PanelEnum.NONE));
      this.store.dispatch(new LoaderShowAction());
    }
  }
}
