import { ProteinFormComponent } from './component/visualization/protein/protein.form.component';
import { CbioService } from 'app/service/datasource/cbio.service';
import { BehaviorPanelComponent } from './component/workspace/behavior-panel/behavior-panel.component';
import { ScatterFormComponent } from './component/visualization/scatter/scatter.form.component';
import { UmapFormComponent } from './component/visualization/umap/umap.form.component';
import { TipPanelComponent } from './component/workspace/tip-panel/tip-panel.component';
import { SelectionPanelComponent } from './component/workspace/selection-panel/selection-panel.component';
import { NgModule, ErrorHandler } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HotTableModule } from '@handsontable/angular';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { FileUploadModule } from 'ng2-file-upload';
import { AppRoutingModule } from './app-routing.module';
// Components
import { AppComponent } from './app.component';
import { ContentDialog } from './component/content-dialog/content-dialog';
import { ApplicationBarComponent } from './component/application-bar/application-bar.component';
import { BoxWhiskersFormComponent } from './component/visualization/boxwhiskers/boxwhiskers.form.component';
import { ChromosomeFormComponent } from './component/visualization/chromosome/chromosome.form.component';
import { DaFormComponent } from './component/visualization/da/da.form.component';
import { DeFormComponent } from './component/visualization/de/de.form.component';
import { DendogramFormComponent } from './component/visualization/dendogram/dendogram.form.component';
import { DictionaryLearningFormComponent } from './component/visualization/dictionarylearning/dictionarylearning.form.component';
import { FaFormComponent } from './component/visualization/fa/fa.form.component';
import { FastIcaFormComponent } from './component/visualization/fastica/fastica.form.component';
import { GenomeFormComponent } from './component/visualization/genome/genome.form.component';
import { HazardFormComponent } from './component/visualization/hazard/hazard.form.component';
import { HeatmapFormComponent } from './component/visualization/heatmap/heatmap.form.component';
import { HicFormComponent } from './component/visualization/hic/hic.form.component';
import { HistogramFormComponent } from './component/visualization/histogram/histogram.form.component';
import { IsoMapFormComponent } from './component/visualization/isomap/isomap.form.component';
import { KMeansFormComponent } from './component/visualization/kmeans/kmeans.form.component';
import { KmedianFormComponent } from './component/visualization/kmedians/kmedians.form.component';
import { KmedoidFormComponent } from './component/visualization/kmedoids/kmedoids.form.component';
import { LdaFormComponent } from './component/visualization/lda/lda.form.component';
// tslint:disable-next-line:max-line-length
import { PlsSvdFormComponent } from './component/visualization/pls-svd/pls-svd.form.component';
// tslint:disable-next-line:max-line-length
import { LinearDiscriminantAnalysisFormComponent } from './component/visualization/lineardiscriminantanalysis/lineardiscriminantanalysis.form.component';
import { LinkedGeneFormComponent } from './component/visualization/linkedgenes/linkedgenes.form.component';
import { LocalLinearEmbeddingFormComponent } from './component/visualization/locallinearembedding/locallinearembedding.form.component';
import { MdsFormComponent } from './component/visualization/mds/mds.form.component';
import { SavedPointsFormComponent } from './component/visualization/savedpoints/savedpoints.form.component';
// tslint:disable-next-line:max-line-length
import { MiniBatchDictionaryLearningFormComponent } from './component/visualization/minibatchdictionarylearning/minibatchdictionarylearning.form.component';
import { MiniBatchSparsePcaFormComponent } from './component/visualization/minibatchsparsepca/minibatchsparsepca.form.component';
import { NmfFormComponent } from './component/visualization/nmf/nmf.form.component';
import { ParallelCoordsFormComponent } from './component/visualization/parallelcoords/parallelcoords.form.component';
import { PathwaysFormComponent } from './component/visualization/pathways/pathways.form.component';
import { PcaFormComponent } from './component/visualization/pca/pca.form.component';
import { PcaIncrementalFormComponent } from './component/visualization/pcaincremental/pcaincremental.form.component';
import { PcaKernalFormComponent } from './component/visualization/pcakernal/pcakernal.form.component';
import { PcaSparseFormComponent } from './component/visualization/pcasparse/pcasparse.form.component';
import { PlsFormComponent } from './component/visualization/pls/pls.form.component';
import { PlsRegressionFormComponent } from './component/visualization/plsregression/plsregression.form.component';
import { PlsCanonicalFormComponent } from './component/visualization/plscanonical/plscanonical.form.component';
import { CCAFormComponent } from './component/visualization/cca/cca.form.component';
import { LinearSVCFormComponent } from './component/visualization/linearsvc/linearsvc.form.component';
import { LinearSVRFormComponent } from './component/visualization/linearsvr/linearsvr.form.component';
import { NuSVCFormComponent } from './component/visualization/nusvc/nusvc.form.component';
import { NuSVRFormComponent } from './component/visualization/nusvr/nusvr.form.component';
import { OneClassSVMFormComponent } from './component/visualization/oneclasssvm/oneclasssvm.form.component';
import { SVRFormComponent } from './component/visualization/svr/svr.form.component';
// tslint:disable-next-line:max-line-length
import { QuadradicDiscriminantAnalysisFormComponent } from './component/visualization/quadradicdiscriminantanalysis/quadradicdiscriminantanalysis.form.component';
import { SomFormComponent } from './component/visualization/som/som.form.component';
import { SpectralEmbeddingFormComponent } from './component/visualization/spectralembedding/spectralembedding.form.component';
import { SurvivalFormComponent } from './component/visualization/survival/survival.form.component';
import { SvdFormComponent } from './component/visualization/svd/svd.form.component';
import { TimelinesFormComponent } from './component/visualization/timelines/timelines.form.component';
import { TruncatedSvdFormComponent } from './component/visualization/truncatedsvd/truncatedsvd.form.component';
import { TsneFormComponent } from './component/visualization/tsne/tsne.form.component';
import { AboutPanelComponent } from './component/workspace/about-panel/about-panel.component';
import { AnalysisPanelComponent } from './component/workspace/analysis-panel/analysis-panel.component';
import { ChartComponent } from './component/workspace/chart/chart.component';
import { ChartFactory } from './component/workspace/chart/chart.factory';
import { CitationsPanelComponent } from './component/workspace/citations-panel/citations-panel.component';
import { ClusteringAlgorithmPanelComponent } from './component/workspace/clustering-algorithm-panel/clustering-algorithm-panel.component';
import { CohortPanelComponent } from './component/workspace/cohort-panel/cohort-panel.component';
import { CommonSidePanelComponent } from './component/workspace/common-side-panel/common-side-panel.component';
import { WidgetComponent } from './component/workspace/common-side-panel/widget.component';
import { SurvivalWidgetComponent } from './component/workspace/common-side-panel/survival-widget.component';
import { CopynumberWidgetComponent } from './component/workspace/common-side-panel/copynumber-widget.component';
import { DiffexpWidgetComponent } from './component/workspace/common-side-panel/diffexp-widget.component';
import { PreprocessingPanelComponent } from './component/workspace/preprocessing-panel/preprocessing-panel.component';
import { ColorPanelComponent } from './component/workspace/color-panel/color-panel.component';
import { DashboardPanelComponent } from './component/workspace/dashboard-panel/dashboard-panel.component';
import { DataPanelComponent } from './component/workspace/data-panel/data-panel.component';
import { SummaryComponent } from './component/workspace/data-panel/summary/summary.component';
import { EdgePanelComponent } from './component/workspace/edge-panel/edge-panel.component';
import { FeedbackPanelComponent } from './component/workspace/feedback-panel/feedback-panel.component';
import { FilePanelComponent } from './component/workspace/file-panel/file-panel.component';
import { GeneSignaturePanelComponent } from './component/workspace/gene-signature-panel/gene-signature-panel.component';
import { GenesetPanelComponent } from './component/workspace/geneset-panel/geneset-panel.component';
import { GraphPanelAnalysisComponent } from './component/workspace/graph-panel/graph-panel-analysis.component';
import { GraphPanelDataComponent } from './component/workspace/graph-panel/graph-panel-data.component';
import { GraphPanelVisualizationComponent } from './component/workspace/graph-panel/graph-panel-visualization.component';
import { GraphPanelComponent } from './component/workspace/graph-panel/graph-panel.component';
import { HelpPanelComponent } from './component/workspace/help-panel/help-panel.component';
import { LandingPanelComponent } from './component/workspace/landing-panel/landing-panel.component';
import { LegendPanelComponent } from './component/workspace/legend-panel/legend-panel.component';
import { LegendItemComponent } from './component/workspace/legend-item/legend-item.component';
import { LoaderComponent } from './component/workspace/loader/loader.component';
import { PathwayPanelComponent } from './component/workspace/pathway-panel/pathway-panel.component';
import { QueryBuilderComponent } from './component/workspace/query-panel/query-builder/query-builder.component';
import { QueryPanelComponent } from './component/workspace/query-panel/query-panel.component';
import { SettingsPanelComponent } from './component/workspace/settings-panel/settings-panel.component';
import { StatPanelComponent } from './component/workspace/stat-panel/stat-panel.component';
import { ToolBarComponent } from './component/workspace/tool-bar/tool-bar.component';
import { UploadPanelComponent } from './component/workspace/upload-panel/upload-panel.component';
import { UploadFeedbackPanelComponent } from './component/workspace/upload-feedback-panel/upload-feedback-panel.component';
import { UserPanelComponent } from './component/workspace/user-panel/user-panel.component';
import { WorkspaceComponent } from './component/workspace/workspace.component';
// Effects
import { ComputeEffect } from './effect/compute.effect';
import { DataEffect } from './effect/data.effect';
import { SelectEffect } from './effect/select.effect';
import { MaterialModule } from './material.module';
// Reducers
import { reducers } from './reducer/index.reducer';
// Services
import { ComputeService } from './service/compute.service';
import { DataService } from './service/data.service';
import { DataHubService } from './service/datahub.service';
import { DatasetService } from './service/dataset.service';
import { HttpClient } from './service/http.client';
import { ModalService } from './service/modal-service';
import { ErrorService } from './service/error.service';
import { InfoPanelComponent } from './component/workspace/info-panel/info-panel.component';

import { ModalModule, BsModalRef } from 'ngx-bootstrap';
import { COMPUTE_TABLE_LOADER_COMPLETE} from './../app/action/compute.action';
import { MatDialogModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    ContentDialog,
    WorkspaceComponent,
    ApplicationBarComponent,
    BehaviorPanelComponent,
    CommonSidePanelComponent,
    WidgetComponent,
    SurvivalWidgetComponent,
    CopynumberWidgetComponent,
    DiffexpWidgetComponent,
    FilePanelComponent,
    EdgePanelComponent,
    LegendPanelComponent,
    LegendItemComponent,
    GraphPanelComponent,
    GenesetPanelComponent,
    StatPanelComponent,
    DataPanelComponent,
    UploadPanelComponent,
    UploadFeedbackPanelComponent,
    CohortPanelComponent,
    ChartComponent,
    DictionaryLearningFormComponent,
    LdaFormComponent,
    NmfFormComponent,
    TruncatedSvdFormComponent,
    FastIcaFormComponent,
    DaFormComponent,
    DeFormComponent,
    FaFormComponent,
    PcaFormComponent,
    UmapFormComponent,
    ScatterFormComponent,
    PlsFormComponent,
    PlsSvdFormComponent,
    PlsRegressionFormComponent,
    PlsCanonicalFormComponent,
    LinearSVCFormComponent,
    LinearSVRFormComponent,
    NuSVRFormComponent,
    NuSVCFormComponent,
    OneClassSVMFormComponent,
    SVRFormComponent,
    CCAFormComponent,
    TsneFormComponent,
    KMeansFormComponent,
    KmedianFormComponent,
    KmedoidFormComponent,
    ProteinFormComponent,
    MdsFormComponent,
    SavedPointsFormComponent,
    QuadradicDiscriminantAnalysisFormComponent,
    LinearDiscriminantAnalysisFormComponent,
    MiniBatchDictionaryLearningFormComponent,
    MiniBatchSparsePcaFormComponent,
    SomFormComponent,
    ChromosomeFormComponent,
    GenomeFormComponent,
    LinkedGeneFormComponent,
    HicFormComponent,
    TimelinesFormComponent,
    SurvivalFormComponent,
    HazardFormComponent,
    HeatmapFormComponent,
    DendogramFormComponent,
    BoxWhiskersFormComponent,
    ParallelCoordsFormComponent,
    HistogramFormComponent,
    PathwaysFormComponent,
    SvdFormComponent,
    IsoMapFormComponent,
    LocalLinearEmbeddingFormComponent,
    SpectralEmbeddingFormComponent,
    PcaIncrementalFormComponent,
    PcaKernalFormComponent,
    PcaSparseFormComponent,
    GeneSignaturePanelComponent,
    HelpPanelComponent,
    SummaryComponent,
    ClusteringAlgorithmPanelComponent,
    LandingPanelComponent,
    AnalysisPanelComponent,
    SettingsPanelComponent,
    AboutPanelComponent,
    CitationsPanelComponent,
    LoaderComponent,
    PathwayPanelComponent,
    DashboardPanelComponent,
    FeedbackPanelComponent,
    ToolBarComponent,
    ColorPanelComponent,
    QueryPanelComponent,
    QueryBuilderComponent,
    GraphPanelAnalysisComponent,
    GraphPanelVisualizationComponent,
    GraphPanelDataComponent,
    TipPanelComponent,
    UserPanelComponent,
    SelectionPanelComponent,
    InfoPanelComponent,
    PreprocessingPanelComponent
  ],

  imports: [
    HotTableModule.forRoot(),
    ModalModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MaterialModule,
    FileUploadModule,
    FormsModule,
    MatDialogModule,
    HttpModule,
    AppRoutingModule,
    ReactiveFormsModule,
    EffectsModule.forRoot([DataEffect, ComputeEffect, SelectEffect]),
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 10 //  Retains last 25 states 
    })
  ],
  providers: [
    Title,
    DataService,
    DatasetService,
    ComputeService,
    ChartFactory,
    HttpClient,
    ModalService,
    CbioService,
    DataHubService,
    {
      provide: ErrorHandler,
      useClass: ErrorService
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ContentDialog]
})
export class AppModule {}
