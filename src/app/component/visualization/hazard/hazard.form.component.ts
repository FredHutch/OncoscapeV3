import { MatCheckboxChange, MatSelectChange, MatSliderChange } from '@angular/material';
import { HazardConfigModel } from './hazard.model';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ChromosomeConfigModel } from './../chromosome/chromosome.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DimensionEnum, DataTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { DataField, DataFieldFactory } from './../../../model/data-field.model';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-hazard-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hazard.form.component.html',
  encapsulation: ViewEncapsulation.None
})
export class HazardFormComponent implements OnDestroy {

  @Output() configChange = new EventEmitter<GraphConfig>();

  _cohortSelected: any;
  _cohortOptions: Array<any>;
  _cohorts: Array<any>;

  private _config: HazardConfigModel;
  @Input() set config(v: HazardConfigModel) {
    this._config = v;
    if (this._cohorts !== undefined) {
      this.updateOptions();
    }
  }

  public get cohorts(): Array<any> { return this._cohorts; }
  @Input() public set cohorts(value: Array<any>) {
    this._cohorts = value;
    if (this._config !== undefined) {
      this.updateOptions();
    }
  }

  updateOptions(): void {
    const me = this;

    this._cohortOptions = this._cohorts
      .filter(v => (v.n !== this._config.cohortName))
      .map(v => ({ n: v.n, sel: (this._config.cohortsToCompare.indexOf(v.n) !== -1) }));
    requestAnimationFrame(() => {
      this.cd.markForCheck();
    });
  }

  compareChange(e: MatSliderChange): void {
    this._config.cohortsToCompare = this._cohortOptions.filter(v => v.sel).map(v => v.n);
    this.configChange.emit(this._config);
  }

  ngOnDestroy(): void { }

  constructor(public cd: ChangeDetectorRef) {
  }
}
