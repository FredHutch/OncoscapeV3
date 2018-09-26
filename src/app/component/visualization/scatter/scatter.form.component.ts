import { ScatterConfigModel } from './scatter.model';
import { AbstractScatterForm } from './../visualization.abstract.scatter.form';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-scatter-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scatter.form.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ScatterFormComponent extends AbstractScatterForm {
  @Input()
  set config(v: ScatterConfigModel) {
    if (v === null) {
      return;
    }
    this.form.patchValue(v, { emitEvent: false });
  }

  files = [
    { name: 'TSNE', uri: 'http://localhost:4200/assets/tsne.json' },
    { name: 'PCA', uri: 'http://localhost:4200/assets/pca.json' }
  ];

  constructor(private fb: FormBuilder) {
    super();

    this.form = this.fb.group({
      visualization: [],
      graph: [],
      database: [],
      table: [],
      pointData: [],
      uri: []
    });
    this.registerFormChange();

    // Update When Form Changes
    this.form.valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .subscribe(data => {
        this.configChange.emit(data);
      });
  }
}
