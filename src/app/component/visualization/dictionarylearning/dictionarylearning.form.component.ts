import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractScatterForm } from './../visualization.abstract.scatter.form';
import {
  DictionaryLearningConfigModel, DictionaryLearningFitAlgorithm,
  DictionaryLearningTransformAlgorithm
} from './dictionarylearning.model';

@Component({
  selector: 'app-dictionarylearning-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dictionarylearning.form.component.html'
})
export class DictionaryLearningFormComponent extends AbstractScatterForm {

  @Input() set config(v: DictionaryLearningConfigModel) {
    if (v === null) { return; }
    if (this.form.value.visualization === null) {
      this.form.patchValue(v, { emitEvent: false });
    }
  }

  fitAlgorithemOptions = [
    DictionaryLearningFitAlgorithm.CD, DictionaryLearningFitAlgorithm.LARS
  ];

  transformAlgorithemOptions = [
    DictionaryLearningTransformAlgorithm.LASSO_LARS,
    DictionaryLearningTransformAlgorithm.LASSO_CD,
    DictionaryLearningTransformAlgorithm.LARS,
    DictionaryLearningTransformAlgorithm.OMP,
    DictionaryLearningTransformAlgorithm.THRESHOLD
  ];


  constructor(private fb: FormBuilder) {

    super();

    this.form = this.fb.group({
      dirtyFlag: [0],
      visualization: [],
      graph: [],
      database: [],
      entity: [],
      markerFilter: [],
      markerSelect: [],
      sampleFilter: [],
      sampleSelect: [],
      patientFilter: [],
      patientSelect: [],
      table: [],

      pcx: [],
      pcy: [],
      pcz: [],
      n_components: [],
      dimension: [],
      alpha: [],
      max_iter: [],
      tol: [],
      fit_algorithm: [],
      transform_algorithm: [],
      split_sign: [],

      enableCohorts: [],
      enableGenesets: [],
      enablePathways: [],
      enableSupplemental: [],
      enableLabel: [],
      enableColor: [],
      enableShape: []
    });

    this.registerFormChange();
  }
}
