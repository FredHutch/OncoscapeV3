
import {distinctUntilChanged, debounceTime} from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DimensionEnum, DirtyEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory } from './../../../model/data-field.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { LinkedGeneConfigModel } from './linkedgenes.model';

@Component({
  selector: 'app-linked-gene-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<form [formGroup]='form' novalidate>
  <!--
  <div class='form-group'>
    <label class='center-block'><span class='form-label'>Gene Color</span>
      <select materialize='material_select'
          [compareWith]='byKey'
          [materializeSelectOptions]='colorOptions'
          formControlName='pointColor'>
          <option *ngFor='let option of colorOptions' [ngValue]='option'>{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class='form-group'>
    <label class='center-block'><span class='form-label'>Gene Size</span>
       <select materialize='material_select'
          [compareWith]='byKey'
          [materializeSelectOptions]='sizeOptions'
          formControlName='pointSize'>
          <option *ngFor='let option of sizeOptions' [ngValue]='option'>{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class='form-group'>
    <label class='center-block'><span class='form-label'>Gene Shape</span>
      <select materialize='material_select'
          [compareWith]='byKey'
          [materializeSelectOptions]='sizeOptions'
          formControlName='pointShape'>
          <option *ngFor='let option of shapeOptions' [ngValue]='option'>{{option.label}}</option>
      </select>
    </label>
  </div>
  <div class='form-group'>
    <label class='center-block'><span class='form-label'>Chromosomes</span>
       <select materialize='material_select'
          [compareWith]='byKey'
          [materializeSelectOptions]='chromosomeOptions'
          formControlName='chromosomeOption'>
          <option *ngFor='let option of chromosomeOptions' [value]='option'>{{option}}</option>
      </select>
    </label>
  </div>
  -->
</form>
  `
})
export class LinkedGeneFormComponent {

  @Input() set fields(fields: Array<DataField>) {
    if (fields === null) { return; }
    if (fields.length === 0) { return; }
    const defaultDataField: DataField = DataFieldFactory.getUndefined();
    this.colorOptions = DataFieldFactory.getSampleColorFields(fields);
    this.shapeOptions = DataFieldFactory.getSampleShapeFields(fields);
    this.sizeOptions = DataFieldFactory.getSampleSizeFields(fields);
  }

  @Input() set config(v: LinkedGeneConfigModel) {
    if (v === null) { return; }
    this.form.patchValue(v, { emitEvent: false });
  }

  @Output() configChange = new EventEmitter<GraphConfig>();

  form: FormGroup;
  colorOptions: Array<DataField>;
  shapeOptions: Array<DataField>;
  sizeOptions: Array<DataField>;
  dimensionOptions = [DimensionEnum.THREE_D, DimensionEnum.TWO_D];
  chromosomeOptions = ['Cytobands', 'Centromeres & Telemeres', 'None'];

  byKey(p1: DataField, p2: DataField) {
    if (p2 === null) { return false; }
    return p1.key === p2.key;
  }

  constructor(private fb: FormBuilder) {


    // Init Form
    this.form = this.fb.group({
      dirtyFlag: [0],
      visualization: [],
      graph: [],
      database: [],
      entity: [],
      table: [],
      pointColor: [],
      pointShape: [],
      pointSize: [],

      dimension: [],
      chromosomeOption: [],
      allowRotation: []
    });

    // Update When Form Changes
    this.form.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),)
      .subscribe(data => {
        let dirty = 0;
        const form = this.form;
        if (form.get('pointColor').dirty) { dirty |= DirtyEnum.COLOR; }
        // if (form.get('pointShape').dirty) { dirty |= DirtyEnum.SHAPE; }
        if (form.get('pointSize').dirty) { dirty |= DirtyEnum.SIZE; }
        if (dirty === 0) { dirty |= DirtyEnum.LAYOUT; }
        form.markAsPristine();
        data.dirtyFlag = dirty;
        this.configChange.emit(data);
      });
  }

}
