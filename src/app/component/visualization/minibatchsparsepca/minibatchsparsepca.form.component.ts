import { DimensionEnum, EntityTypeEnum, CollectionTypeEnum } from './../../../model/enum.model';
import { AbstractScatterForm } from './../visualization.abstract.scatter.form';
import { GraphConfig } from './../../../model/graph-config.model';
import { MiniBatchSparsePcaConfigModel, MiniBatchSparsePcaMethod } from './minibatchsparsepca.model';
import { DataTypeEnum, DirtyEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory, DataTable } from './../../../model/data-field.model';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import * as _ from 'lodash';
import { SvmCompleteAction } from '../../../action/compute.action';

@Component({
  selector: 'app-minibatchsparsepca-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<form [formGroup]="form" novalidate>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Data</span>
      <select class="browser-default" materialize="material_select"
      [compareWith]="byKey"
      formControlName="table">
      <option *ngFor="let option of dataOptions">{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Display</span>
      <select class="browser-default" materialize="material_select"
          formControlName="entity">
          <option *ngFor="let option of displayOptions">{{option}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Color</span>
      <select class="browser-default" materialize="material_select"
          [compareWith]="byKey"
          [materializeSelectOptions]="colorOptions"
          formControlName="pointColor">
          <option *ngFor="let option of colorOptions"
            [ngValue]="option">{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Size</span>
      <select class="browser-default" materialize="material_select"
          [compareWith]="byKey"
          [materializeSelectOptions]="sizeOptions"
          formControlName="pointSize">
          <option *ngFor="let option of sizeOptions"
            [ngValue]="option">{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Shape</span>
      <select class="browser-default" materialize="material_select"
          [compareWith]="byKey"
          [materializeSelectOptions]="colorOptions" formControlName="pointShape">
          <option *ngFor="let option of shapeOptions"
            [ngValue]="option">{{option.label}}</option>
      </select>
    </label>
  </div>
   <div class="form-group">
    <label class="center-block"><span class="form-label">Dimension</span>
      <select class="browser-default" materialize="material_select"
        [materializeSelectOptions]="dimensionOptions"
        formControlName="dimension">
          <option *ngFor="let options of dimensionOptions">{{options}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <label class="center-block"><span class="form-label">Method</span>
     <select class="browser-default" materialize="material_select"
      [materializeSelectOptions]="MiniBatchSparsePcaMethodOpitions"
      formControlName="sk_method">
        <option *ngFor="let options of MiniBatchSparsePcaMethodOpitions" [ngValue]="options">{{options}}</option>
      </select>
    </label>
  </div>
  <div class="form-group">
    <div class="switch">
      <label>
        <input type="checkbox" formControlName="shuffle">
        <span class="lever"></span>
        Shuffle
      </label>
    </div>
  </div>
</form>
  `
})
export class MiniBatchSparsePcaFormComponent extends AbstractScatterForm {

  @Input() set config(v: MiniBatchSparsePcaConfigModel) {
    if (v === null) { return; }
    if (this.form.value.visualization === null) {
      this.form.patchValue(v, { emitEvent: false });
    }
  }

  MiniBatchSparsePcaMethodOpitions = [
    MiniBatchSparsePcaMethod.LARS,
    MiniBatchSparsePcaMethod.CD
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
      table: [],
      pointColor: [],
      pointShape: [],
      pointSize: [],

      n_components: [],
      alpha: [],
      ridge_alpha: [],
      n_iter: [],
      batch_size: [],
      shuffle: [],
      sk_method: []
    });

    this.registerFormChange();
  }
}
