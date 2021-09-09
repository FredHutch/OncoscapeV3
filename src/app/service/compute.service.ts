import { ScatterConfigModel } from './../component/visualization/scatter/scatter.model';
import { UmapConfigModel } from './../component/visualization/umap/umap.model';
import { Injectable } from '@angular/core';
import { MiniBatchSparsePcaConfigModel } from 'app/component/visualization/minibatchsparsepca/minibatchsparsepca.model';
import { PathwaysConfigModel } from 'app/component/visualization/pathways/pathways.model';
// tslint:disable-next-line:max-line-length
import { QuadradicDiscriminantAnalysisConfigModel } from 'app/component/visualization/quadradicdiscriminantanalysis/quadradicdiscriminantanalysis.model';
import { TimelinesConfigModel } from 'app/component/visualization/timelines/timelines.model';
import { GraphEnum, VisualizationEnum, DirtyEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs';
import { BoxWhiskersConfigModel } from './../component/visualization/boxwhiskers/boxwhiskers.model';
import { ChromosomeConfigModel } from './../component/visualization/chromosome/chromosome.model';
import { DendogramConfigModel } from './../component/visualization/dendogram/dendogram.model';
import { DictionaryLearningConfigModel } from './../component/visualization/dictionarylearning/dictionarylearning.model';
import { EdgeConfigModel } from './../component/visualization/edges/edges.model';
import { FaConfigModel } from './../component/visualization/fa/fa.model';
import { FastIcaConfigModel } from './../component/visualization/fastica/fastica.model';
import { GenomeConfigModel } from './../component/visualization/genome/genome.model';
import { HazardConfigModel } from './../component/visualization/hazard/hazard.model';
import { HeatmapConfigModel } from './../component/visualization/heatmap/heatmap.model';
import { HicConfigModel } from './../component/visualization/hic/hic.model';
import { HistogramConfigModel } from './../component/visualization/histogram/histogram.model';
import { IsoMapConfigModel } from './../component/visualization/isomap/isomap.model';
import { LdaConfigModel } from './../component/visualization/lda/lda.model';
// tslint:disable-next-line:max-line-length
import { LinearDiscriminantAnalysisConfigModel } from './../component/visualization/lineardiscriminantanalysis/lineardiscriminantanalysis.model';
import { LinkedGeneConfigModel } from './../component/visualization/linkedgenes/linkedgenes.model';
import { LocalLinearEmbeddingConfigModel } from './../component/visualization/locallinearembedding/locallinearembedding.model';
import { MdsConfigModel } from './../component/visualization/mds/mds.model';
import { SavedPointsConfigModel } from './../component/visualization/savedpoints/savedpoints.model';
import { TableLoaderConfigModel } from './../component/visualization/tableLoader/tableLoader';
// tslint:disable:max-line-length
import { MiniBatchDictionaryLearningConfigModel } from './../component/visualization/minibatchdictionarylearning/minibatchdictionarylearning.model';
import { NmfConfigModel } from './../component/visualization/nmf/nmf.model';
import { ParallelCoordsConfigModel } from './../component/visualization/parallelcoords/parallelcoords.model';
import { PcaConfigModel } from './../component/visualization/pca/pca.model';
import { PcaIncrementalConfigModel } from './../component/visualization/pcaincremental/pcaincremental.model';
import { PcaKernalConfigModel } from './../component/visualization/pcakernal/pcakernal.model';
import { PcaSparseConfigModel } from './../component/visualization/pcasparse/pcasparse.model';
import { SomConfigModel } from './../component/visualization/som/som.model';
import { SpectralEmbeddingConfigModel } from './../component/visualization/spectralembedding/spectralembedding.model';
import { SurvivalConfigModel } from './../component/visualization/survival/survival.model';
import { TruncatedSvdConfigModel } from './../component/visualization/truncatedsvd/truncatedsvd.model';
import { TsneConfigModel } from './../component/visualization/tsne/tsne.model';
import { PlsSvdConfigModel } from './../component/visualization/pls-svd/pls-svd.model';
import { PlsRegressionConfigModel } from './../component/visualization/plsregression/plsregression.model';
import { PlsCanonicalConfigModel } from './../component/visualization/plscanonical/plscanonical.model';
import { CCAConfigModel } from './../component/visualization/cca/cca.model';
import { LinearSVRConfigModel } from './../component/visualization/linearsvr/linearsvr.model';
import { LinearSVCConfigModel } from './../component/visualization/linearsvc/linearsvc.model';
import { NuSVCConfigModel } from './../component/visualization/nusvc/nusvc.model';
import { NuSVRConfigModel } from './../component/visualization/nusvr/nusvr.model';
import { OneClassSVMConfigModel } from './../component/visualization/oneclasssvm/oneclasssvm.model';
import { SVRConfigModel } from './../component/visualization/svr/svr.model';
import { ProteinConfigModel } from 'app/component/visualization/protein/protein.model';
/*
When samples and genes are specified empty arrays == all
*/
import { LoaderHideAction } from './../action/layout.action';
import { Legend } from 'app/model/legend.model';
import { config } from 'aws-sdk';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';


@Injectable()
export class ComputeService {
  private isoMap$ = new Subject<any>();
  private localLinearEmbedding$ = new Subject<any>();
  private spectralEmbedding$ = new Subject<any>();
  private pcaIncremental$ = new Subject<any>();
  private pcaKernal$ = new Subject<any>();
  private pcaSparse$ = new Subject<any>();
  private fastIca$ = new Subject<any>();
  private timelines$ = new Subject<any>();
  private truncatedSvd$ = new Subject<any>();
  private dictionaryLearning$ = new Subject<any>();
  private linearDiscriminantAnalysis$ = new Subject<any>();
  private quadradicDiscriminantAnalysis$ = new Subject<any>();
  private miniBatchDictionaryLearning$ = new Subject<any>();
  private miniBatchSparsePca$ = new Subject<any>();
  private lda$ = new Subject<any>();
  private nmf$ = new Subject<any>();
  private fa$ = new Subject<any>();
  private mds$ = new Subject<any>();
  private savedPoints$ = new Subject<any>();
  private tableLoader$ = new Subject<any>();
  private pca$ = new Subject<any>();
  private som$ = new Subject<any>();
  private chromosome$ = new Subject<any>();
  private genome$ = new Subject<any>();
  private tsne$ = new Subject<any>();
  private umap$ = new Subject<any>();
  private scatter$ = new Subject<any>();
  private edges$ = new Subject<any>();
  private heatmap$ = new Subject<any>();
  private dendogram$ = new Subject<any>();
  private boxWhiskers$ = new Subject<any>();
  private parallelCoords$ = new Subject<any>();
  private linkedGene$ = new Subject<any>();
  private hic$ = new Subject<any>();
  private pathways$ = new Subject<any>();
  private proteins$ = new Subject<any>();
  private survival$ = new Subject<any>();
  private hazard$ = new Subject<any>();
  private histogram$ = new Subject<any>();
  private plsSvd$ = new Subject<any>();
  private plsRegression$ = new Subject<any>();
  private plsCanonical$ = new Subject<any>();
  private CCA$ = new Subject<any>();
  private LinearSVC$ = new Subject<any>();
  private LinearSVR$ = new Subject<any>();
  private NuSVR$ = new Subject<any>();
  private NuSVC$ = new Subject<any>();
  private OneClassSVM$ = new Subject<any>();
  private SVR$ = new Subject<any>();

  constructor() {
    // this.pool = Pool.create({
    //     name    : 'worker',
    //     max     : 20,
    //     // min     : 0,
    //     create  : () => {
    //         return new Worker('assets/compute.js');
    //     },
    //     destroy : (worker: Worker) => {
    //         worker.terminate();
    //     }
    // });
  }

  private workerA: Worker = null; // Graph A
  private workerB: Worker = null; // Graph B
  private workerE: Worker = null; // Edges

  private workerAConfigStorage: GraphConfig = null;
  private workerBConfigStorage: GraphConfig = null;
  private workerEConfigStorage: GraphConfig = null;
  
  getSubjectByVisualization(v: VisualizationEnum): Subject<any> {
    return v === VisualizationEnum.BOX_WHISKERS
      ? this.boxWhiskers$
      : v === VisualizationEnum.PATHWAYS
      ? this.pathways$
      : v === VisualizationEnum.PROTEINS
      ? this.proteins$
      : v === VisualizationEnum.ISOMAP
      ? this.isoMap$
      : v === VisualizationEnum.LOCALLY_LINEAR_EMBEDDING
      ? this.localLinearEmbedding$
      : v === VisualizationEnum.INCREMENTAL_PCA
      ? this.pcaIncremental$
      : v === VisualizationEnum.KERNAL_PCA
      ? this.pcaKernal$
      : v === VisualizationEnum.SPARSE_PCA
      ? this.pcaSparse$
      : v === VisualizationEnum.FAST_ICA
      ? this.fastIca$
      : v === VisualizationEnum.TIMELINES
      ? this.timelines$
      : v === VisualizationEnum.SPECTRAL_EMBEDDING
      ? this.spectralEmbedding$
      : v === VisualizationEnum.TRUNCATED_SVD
      ? this.truncatedSvd$
      : v === VisualizationEnum.DICTIONARY_LEARNING
      ? this.dictionaryLearning$
      : v === VisualizationEnum.LDA
      ? this.lda$
      : v === VisualizationEnum.NMF
      ? this.nmf$
      : v === VisualizationEnum.FA
      ? this.fa$
      : v === VisualizationEnum.MDS
      ? this.mds$
      : v === VisualizationEnum.SAVED_POINTS
      ? this.savedPoints$
      : v === VisualizationEnum.TABLE_LOADER
      ? this.tableLoader$
      : v === VisualizationEnum.PCA
      ? this.pca$
      : v === VisualizationEnum.SOM
      ? this.som$
      : v === VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS
      ? this.quadradicDiscriminantAnalysis$
      : v === VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS
      ? this.linearDiscriminantAnalysis$
      : v === VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING
      ? this.miniBatchDictionaryLearning$
      : v === VisualizationEnum.MINI_BATCH_SPARSE_PCA
      ? this.miniBatchSparsePca$
      : v === VisualizationEnum.CHROMOSOME
      ? this.chromosome$
      : v === VisualizationEnum.GENOME
      ? this.genome$
      : v === VisualizationEnum.TSNE
      ? this.tsne$
      : v === VisualizationEnum.UMAP
      ? this.umap$
      : v === VisualizationEnum.SCATTER
      ? this.scatter$
      : v === VisualizationEnum.HEATMAP
      ? this.heatmap$
      : v === VisualizationEnum.DENDOGRAM
      ? this.dendogram$
      : v === VisualizationEnum.PARALLEL_COORDS
      ? this.parallelCoords$
      : v === VisualizationEnum.LINKED_GENE
      ? this.linkedGene$
      : v === VisualizationEnum.HIC
      ? this.hic$
      : v === VisualizationEnum.SURVIVAL
      ? this.survival$
      : v === VisualizationEnum.HAZARD
      ? this.hazard$
      : v === VisualizationEnum.PLSSVD
      ? this.plsSvd$
      : v === VisualizationEnum.PLSREGRESSION
      ? this.plsRegression$
      : v === VisualizationEnum.EDGES
      ? this.edges$
      : v === VisualizationEnum.PLSCANONICAL
      ? this.plsCanonical$
      : v === VisualizationEnum.CCA
      ? this.CCA$
      : v === VisualizationEnum.LINEAR_SVC
      ? this.LinearSVC$
      : v === VisualizationEnum.LINEAR_SVR
      ? this.LinearSVR$
      : v === VisualizationEnum.NU_SVR
      ? this.NuSVR$
      : v === VisualizationEnum.NU_SVC
      ? this.NuSVC$
      : v === VisualizationEnum.ONE_CLASS_SVM
      ? this.OneClassSVM$
      : v === VisualizationEnum.SVR
      ? this.SVR$
      : v === VisualizationEnum.HISTOGRAM
      ? this.histogram$
      : null;
  }

  roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );
            if (value instanceof Float32Array) {
              bytes += value.byteLength;
            } else {
            if (Array.isArray(value) && value.length > 100) {
              bytes += value.length * 16;  //  MJ Just roughly assume it's an array of numbers.
            } else {
              for( var i in value ) {
                  stack.push( value[ i ] );
              }
            }
          }
        }
    }
    return bytes;
  }

  onMessage(v) {
    console.log(`onmessage compute.service ${Date.now()}`);
    
    if (v.data === 'TERMINATE' || v.data.cmd == 'cpuError' || v.data.error) {
      const worker = v.target as Worker;
      worker.removeEventListener('message', this.onMessage);
      worker.terminate();
      if (worker === this.workerA) {
        this.workerA = null;
        this.workerAConfigStorage = null;
      }
      if (worker === this.workerB) {
        this.workerB = null;
        this.workerBConfigStorage = null;
      }
      if (worker === this.workerE) {
        this.workerE = null;
        this.workerEConfigStorage = null;
      }

      if (v.data.error || v.data.cmd == 'cpuError') {
        console.log(`MJ error or cpuError...`);
        console.dir(v.data);
        let errMessage = 'An error ocurred during computation.';
        if(v.data.error){
          errMessage = v.data.error.message;
        }
        let errDetails:string = '(Could not detect which computation failed.)';
        if (v.data.cmd && v.data.cmd == 'cpuError' && v.data.details ) {
          errMessage = v.data.details.errorMessage
          errDetails = `Computation: '${v.data.details.cpuMethod}.`;
        }
        document.querySelector('.loader')["style"]["visibility"] = 'hidden';
        alert(`ERROR: ${JSON.stringify(errMessage)} ... \n ${errDetails}'\n You might need to reload the web page.`)

      }
    } else {
      if (v.data.cmd === 'log') { // only cmd defined. otherwise, it's all data from the computation.
        console.log(`${v.data.cmd} MSGfromCompute: ${v.data.msg}.`);
      } else {
        let dataToUse = v.data;
        if(v.data.config.visualization != VisualizationEnum.TABLE_LOADER){
          let dataToUse = {...(v.data)};
        }
        // MJ We are not using the 'result' passed in here after all. Remove so we can treat a legend as non-looped object.
        if(dataToUse.data.legends) {
          dataToUse.data.legends.map(l => l.result = null);
        }
        console.log('config check 1');
        let copyOfConfig:GraphConfig = GraphConfig.cloneFromAny(dataToUse.config) ; // !! TBD make deep copy
        dataToUse.config = copyOfConfig;

        const worker = v.target as Worker;
        // Copy the config data back into storage, as firmColors etc. may have been changed by compute thread.
        if (worker === this.workerA) {
          this.workerAConfigStorage = copyOfConfig;
        }
        if (worker === this.workerB) {
          this.workerBConfigStorage = copyOfConfig
        }
        if (worker === this.workerE) {
          this.workerEConfigStorage = copyOfConfig
        }
        let vizName:string = VisualizationEnum[copyOfConfig.visualization];


        if(dataToUse.data.cmd == 'reuse'){
          // re-use last data for this visualization, since the config values did not change.
          console.log(`MJ  retrieving oncoData for vis: ${vizName}.`);
          let storedData = OncoData.instance.lastData[vizName]['results'];
          let deepCopyData = Object.assign({}, storedData, JSON.parse(JSON.stringify(storedData)));

          dataToUse = deepCopyData;
          dataToUse.data.cmd = 'reuse';
          dataToUse.config = copyOfConfig;
        } else {
          // we got new data back from computation.
          if(copyOfConfig.visualization != VisualizationEnum.TABLE_LOADER){
            let deepCopyData = Object.assign({}, dataToUse, JSON.parse(JSON.stringify(dataToUse)));
            console.log(`MJ  recording oncoData for vis: ${vizName}.`);
            OncoData.instance.lastData[vizName] = {};
            OncoData.instance.lastData[vizName]['results'] = deepCopyData; // dataToUse
            OncoData.instance.lastData[vizName]['size'] = this.roughSizeOfObject(v.data);
          }
        }
        // Compute function might generate a legend for Cohorts (e.g. with Survival viz),
        // but without having access to cohort data via OncoData.instance.
        // So we sniff for a legend called "Cohorts", and swap in proper cohort colors
        // to match cohort names in legend.labels.
        /* Looking for a legend like this:
        display: "DISCRETE"
        labels: (4) ["All", "AllBut3", "SwoopDown", "veryDiff"]
        name: "Cohorts"
        type: "COLOR"
        */
        try {
        if(dataToUse.data && dataToUse.data.legends) {
          let legends:Array<Legend> = dataToUse.data.legends;
          let legend:Legend = legends.find(l => l.name=='Cohorts' && l.display=='DISCRETE' && l.type=='COLOR');
          if (legend) { // We found the compute fn's default color legend for cohorts, so now use proper colors.
            legend.labels.map(function(v,i) {
              legend.values[i] = OncoData.instance.currentCommonSidePanel.colorOfSavedCohortByName(v);
            });
          }
        }

        if(copyOfConfig.visualization == VisualizationEnum.EDGES) {
          // Notify both graph A and B that we have news.
          // GenomeGraph, for example, wants to know what our edge settings were.
          let gsi = ChartScene.instance;
          if(gsi) {
            if(gsi.views[0]) {
              gsi.views[0].chart.updatedEdgeConfig(copyOfConfig as EdgeConfigModel);
            }
            if(gsi.views[1]) {
              gsi.views[1].chart.updatedEdgeConfig(copyOfConfig as EdgeConfigModel);
            }
          }
        }

      } catch (err) {
        console.error(err);
      }
      this.getSubjectByVisualization(v.data.config.visualization).next(dataToUse);


      }
    }
  }


  graphConfigsAreEquivalent(a, b) {
    if(a == null || b == null) {
      return false;
    }

    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);
    aProps = aProps
    .filter(e => e !== 'uiOptions')
    .filter(e => e !== 'reuseLastComputation');
    bProps = bProps
    .filter(e => e !== 'uiOptions')
    .filter(e => e !== 'reuseLastComputation');

    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        let aVal = JSON.stringify(a[propName]);
        let bVal = JSON.stringify(b[propName]);
        if (aVal !== bVal) {
            return false;
        }
    }

    return true;
  }

  execute(config: GraphConfig, subject: Subject<any>): Observable<any> {
    let vizName:string = VisualizationEnum[config.visualization];
    // Let us avoid using cached edges for now, until we are sure 
    // underlying graphA and graphB configs have not changed. MJ
    console.log(`MJ  checking oncoData for vis: ${vizName}.`);
    if (vizName != 'EDGES' && OncoData.instance.lastData[vizName]) {
      let lastData:any = OncoData.instance.lastData[vizName];
      // Do object compare, but ignore uiOptions. They do not affect data from compute call.
      if(this.graphConfigsAreEquivalent(config, lastData.results.config)){
        config.reuseLastComputation = true;
      }
    }

    


    // If user requests no computation, just pass the config through
    // debugger;
    // if (config.dirtyFlag === DirtyEnum.NO_COMPUTE) {
    //   this.getSubjectByVisualization(config.visualization).next(null);
    //   return subject;
    // }

    switch (config.graph) {
      case GraphEnum.GRAPH_A:
        if (this.workerA !== null) {
          this.workerA.removeEventListener('message', this.onMessage);
          this.workerA.terminate();
          this.workerA = null;
        }
        this.workerAConfigStorage = config;
        this.workerA = new Worker('assets/compute.js');
        this.workerA.addEventListener('message', this.onMessage.bind(this));
        this.workerA.postMessage(config);
        break;

      case GraphEnum.GRAPH_B:
        if (this.workerB !== null) {
          this.workerB.removeEventListener('message', this.onMessage);
          this.workerB.terminate();
          this.workerB = null;
        }
        this.workerBConfigStorage = config;
        this.workerB = new Worker('assets/compute.js');
        this.workerB.addEventListener('message', this.onMessage.bind(this));
        this.workerB.postMessage(config);
        break;

      case GraphEnum.EDGES:
        if (this.workerE !== null) {
          this.workerE.terminate();
          this.workerE.removeEventListener('message', this.onMessage);
          this.workerE = null;
        }
        this.workerEConfigStorage = config;
        this.workerE = new Worker('assets/compute.js');
        this.workerE.addEventListener('message', this.onMessage.bind(this));
        this.workerE.postMessage(config);
        break;
    }
    return subject;
  }

  heatmap(config: HeatmapConfigModel): Observable<any> {
    return this.execute(config, this.heatmap$);
  }

  dendogram(config: DendogramConfigModel): Observable<any> {
    return this.execute(config, this.dendogram$);
  }

  boxWhiskers(config: BoxWhiskersConfigModel): Observable<any> {
    return this.execute(config, this.boxWhiskers$);
  }

  parallelCoords(config: ParallelCoordsConfigModel): Observable<any> {
    return this.execute(config, this.parallelCoords$);
  }

  linkedGene(config: LinkedGeneConfigModel): Observable<any> {
    return this.execute(config, this.linkedGene$);
  }

  hic(config: HicConfigModel): Observable<any> {
    return this.execute(config, this.hic$);
  }

  tsne(config: TsneConfigModel): Observable<any> {
    return this.execute(config, this.tsne$);
  }

  umap(config: UmapConfigModel): Observable<any> {
    return this.execute(config, this.umap$);
  }

  scatter(config: ScatterConfigModel): Observable<any> {
    return this.execute(config, this.scatter$);
  }

  pathways(config: PathwaysConfigModel): Observable<any> {
    return this.execute(config, this.pathways$);
  }

  proteins(config: ProteinConfigModel): Observable<any> {
    return this.execute(config, this.proteins$);
  }

  pca(config: PcaConfigModel): Observable<any> {
    return this.execute(config, this.pca$);
  }

  timelines(config: TimelinesConfigModel): Observable<any> {
    return this.execute(config, this.timelines$);
  }

  chromosome(config: ChromosomeConfigModel): Observable<any> {
    return this.execute(config, this.chromosome$);
  }

  genome(config: GenomeConfigModel): Observable<any> {
    return this.execute(config, this.genome$);
  }

  survival(config: SurvivalConfigModel): Observable<any> {
    return this.execute(config, this.survival$);
  }

  hazard(config: HazardConfigModel): Observable<any> {
    return this.execute(config, this.hazard$);
  }

  edges(config: EdgeConfigModel): Observable<any> {
    return this.execute(config, this.edges$);
  }

  som(config: SomConfigModel): Observable<any> {
    return this.execute(config, this.som$);
  }

  quadraticDiscriminantAnalysis(config: QuadradicDiscriminantAnalysisConfigModel): Observable<any> {
    return this.execute(config, this.quadradicDiscriminantAnalysis$);
  }

  linearDiscriminantAnalysis(config: LinearDiscriminantAnalysisConfigModel): Observable<any> {
    return this.execute(config, this.linearDiscriminantAnalysis$);
  }

  miniBatchSparsePca(config: MiniBatchSparsePcaConfigModel): Observable<any> {
    return this.execute(config, this.miniBatchSparsePca$);
  }

  miniBatchDictionaryLearning(config: MiniBatchDictionaryLearningConfigModel): Observable<any> {
    return this.execute(config, this.miniBatchDictionaryLearning$);
  }

  mds(config: MdsConfigModel): Observable<any> {
    return this.execute(config, this.mds$);
  }

  savedPoints(config: SavedPointsConfigModel): Observable<any> {
    return this.execute(config, this.savedPoints$);
  }

  tableLoader(config: TableLoaderConfigModel): Observable<any> {
    return this.execute(config, this.tableLoader$);
  }

  fa(config: FaConfigModel): Observable<any> {
    return this.execute(config, this.fa$);
  }

  dictionaryLearning(config: DictionaryLearningConfigModel): Observable<any> {
    return this.execute(config, this.dictionaryLearning$);
  }

  lda(config: LdaConfigModel): Observable<any> {
    return this.execute(config, this.lda$);
  }

  nmf(config: NmfConfigModel): Observable<any> {
    return this.execute(config, this.nmf$);
  }

  truncatedSvd(config: TruncatedSvdConfigModel): Observable<any> {
    return this.execute(config, this.truncatedSvd$);
  }

  fastIca(config: FastIcaConfigModel): Observable<any> {
    return this.execute(config, this.fastIca$);
  }

  isoMap(config: IsoMapConfigModel): Observable<any> {
    return this.execute(config, this.isoMap$);
  }

  localLinearEmbedding(config: LocalLinearEmbeddingConfigModel): Observable<any> {
    return this.execute(config, this.localLinearEmbedding$);
  }

  spectralEmbedding(config: SpectralEmbeddingConfigModel): Observable<any> {
    return this.execute(config, this.spectralEmbedding$);
  }

  pcaIncremental(config: PcaIncrementalConfigModel): Observable<any> {
    return this.execute(config, this.pcaIncremental$);
  }

  pcaKernal(config: PcaKernalConfigModel): Observable<any> {
    return this.execute(config, this.pcaKernal$);
  }

  pcaSparse(config: PcaSparseConfigModel): Observable<any> {
    return this.execute(config, this.pcaSparse$);
  }

  histogram(config: HistogramConfigModel): Observable<any> {
    return this.execute(config, this.histogram$);
  }
  plsSvd(config: PlsSvdConfigModel): Observable<any> {
    return this.execute(config, this.plsSvd$);
  }
  plsRegression(config: PlsRegressionConfigModel): Observable<any> {
    return this.execute(config, this.plsRegression$);
  }
  plsCanonical(config: PlsCanonicalConfigModel): Observable<any> {
    return this.execute(config, this.plsCanonical$);
  }
  CCA(config: CCAConfigModel): Observable<any> {
    return this.execute(config, this.CCA$);
  }
  LinearSVC(config: LinearSVCConfigModel): Observable<any> {
    return this.execute(config, this.LinearSVC$);
  }
  LinearSVR(config: LinearSVRConfigModel): Observable<any> {
    return this.execute(config, this.LinearSVR$);
  }
  NuSVR(config: NuSVRConfigModel): Observable<any> {
    return this.execute(config, this.NuSVR$);
  }
  NuSVC(config: NuSVCConfigModel): Observable<any> {
    return this.execute(config, this.NuSVC$);
  }
  OneClassSVM(config: OneClassSVMConfigModel): Observable<any> {
    return this.execute(config, this.OneClassSVM$);
  }
  SVR(config: SVRConfigModel): Observable<any> {
    return this.execute(config, this.SVR$);
  }
}
