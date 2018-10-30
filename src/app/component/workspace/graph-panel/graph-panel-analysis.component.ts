import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-graph-panel-analysis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
<mat-menu #analysisSummaryMenu='matMenu'>
  <button mat-menu-item (click)='select.emit(8796093022208)'>Dashboard</button>
  <!--<button mat-menu-item (click)='select.emit(4294967296)'>Box + Whiskers</button>-->
  <button mat-menu-item (click)='select.emit(32)'>Heatmap</button>
  <button mat-menu-item (click)='select.emit(1099511627776)'>Spreadsheet</button>
  </mat-menu>

  <mat-menu #analysisStructuralMenu='matMenu'>
  <button mat-menu-item (click)='select.emit(2147483648)'>Genome</button>
  <!--<button mat-menu-item (click)='select.emit(3)'>Chromosome</button>-->
  <button mat-menu-item (click)='select.emit(17179869184)'>Force Directed Graph</button>
  <button mat-menu-item (click)='select.emit(256)'>Pathways</button>
  </mat-menu>

  <mat-menu #analysisTreatmentMenu='matMenu'>
  <button mat-menu-item (click)='select.emit(16)'>Survival</button>
  <button mat-menu-item (click)='select.emit(4398046511104)'>Hazard</button>
  <button mat-menu-item (click)='select.emit(128)'>Timelines</button>
  </mat-menu>

  <mat-menu #analysisManifoldLearningMenu='matMenu'>
    <button mat-menu-item (click)='select.emit(35184372088832)'>Precomputed</button>
    <button mat-menu-item (click)='select.emit(134217728)'>Isomap</button>
    <!--<button mat-menu-item (click)='select.emit(268435456)'>Locally Linear Embedding</button>-->
    <button mat-menu-item (click)='select.emit(536870912)'>Spectral Embedding</button>
    <button mat-menu-item (click)='select.emit(8192)'>MDS</button>
    <button mat-menu-item (click)='select.emit(17592186044416)'>UMap</button>
    <button mat-menu-item (click)='select.emit(4)'>T-SNE</button>
  </mat-menu>

  <mat-menu #analysisCrossDecompositionMenu='matMenu'>
    <button mat-menu-item (click)='select.emit(562949953421312)'>CCA</button>
    <button mat-menu-item (click)='select.emit(140737488355328)'>PLS Regression</button>
    <button mat-menu-item (click)='select.emit(281474976710656)'>PLS Canonial</button>
    <button mat-menu-item (click)='select.emit(70368744177664)'>PLS SVD</button>
  </mat-menu>

  <mat-menu #analysisDiscriminantAnalysisMenu='matMenu'>
    <button mat-menu-item (click)='select.emit(137438953472)'>Linear Discriminant Analysis</button>
    <button mat-menu-item (click)='select.emit(274877906944)'>Quadratic Discriminant Analysis</button>
  </mat-menu>

  <mat-menu #analysisMatrixDecompositionMenu='matMenu'>
    <button mat-menu-item (click)='select.emit(16777216)'>Dictionary Learning</button>
    <!--<button mat-menu-item (click)='select.emit(34359738368)'>Dictionary Learning - Mini Batch</button>-->
    <button mat-menu-item (click)='select.emit(65536)'>Factor Analysis</button>
    <button mat-menu-item (click)='select.emit(8388608)'>Fast ICA</button>
    <!--<button mat-menu-item (click)='select.emit(33554432)'>Latent Dirichlet Allocation</button>-->
    <!--<button mat-menu-item (click)='select.emit(67108864)'>Non-Negative Matrix Factorization</button>-->
    <button mat-menu-item (click)='select.emit(1)'>PCA</button>
    <button mat-menu-item (click)='select.emit(262144)'>PCA - Incremental</button>
    <button mat-menu-item (click)='select.emit(524288)'>PCA - Kernel</button>
    <button mat-menu-item (click)='select.emit(1048576)'>PCA - Sparse</button>
    <!--<button mat-menu-item (click)='select.emit(68719476736)'>PCA - Sparse - Mini Batch</button>
    <!--<button mat-menu-item (click)='select.emit(2199023255552)'>PCA - Sparse Coder</button>-->
    <button mat-menu-item (click)='select.emit(131072)'>Truncated SVD</button>
  </mat-menu>

  <mat-menu #analysisSupportVectorMachinesMenu='matMenu'>
    <button mat-menu-item (click)='select.emit(1.12589990684262E15)'>Linear SVC</button>
    <button mat-menu-item (click)='select.emit(2.25179981368524E15)'>Linear SVR</button>
    <button mat-menu-item (click)='select.emit(9.00719925474096E15)'>Nu SVR</button>
    <button mat-menu-item (click)='select.emit(4.50359962737048E15)'>Nu SVC</button>
    <button mat-menu-item (click)='select.emit(1.439850948E27)'>One Class SVM</button>
    <button mat-menu-item (click)='select.emit(2.879701896E27)'>SVR</button>
    <button mat-menu-item>SVC</button>
  </mat-menu>

  <mat-menu #analysisMenu='matMenu'>
    <button mat-menu-item [matMenuTriggerFor]='analysisSummaryMenu'>Summary</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisStructuralMenu'>Structural</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisTreatmentMenu'>Treatment</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisMatrixDecompositionMenu'>Matrix Decomposition</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisDiscriminantAnalysisMenu'>Discriminant Analysis</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisSupportVectorMachinesMenu'>Support Vector Machines</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisManifoldLearningMenu'>Dimension Reduction</button>
    <button mat-menu-item [matMenuTriggerFor]='analysisCrossDecompositionMenu'>Cross Decomposition</button>
  </mat-menu>
  <a class='os-link' href='#' [matMenuTriggerFor]='analysisMenu'>Change Visualization</a>
  `
})
export class GraphPanelAnalysisComponent {
  @Output()
  select: EventEmitter<any> = new EventEmitter();
}
