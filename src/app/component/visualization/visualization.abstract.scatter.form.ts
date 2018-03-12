import { AbstractScatterVisualization } from './visualization.abstract.scatter.component';
import { DimensionEnum } from './../../model/enum.model';
import { FormGroup } from '@angular/forms';
import { GraphConfig } from './../../model/graph-config.model';
import { Input, Output, EventEmitter } from '@angular/core';
import { CollectionTypeEnum, EntityTypeEnum, DataTypeEnum, DirtyEnum } from 'app/model/enum.model';
import { DataField, DataTable } from './../../model/data-field.model';
import { DataFieldFactory } from 'app/model/data-field.model';
export class AbstractScatterForm {

    @Input() fields: Array<DataField>;
    @Input() set tables(tables: Array<DataTable>) {
        this.dataOptions = tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0));
    }

    @Output() configChange = new EventEmitter<GraphConfig>();
    @Output() selectGeneSignature = new EventEmitter<GraphConfig>();
    @Output() selectClusteringAlgorithm = new EventEmitter<GraphConfig>();

    form: FormGroup;
    displayOptions = [EntityTypeEnum.SAMPLE, EntityTypeEnum.GENE];
    dataOptions: Array<DataTable>;
    dimensionOptions = [DimensionEnum.THREE_D, DimensionEnum.TWO_D, DimensionEnum.ONE_D];

    byKey(p1: DataField, p2: DataField) {
        if (p2 === null) { return false; }
        return p1.key === p2.key;
    }

    registerFormChange(): void {
        // Update When Form Changes
        
        this.form.valueChanges
            .debounceTime(500)
            .distinctUntilChanged()
            .subscribe(data => {
                const form = this.form;
                // if (dirty === 0) { dirty |= DirtyEnum.LAYOUT; }
                form.markAsPristine();
                // data.dirtyFlag = dirty;
                this.configChange.emit(data);
            });
    }
    constructor() {}
}
