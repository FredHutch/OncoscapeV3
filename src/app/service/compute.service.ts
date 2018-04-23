import { HazardConfigModel } from './../component/visualization/hazard/hazard.model';
import { HistogramConfigModel } from './../component/visualization/histogram/histogram.model';
// tslint:disable:max-line-length
import { MiniBatchDictionaryLearningConfigModel } from './../component/visualization/minibatchdictionarylearning/minibatchdictionarylearning.model';
import { LinearDiscriminantAnalysisConfigModel } from './../component/visualization/lineardiscriminantanalysis/lineardiscriminantanalysis.model';
import { DendogramConfigModel } from './../component/visualization/dendogram/dendogram.model';
import { SurvivalConfigModel } from './../component/visualization/survival/survival.model';
import { miniBatchSparsePcaCompute } from './../component/visualization/minibatchsparsepca/minibatchsparsepca.compute';
import { COMPUTE_MINI_BATCH_SPARSE_PCA } from './../action/compute.action';
import { graph } from 'ngraph.graph';
import { HicConfigModel } from './../component/visualization/hic/hic.model';
import { ParallelCoordsConfigModel } from './../component/visualization/parallelcoords/parallelcoords.model';
import { BoxWhiskersConfigModel } from './../component/visualization/boxwhiskers/boxwhiskers.model';
import { Subject } from 'rxjs/Subject';
import { GenomeConfigModel } from './../component/visualization/genome/genome.model';
import { LinkedGeneConfigModel } from './../component/visualization/linkedgenes/linkedgenes.model';
import { PcaSparseConfigModel } from './../component/visualization/pcasparse/pcasparse.model';
import { PcaKernalConfigModel } from './../component/visualization/pcakernal/pcakernal.model';
import { PcaIncrementalConfigModel } from './../component/visualization/pcaincremental/pcaincremental.model';
import { SpectralEmbeddingConfigModel } from './../component/visualization/spectralembedding/spectralembedding.model';
import { LocalLinearEmbeddingConfigModel } from './../component/visualization/locallinearembedding/locallinearembedding.model';
import { IsoMapConfigModel } from './../component/visualization/isomap/isomap.model';
import { FastIcaConfigModel } from './../component/visualization/fastica/fastica.model';
import { TruncatedSvdDataModel, TruncatedSvdConfigModel } from './../component/visualization/truncatedsvd/truncatedsvd.model';
import { NmfConfigModel } from './../component/visualization/nmf/nmf.model';
import { LdaConfigModel } from './../component/visualization/lda/lda.model';
import { DictionaryLearningConfigModel } from './../component/visualization/dictionarylearning/dictionarylearning.model';
import { FaConfigModel } from './../component/visualization/fa/fa.model';
import { MdsConfigModel } from './../component/visualization/mds/mds.model';
import { SomConfigModel } from './../component/visualization/som/som.model';
import { HeatmapConfigModel } from './../component/visualization/heatmap/heatmap.model';
import { EdgeConfigModel } from './../component/visualization/edges/edges.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { chromosomeCompute } from './../component/visualization/chromosome/chromosome.compute';
import { ChromosomeConfigModel } from './../component/visualization/chromosome/chromosome.model';
import { GraphEnum, VisualizationEnum, DirtyEnum } from 'app/model/enum.model';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { pcaCompute } from './../component/visualization/pca/pca.compute';
import { PcaConfigModel } from './../component/visualization/pca/pca.model';
import { tsneCompute } from './../component/visualization/tsne/tsne.compute';
import { TsneConfigModel } from './../component/visualization/tsne/tsne.model';
import { TimelinesConfigModel } from 'app/component/visualization/timelines/timelines.model';
import { PathwaysConfigModel } from 'app/component/visualization/pathways/pathways.model';
import { QuadradicDiscriminantAnalysisConfigModel } from 'app/component/visualization/quadradicdiscriminantanalysis/quadradicdiscriminantanalysis.model';
import { MiniBatchSparsePcaConfigModel } from 'app/component/visualization/minibatchsparsepca/minibatchsparsepca.model';
declare var thread;

/*
When samples and genes are specified empty arrays == all
*/
@Injectable()
export class ComputeService {

    private workers: Array<Worker>;
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
    private pca$ = new Subject<any>();
    private som$ = new Subject<any>();
    private chromosome$ = new Subject<any>();
    private genome$ = new Subject<any>();
    private tsne$ = new Subject<any>();
    private edges$ = new Subject<any>();
    private heatmap$ = new Subject<any>();
    private dendogram$ = new Subject<any>();
    private boxWhiskers$ = new Subject<any>();
    private parallelCoords$ = new Subject<any>();
    private linkedGene$ = new Subject<any>();
    private hic$ = new Subject<any>();
    private pathways$ = new Subject<any>();
    private survival$ = new Subject<any>();
    private hazard$ = new Subject<any>();
    private histogram$ = new Subject<any>();

    constructor() {
        // this.pool = Pool.create({
        //     name    : 'worker',
        //     max     : 20,
        //     // min     : 0,
        //     create  : () => {
        //         console.log('WORKER :: ALLOCATE');
        //         return new Worker('assets/compute.js');
        //     },
        //     destroy : (worker: Worker) => {
        //         console.log('WORKER :: DESTROY');
        //         worker.terminate();
        //     }
        // });
    }

    private workerA: Worker = null;    // Graph A
    private workerB: Worker = null;    // Graph B
    private workerE: Worker = null;    // Edges

    getSubjectByVisualization(v: VisualizationEnum): Subject<any> {
        return (v === VisualizationEnum.BOX_WHISKERS) ? this.boxWhiskers$ :
            (v === VisualizationEnum.PATHWAYS) ? this.pathways$ :
                (v === VisualizationEnum.ISOMAP) ? this.isoMap$ :
                    (v === VisualizationEnum.LOCALLY_LINEAR_EMBEDDING) ? this.localLinearEmbedding$ :
                        (v === VisualizationEnum.INCREMENTAL_PCA) ? this.pcaIncremental$ :
                            (v === VisualizationEnum.KERNAL_PCA) ? this.pcaKernal$ :
                                (v === VisualizationEnum.SPARSE_PCA) ? this.pcaSparse$ :
                                    (v === VisualizationEnum.FAST_ICA) ? this.fastIca$ :
                                        (v === VisualizationEnum.TIMELINES) ? this.timelines$ :
                                            (v === VisualizationEnum.SPECTRAL_EMBEDDING) ? this.spectralEmbedding$ :
                                                (v === VisualizationEnum.TRUNCATED_SVD) ? this.truncatedSvd$ :
                                                    (v === VisualizationEnum.DICTIONARY_LEARNING) ? this.dictionaryLearning$ :
                                                        (v === VisualizationEnum.LDA) ? this.lda$ :
                                                            (v === VisualizationEnum.NMF) ? this.nmf$ :
                                                                (v === VisualizationEnum.FA) ? this.fa$ :
                                                                    (v === VisualizationEnum.MDS) ? this.mds$ :
                                                                        (v === VisualizationEnum.PCA) ? this.pca$ :
                                                                            (v === VisualizationEnum.SOM) ? this.som$ :
                                                                                (v === VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS) ? this.quadradicDiscriminantAnalysis$ :
                                                                                    (v === VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS) ? this.linearDiscriminantAnalysis$ :
                                                                                        (v === VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING) ? this.miniBatchDictionaryLearning$ :
                                                                                            (v === VisualizationEnum.MINI_BATCH_SPARSE_PCA) ? this.miniBatchSparsePca$ :
                                                                                                (v === VisualizationEnum.CHROMOSOME) ? this.chromosome$ :
                                                                                                    (v === VisualizationEnum.GENOME) ? this.genome$ :
                                                                                                        (v === VisualizationEnum.TSNE) ? this.tsne$ :
                                                                                                            (v === VisualizationEnum.HEATMAP) ? this.heatmap$ :
                                                                                                                (v === VisualizationEnum.DENDOGRAM) ? this.dendogram$ :
                                                                                                                    (v === VisualizationEnum.PARALLEL_COORDS) ? this.parallelCoords$ :
                                                                                                                        (v === VisualizationEnum.LINKED_GENE) ? this.linkedGene$ :
                                                                                                                            (v === VisualizationEnum.HIC) ? this.hic$ :
                                                                                                                                (v === VisualizationEnum.SURVIVAL) ? this.survival$ :
                                                                                                                                    (v === VisualizationEnum.HAZARD) ? this.hazard$ :
                                                                                                                                        (v === VisualizationEnum.EDGES) ? this.edges$ :
                                                                                                                                            (v === VisualizationEnum.HISTOGRAM) ? this.histogram$ :
                                                                                                                                                null;
    }
    onMessage(v) {
        if (v.data === 'TERMINATE') {
            const worker = v.target as Worker;
            worker.removeEventListener('message', this.onMessage);
            worker.terminate();
            if (worker === this.workerA) { this.workerA = null; }
            if (worker === this.workerB) { this.workerB = null; }
            if (worker === this.workerE) { this.workerE = null; }
        } else {
            this.getSubjectByVisualization(v.data.config.visualization).next(v.data);
        }
    }
    execute(config: GraphConfig, subject: Subject<any>): Observable<any> {

        // If user requests no computation, just pass the config through
        // if (config.dirtyFlag === DirtyEnum.NO_COMPUTE) {
        //     this.getSubjectByVisualization(config.visualization).next(null);
        // }

        switch (config.graph) {
            case GraphEnum.GRAPH_A:
                if (this.workerA !== null) {
                    this.workerA.removeEventListener('message', this.onMessage);
                    this.workerA.terminate();
                    this.workerA = null;
                }
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

    pathways(config: PathwaysConfigModel): Observable<any> {
        return this.execute(config, this.pathways$);
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
}
