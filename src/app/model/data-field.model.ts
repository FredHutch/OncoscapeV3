import { GraphConfig } from 'app/model/graph-config.model';
import { CollectionTypeEnum, DataTypeEnum, EntityTypeEnum, ConnectionTypeEnum } from './enum.model';
import { DataField, DataTable } from './data-field.model';

/**
* Represents A Field In A DataSet
*/
export class DataFieldFactory {

  public static defaultDataField: DataField = DataFieldFactory.getUndefined();
  public static getMolecularLabelOptions(tables: Array<DataTable>): Array<DataField> {
    const lbls = DataFieldFactory.getMolecularColorFields(tables);
    lbls.splice(1, 0, DataFieldFactory.getGeneId());
    return lbls;
  }
  public static getConnectionColorFields(
    clinicalFields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum, entityB: EntityTypeEnum): Array<DataField> {
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    switch (connectionType) {
      case ConnectionTypeEnum.GENES_GENES:
      case ConnectionTypeEnum.GENES_PATIENTS:
      case ConnectionTypeEnum.GENES_SAMPLES:
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return [
          this.defaultDataField,
          ...this.getSampleColorFields(clinicalFields, EntityTypeEnum.SAMPLE)
        ];
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        break;
    }
    return [this.defaultDataField];
  }
  public static getConnectionGroupFields(
    clinicalFields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum, entityB: EntityTypeEnum): Array<DataField> {
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    switch (connectionType) {
      case ConnectionTypeEnum.GENES_GENES:
      case ConnectionTypeEnum.GENES_PATIENTS:
      case ConnectionTypeEnum.GENES_SAMPLES:
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return [DataFieldFactory.defaultDataField,
        ...this.getSampleColorFields(clinicalFields, EntityTypeEnum.SAMPLE)];
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        break;
    }
    return [];
  }
  public static getConnectionDataFields(
    clinicalFields: Array<DataField>,
    tables: Array<DataTable>,
    entityA: EntityTypeEnum, entityB: EntityTypeEnum): Array<DataField> {

    // {}
    // key: string;
    // label: string;
    // type: DataTypeEnum;
    // tbl: string;
    // values: any;
    // ctype: CollectionTypeEnum;
    const connectionType = ConnectionTypeEnum.createFromEntities(entityA, entityB);
    switch (connectionType) {
      case ConnectionTypeEnum.PATIENTS_PATIENTS:
        return [this.defaultDataField, this.getPatientId(), ...this.getCategoricalFields(clinicalFields)];
      case ConnectionTypeEnum.SAMPLES_SAMPLES:
        return [this.defaultDataField, this.getPatientId(), this.getSampleId()];
      case ConnectionTypeEnum.GENES_GENES:
        return [this.defaultDataField, this.getGeneId()];
      case ConnectionTypeEnum.SAMPLES_PATIENTS:
        return [this.defaultDataField, this.getPatientId()];
      case ConnectionTypeEnum.GENES_SAMPLES:
        return [this.defaultDataField, ...this.getMutationFields()];
      case ConnectionTypeEnum.GENES_PATIENTS:
        return [this.defaultDataField, ...this.getMutationFields()];
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
    const fields = ['Mean', 'Minimum', 'Maximum'].reduce((prev, metric) => prev.concat(...tablesMolec.map(tbl => (
      {
        key: metric,
        label: metric + ' ' + tbl.label,
        type: DataTypeEnum.NUMBER,
        tbl: tbl.tbl,
        values: null,
        ctype: tbl.ctype
      }
    ))), []);

    return [DataFieldFactory.defaultDataField,
    DataFieldFactory.getGeneType()
      // DataFieldFactory.getGeneFamily(),
      // DataFieldFactory.getHicType(),
      // DataFieldFactory.getTadType()
    ].concat(...fields);
  }

  public static getSampleLabelFields(clinicalFields: Array<DataField>, entity: EntityTypeEnum = EntityTypeEnum.SAMPLE): Array<DataField> {
    return [
      DataFieldFactory.defaultDataField,
      DataFieldFactory.getPatientId(),
      DataFieldFactory.getSampleId(),
      ...clinicalFields];
  }

  public static getSampleColorFields(clinicalFields: Array<DataField>, entity: EntityTypeEnum = EntityTypeEnum.SAMPLE): Array<DataField> {
    return [DataFieldFactory.defaultDataField, ...clinicalFields.filter(v => {
      switch (v.type) {
        case DataTypeEnum.STRING:
          return (v.values.length <= 10);
        case DataTypeEnum.NUMBER:
          return true;
      }
    })];

  }

  public static getSampleSizeFields(clinicalFields: Array<DataField>, entity: EntityTypeEnum = EntityTypeEnum.SAMPLE): Array<DataField> {
    return [DataFieldFactory.defaultDataField, ...clinicalFields.filter(v => {
      switch (v.type) {
        case DataTypeEnum.STRING:
          return (v.values.length <= 4);
        case DataTypeEnum.NUMBER:
          return true;
      }
    })];
  }

  public static getSampleShapeFields(clinicalFields: Array<DataField>, entity: EntityTypeEnum = EntityTypeEnum.SAMPLE): Array<DataField> {
    return [DataFieldFactory.defaultDataField, ...clinicalFields.filter(v => {
      switch (v.type) {
        case DataTypeEnum.STRING:
          return (v.values.length <= 8);
        case DataTypeEnum.NUMBER:
          return true;
      }
    })];
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

  public static getMutationFields(): Array<DataField> {
    return [];
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
