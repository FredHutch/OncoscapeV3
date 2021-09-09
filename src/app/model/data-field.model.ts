import { DataField, DataTable } from './data-field.model';
import { CollectionTypeEnum } from './enum.model';
import { ConnectionTypeEnum } from './enum.model';
import { DataTypeEnum } from './enum.model';
import { EntityTypeEnum } from './enum.model';

/**
 * Represents A Field In A DataSet
 */
export class DataFieldFactory {
  public static defaultDataField: DataField = DataFieldFactory.getUndefined();
  public static getMolecularLabelOptions(tables: Array<DataTable>): Array<DataField> {
    let lbls = DataFieldFactory.getMolecularColorFields(tables);
    lbls.splice(1, 0, DataFieldFactory.getGeneId());
    lbls = lbls.filter(v => !(v.key === 'Mean' || v.key === 'Minimum' || v.key === 'Maximum'));
    return lbls;
  }

  public static dataFieldColors = [
    0xd81b60,
    0x3949ab,
    0x43a047,
    0xffb300,
    0x6d4c41,
    0xf44336,
    0x9c27b0,
    // too blue, conflicts with 1st of Category10 below. 0x2196f3,

    // Those weren't enough, so these are added. They are "Category10" from https://observablehq.com/@d3/color-schemes.
    0x1f77b4, 
    0xff7f0e, 
    0x2ca02c, 
    0xd62728, 
    0x9467bd, 
    0x8c564b, 
    0xe377c2, 
    0x7f7f7f, 
    0xbcbd22, 
    0x17becf,

    // Now add more, let's have 20?
    0xdddddd,
    0xbbbbbb,
    0x888888,
    0x666666,
    0x444444,
    0x222222,
    0x00dddd,
    0x00bbbb,
    0x008888,
    0x006666,
    0x004444,
    0x002222
  ];

  public static getConnectionColorFields(
    fields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum
  ): Array<DataField> {
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    switch (connectionType) {
      case ConnectionTypeEnum.GENES_GENES:
      case ConnectionTypeEnum.GENES_PATIENTS:
      case ConnectionTypeEnum.GENES_SAMPLES:
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return this.getSampleColorFields(fields, EntityTypeEnum.SAMPLE);
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        return this.getSampleColorFields(fields, EntityTypeEnum.SAMPLE);
    }
    return [this.defaultDataField];
  }
  public static getConnectionGroupFields(
    fields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum
  ): Array<DataField> {
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    switch (connectionType) {
      case ConnectionTypeEnum.GENES_GENES:
      case ConnectionTypeEnum.GENES_PATIENTS:
      case ConnectionTypeEnum.GENES_SAMPLES:
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return this.getSampleColorFields(fields, EntityTypeEnum.SAMPLE);
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        return this.getSampleColorFields(fields, EntityTypeEnum.SAMPLE);
    }
    return [];
  }
  public static getConnectionDataFields(
    fields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum
  ): Array<DataField> {
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    let allFields;
    switch (connectionType) {
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
        return [this.defaultDataField, this.getPatientId(), ...this.getCategoricalFields(fields)];
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return [this.defaultDataField, this.getPatientId(), this.getSampleId()];
      case ConnectionTypeEnum.GENES_GENES:
        return [this.defaultDataField, this.getGeneId()];
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        return [this.defaultDataField, this.getPatientId()];
      case ConnectionTypeEnum.GENES_SAMPLES:
        allFields = this.getCopynumberFields().concat(this.getMutationFields());
        return [this.defaultDataField, ...allFields];
      case ConnectionTypeEnum.GENES_PATIENTS:
        allFields = this.getCopynumberFields().concat(this.getMutationFields());
        return [this.defaultDataField, ...allFields];
    }
    return [];
  }
  public static getMolecularShapeFields(tables: Array<DataTable>): Array<DataField> {
    return DataFieldFactory.getMolecularColorFields(tables);
  }
  public static getMolecularSizeFields(tables: Array<DataTable>): Array<DataField> {
    return DataFieldFactory.getMolecularColorFields(tables);
  }
  public static getMolecularColorFields(tables: Array<DataTable>): Array<DataField> {
    const tablesMolec = tables.filter(tbl => tbl.ctype & CollectionTypeEnum.MOLEC_DATA_FIELD_TABLES);
    const fields = ['Mean', 'Minimum', 'Maximum'].reduce(
      (prev, metric) =>
        prev.concat(
          ...tablesMolec.map(tbl => ({
            key: metric,
            label: metric + ' ' + tbl.label,
            type: DataTypeEnum.NUMBER,
            tbl: tbl.tbl,
            values: null,
            ctype: tbl.ctype
          }))
        ),
      []
    );

    return [
      DataFieldFactory.defaultDataField,
      DataFieldFactory.getGeneType()
      // DataFieldFactory.getGeneFamily(),
      // DataFieldFactory.getHicType(),
      // DataFieldFactory.getTadType()
    ].concat(...fields);
  }

  public static getSampleLabelFields(
    clinicalFields: Array<DataField>,
    entity: EntityTypeEnum = EntityTypeEnum.SAMPLE
  ): Array<DataField> {
    return [
      DataFieldFactory.defaultDataField,
      DataFieldFactory.getPatientId(),
      DataFieldFactory.getSampleId(),
      ...clinicalFields
    ];
  }

  public static getSampleColorFields(
    clinicalFields: Array<DataField>,
    entity: EntityTypeEnum = EntityTypeEnum.SAMPLE
  ): Array<DataField> {
    return [
      DataFieldFactory.defaultDataField,
      ...clinicalFields.filter(v => {
        switch (v.type) {
          case DataTypeEnum.STRING:
            return v.values.length <= DataFieldFactory.dataFieldColors.length;
          case DataTypeEnum.NUMBER:
            return true;
        }
      })
    ];
  }

  public static getSampleSizeFields(
    clinicalFields: Array<DataField>,
    entity: EntityTypeEnum = EntityTypeEnum.SAMPLE
  ): Array<DataField> {
    return [
      DataFieldFactory.defaultDataField,
      ...clinicalFields.filter(v => {
        switch (v.type) {
          case DataTypeEnum.STRING:
            return v.values.length <= 4;
          case DataTypeEnum.NUMBER:
            return true;
        }
      })
    ];
  }

  public static getSampleShapeFields(
    clinicalFields: Array<DataField>,
    entity: EntityTypeEnum = EntityTypeEnum.SAMPLE
  ): Array<DataField> {
    return [
      DataFieldFactory.defaultDataField,
      ...clinicalFields.filter(v => {
        switch (v.type) {
          case DataTypeEnum.STRING:
            return v.values.length <= 8;
          case DataTypeEnum.NUMBER:
            return true;
        }
      })
    ];
  }

  public static getCategoricalFields(clinicalFields: Array<DataField>): Array<DataField> {
    return clinicalFields.filter(v => v.type === DataTypeEnum.STRING);
  }

  public static getContinuousFields(clinicalFields: Array<DataField>): Array<DataField> {
    return clinicalFields.filter(v => v.type === DataTypeEnum.NUMBER);
  }

  public static getIntersectFields(clinicalFields: Array<DataField>): Array<DataField> {
    return DataFieldFactory.getSampleShapeFields(clinicalFields);
  }

  private static _lastLoadedMutationFields = null;

  // Store them locally, after loading non-TCGA dataset.
  public static setMutationFields(values:Array<string>) {
    DataFieldFactory._lastLoadedMutationFields = values;
  }

  public static getCopynumberFields():Array<DataField>{
    let arrayOfCNVariants:Array<string> = [
      'Amp',
      'Gain',
      'Loss',
      'Deletion'
    ];

    return arrayOfCNVariants.map(v => {
      return {
        key: v,
        label: v.replace(/_/gi, ''),
        type: DataTypeEnum.STRING,
        tbl: 'cna',
        values: null,
        ctype: CollectionTypeEnum.CNV
      };
    });
  }

  public static getMutationFields(): Array<DataField> {
    let arrayOfMutVariants:Array<string> = [
      'Frame_Shift_Del',
      'Frame_Shift_Ins',
      'In_Frame_Del',
      'In_Frame_Ins',
      'Missense',
      'Nonsense_Mutation',
      'Nonstop_Mutation',
      'Silent',
      'Splice_Site',
      'Translation_Start_Site'
    ];

    if (DataFieldFactory._lastLoadedMutationFields) {
      arrayOfMutVariants = DataFieldFactory._lastLoadedMutationFields;
    }

    // STTR-195 - Add "All Point Mutations" 
    arrayOfMutVariants.unshift('All Point Mutations'); 
    return arrayOfMutVariants.map(v => {
      return {
        key: v,
        label: v.replace(/_/gi, ''),
        type: DataTypeEnum.STRING,
        tbl: 'mut',
        values: null,
        ctype: CollectionTypeEnum.MUTATION
      };
    });
  }

  public static getGeneFamily(): DataField {
    return {
      key: 'GeneFamily',
      label: 'Gene Family',
      type: DataTypeEnum.FUNCTION,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.GENE_FAMILY
    };
  }

  public static getGeneId(): DataField {
    return {
      key: 'mid',
      label: 'HGNC Symbol',
      type: DataTypeEnum.FUNCTION,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.GENE_NAME
    };
  }

  public static getPatientId(): DataField {
    return {
      key: 'pid',
      label: 'Patient Id',
      type: DataTypeEnum.STRING,
      tbl: 'patient',
      values: null,
      ctype: CollectionTypeEnum.SAMPLE
    };
  }

  public static getSampleId(): DataField {
    return {
      key: 'sid',
      label: 'Sample Id',
      type: DataTypeEnum.STRING,
      tbl: 'patient',
      values: null,
      ctype: CollectionTypeEnum.SAMPLE
    };
  }

  public static getGeneType(): DataField {
    return {
      key: 'GeneType',
      label: 'Gene Type',
      type: DataTypeEnum.FUNCTION,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.GENE_TYPE
    };
  }

  public static getTadType(): DataField {
    return {
      key: 'tad',
      label: 'Tad',
      type: DataTypeEnum.FUNCTION,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.TAD
    };
  }
  public static getHicType(): DataField {
    return {
      key: 'hic',
      label: 'Hi-C',
      type: DataTypeEnum.FUNCTION,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.HIC
    };
  }

  public static getUndefined(): DataField {
    return {
      key: 'None',
      label: 'None',
      type: DataTypeEnum.UNDEFINED,
      tbl: null,
      values: null,
      ctype: CollectionTypeEnum.UNDEFINED
    };
  }
}

export interface DataTable {
  tbl: string;
  label: string;
  map: string;
  ctype: CollectionTypeEnum;
}
export interface DataField {
  key: string;
  label: string;
  type: DataTypeEnum;
  tbl: string;
  values: any;
  ctype: CollectionTypeEnum;
}
