import { environment } from "../../environments/environment";
import {
  iStudyDetails,
  UserDataSet,
  iDataSet
} from "../dataInterfacesAndEnums";
import { zip as observableZip, from as observableFrom } from 'rxjs';
/// <reference types="aws-sdk" />
import { Injectable } from '@angular/core';
import { QueryBuilderConfig } from 'app/component/workspace/query-panel/query-builder/query-builder.interfaces';
import {
  CollectionTypeEnum,
  EntityTypeEnum,
  SpriteMaterialEnum,
  VisualizationEnum,
  DataTypeEnum
} from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import * as d3 from 'd3';
import Dexie from 'dexie';
import * as JStat from 'jstat';

import { Observable } from 'rxjs/Rx';
import { Legend } from '../model/legend.model';
import { Pathway } from '../model/pathway.model';
import { ChartFactory } from './../component/workspace/chart/chart.factory';
import { Cohort } from './../model/cohort.model';
import { DataField, DataTable } from './../model/data-field.model';
import { 
  DataDecorator, DataDecoratorTypeEnum,
  LegendFilter } from './../model/data-map.model';
import { GeneSet } from './../model/gene-set.model';
import { Preprocessing, PreprocessingStep } from './../model/preprocessing.model';
import { SavedPointsWrapper } from './../component/visualization/savedpoints/savedpoints.model';
import { StatOneD } from "app/model/stat.model";
import { OncoData } from 'app/oncoData';

@Injectable()
export class DataService {
  public static db: Dexie;
  public static instance: DataService;
 
  public static cognitoSessionTimeLeft(): number {
    if (window['storedAuthBits'] ) {
      let nowSeconds:number = Math.floor((new Date().getTime() / 1000));
      let secondsLeft:number = window['storedAuthBits'].accessToken.getExpiration()  - nowSeconds;
      return secondsLeft;
    } else {
      return 0; // We haven't authorized yet, so no auth time is left.
    }
  }

  // tslint:disable-next-line:max-line-length
  public static biotypeMap = {
    protein_coding: 'Protein Coding',
    polymorphic_pseudogene: 'Protein Coding',
    ig_v_gene: 'Protein Coding',
    tr_v_gene: 'Protein Coding',
    tr_c_gene: 'Protein Coding',
    tr_j_gene: 'Protein Coding',
    tr_d_gene: 'Protein Coding',
    ig_c_gene: 'Protein Coding',
    ig_d_gene: 'Protein Coding',
    ig_j_gene: 'Protein Coding',
    ig_v_pseudogene: 'Pseudogene',
    transcribed_unprocessed_pseudogene: 'Pseudogene',
    processed_pseudogene: 'Pseudogene',
    unprocessed_pseudogene: 'Pseudogene',
    transcribed_processed_pseudogene: 'Pseudogene',
    unitary_pseudogene: 'Pseudogene',
    ig_pseudogene: 'Pseudogene',
    ig_c_pseudogene: 'Pseudogene',
    ig_j_pseudogene: 'Pseudogene',
    tr_j_pseudogene: 'Pseudogene',
    tr_v_pseudogene: 'Pseudogene',
    transcribed_unitary_pseudogene: 'Pseudogene',
    antisense: 'Long Noncoding',
    sense_intronic: 'Long Noncoding',
    lincrna: 'Long Noncoding',
    sense_overlapping: 'Long Noncoding',
    processed_transcript: 'Long Noncoding',
    '3prime_overlapping_ncrna': 'Long Noncoding',
    non_coding: 'Long Noncoding',
    rrna: 'Short Noncoding',
    misc_rna: 'Short Noncoding',
    pseudogene: 'Short Noncoding',
    snorna: 'Short Noncoding',
    scrna: 'Short Noncoding',
    mirna: 'Short Noncoding',
    snrna: 'Short Noncoding',
    srna: 'Short Noncoding',
    ribozyme: 'Short Noncoding',
    scarna: 'Short Noncoding',
    vaultrna: 'Short Noncoding',
    tec: 'Other',
    bidirectional_promoter_lncrna: 'Other',
    macro_lncrna: 'Other'
  };
  public static biotypeCat = ['Protein Coding', 'Pseudogene', 'Long Noncoding', 'Short Noncoding', 'Other'];

  public static headersJson = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
    'Access-Control-Allow-Origin': '*'
  };

  private _privateData = {
    database: '',
    tbl: '',
    patientMap: {},
    sampleMap: {},
    data: []
  };

  getGenomeManifest(): Promise<any> {
    return fetch('https://oncoscape.v3.sttrcancer.org/data/genomes/manifest.json.gz', {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }
  getGenome(file): Promise<any> {
    return fetch('https://oncoscape.v3.sttrcancer.org/data/genomes/' + file + '.gz', {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }

  getVisualizationTip(v: VisualizationEnum): Promise<any> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept-Encoding', 'gzip');
    const requestInit: RequestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };

    // Make map from VisualizationEnum To FileName
    let jsonFile = this.getTipFileFromVisualization(v);
    if (jsonFile === null) {
      jsonFile = 'pathways.json';
    }
    return fetch('./assets/tips/' + jsonFile, requestInit).then(res => res.json());
  }

  getMutationData(database, tbl): Promise<Array<any>> {
    return new Promise(resolve => {
      // if (this._privateData.database === database && this._privateData.tbl === tbl) {
      //   resolve(this._privateData);
      // } else {
        new Dexie(database).open().then(db => {
          db.table(tbl)
          .toArray()
          .then(results => {
            resolve(results);
            return;
          })
        });
      //}
    });
  }

  getPatientData(database, tbl): Promise<any> {
    return new Promise(resolve => {
      if (this._privateData.database === database && this._privateData.tbl === tbl) {
        resolve(this._privateData);
      } else {
        new Dexie(database).open().then(db => {
          Promise.all([db.table(tbl).toArray(), db.table('patientSampleMap').toArray()]).then(results => {
            this._privateData.database = database;
            this._privateData.tbl = tbl;
            this._privateData.data = results[0];
            this._privateData.sampleMap = results[1].reduce((p, c) => {
              p[c.s] = c.p;
              return p;
            }, {});
            this._privateData.patientMap = results[1].reduce((p, c) => {
              p[c.p] = c.s;
              return p;
            }, {});
            db.close();
            resolve(this._privateData);
          });
        });
      }
    });
  }

  private getGroupScale(items: Array<any>, field: DataField): Function {
    if (field.type !== 'STRING') {
      // // Determine IQR
      const data = items.map(v => v[field.key]);
      const upperLimit = Math.max.apply(Math, data);
      const lowerLimit = Math.min.apply(Math, data);
      // const bins = d3.thresholdFreedmanDiaconis(data, lowerLimit, upperLimit);
      // const bins = d3.thresholdScott(data, lowerLimit, upperLimit);
      let bins = 0;
      if (upperLimit - lowerLimit < 8) {
        bins = Math.ceil(upperLimit - lowerLimit) + 1;
      } else {
        bins = d3.thresholdSturges(data);
        if (bins > 8) {
          bins = 8;
        }
      }
      return ChartFactory.getScaleGroupLinear(lowerLimit, upperLimit, bins);
    }
    return ChartFactory.getScaleGroupOrdinal(field.values);
  }

  private getSizeScale(items: Array<any>, field: DataField): Function {
    if (field.type !== 'STRING') {
      // // Determine IQR
      console.log('configure getSizeScale for ' + field);
      const data = items.map(v => v[field.key]);
      const upperLimit = Math.max.apply(Math, data);
      const lowerLimit = Math.min.apply(Math, data);
      // const bins = d3.thresholdFreedmanDiaconis(data, lowerLimit, upperLimit);
      // const bins = d3.thresholdScott(data, lowerLimit, upperLimit);
      let bins = 0;
      if (upperLimit - lowerLimit < 8) {
        bins = Math.ceil(upperLimit - lowerLimit) + 1;
      } else {
        bins = d3.thresholdSturges(data);
        if (bins > 8) {
          bins = 8;
        }
      }
      return ChartFactory.getScaleGroupLinear(lowerLimit, upperLimit, bins);
    }
    return ChartFactory.getScaleGroupOrdinal(field.values);
  }

  private getShapeScale(items: Array<any>, field: DataField): Function {
    if (field.type !== 'STRING') {
      // // Determine IQR
      const data = items.map(v => v[field.key]);
      let upperLimit = field.values ? field.values.max : Math.max.apply(Math, data);
      let lowerLimit = field.values ? field.values.min : Math.min.apply(Math, data);
      if (upperLimit < lowerLimit) {
        const temp = upperLimit;
        upperLimit = lowerLimit;
        lowerLimit = temp;
      }
      // const bins = d3.thresholdFreedmanDiaconis(data, lowerLimit, upperLimit);
      // const bins = d3.thresholdScott(data, lowerLimit, upperLimit);
      let bins = 0;
      if (upperLimit - lowerLimit < 8) {
        bins = Math.ceil(upperLimit - lowerLimit) + 1;
      } else {
        bins = d3.thresholdSturges(data);
        if (bins > 8) {
          bins = 8;
        }
      }
      return ChartFactory.getScaleShapeLinear(lowerLimit, upperLimit, bins);
    }
    return ChartFactory.getScaleShapeOrdinal(field.values);
  }
  private getColorScale(items: Array<any>, field: DataField): Function {
    if (field.type !== 'STRING') {
      // // Determine IQR
      const data = items.map(v => v[field.key]);
      let upperLimit = field.values ? field.values.max : Math.max.apply(Math, data);
      let lowerLimit = field.values ? field.values.min : Math.min.apply(Math, data);
      if (upperLimit < lowerLimit) {
        const temp = upperLimit;
        upperLimit = lowerLimit;
        lowerLimit = temp;
      }
      // const bins = d3.thresholdFreedmanDiaconis(data, lowerLimit, upperLimit);
      // const bins = d3.thresholdScott(data, lowerLimit, upperLimit);
      let bins = 0;
      if (upperLimit - lowerLimit < 8) {
        bins = Math.ceil(upperLimit - lowerLimit) + 1;
      } else {
        bins = d3.thresholdSturges(data);
        if (bins > 8) {
          bins = 8;
        }
      }
      return ChartFactory.getScaleColorLinear(lowerLimit, upperLimit, bins);
    }
    return ChartFactory.getScaleColorOrdinal(field.values);
  }

  private createMolecularDataDecorator(config: GraphConfig, decorator: DataDecorator): Observable<any> {
    if (decorator.field.ctype === CollectionTypeEnum.GENE_NAME) {
      return observableFrom(
        new Promise(resolve => {
          new Dexie('notitia').open().then(db => {
            db.table('genecoords')
              .where('gene')
              .anyOf(config.markerFilter)
              .toArray()
              .then(results => {
                decorator.values = results
                  .map(v => ({
                    pid: null,
                    sid: null,
                    mid: v.gene,
                    key: EntityTypeEnum.GENE,
                    label: v.gene,
                    value: v.gene
                  }))
                  .filter(v => v.label);
                // db.close();
                resolve(decorator);
                return;
              });
          });
        })
      );
    }

    // Type Dec
    if (decorator.field.ctype === CollectionTypeEnum.GENE_TYPE) {
      return observableFrom(
        new Promise(resolve => {
          new Dexie('notitia').open().then(db => {
            db.table('genecoords')
              .where('gene')
              .anyOfIgnoreCase(...config.markerFilter)
              .toArray()
              .then(results => {
                if (decorator.type === DataDecoratorTypeEnum.LABEL) {
                  decorator.values = results
                    .map(v => ({
                      pid: null,
                      sid: null,
                      mid: v.gene,
                      key: EntityTypeEnum.GENE,
                      label: DataService.biotypeMap[v.type],
                      value: DataService.biotypeMap[v.type]
                    }))
                    .filter(v => v.label);
                  // Labels don't need legends
                  // db.close();
                  resolve(decorator);
                  return;
                }
                const scale =
                  decorator.type === DataDecoratorTypeEnum.SHAPE
                    ? ChartFactory.getScaleShapeOrdinal(DataService.biotypeCat)
                    : ChartFactory.getScaleColorOrdinal(DataService.biotypeCat);
                decorator.values = results
                  .map(v => ({
                    pid: null,
                    sid: null,
                    mid: v.gene,
                    key: EntityTypeEnum.GENE,
                    label: DataService.biotypeMap[v.type],
                    value: scale(DataService.biotypeMap[v.type])
                  }))
                  .filter(v => v.label);
                decorator.legend = new Legend();
                decorator.legend.type = decorator.type === DataDecoratorTypeEnum.SHAPE ? 'SHAPE' : 'COLOR';
                decorator.legend.display = 'DISCRETE';
                decorator.legend.labels = scale['domain']().filter(v => v);
                decorator.legend.values = decorator.legend.values = scale['range']();
                if (decorator.type === DataDecoratorTypeEnum.COLOR) {
                  decorator.legend.values = decorator.legend.values.map(v => '#' + v.toString(16));
                }

                // db.close();
                resolve(decorator);
              });
          });
        })
      );
    }

    // Min Max Dec
    return observableFrom(
      new Promise(resolve => {
        new Dexie('notitia-' + config.database).open().then(db => {
          db.table(decorator.field.tbl.replace(/\s/gi, ''))
            .where('m')
            .anyOfIgnoreCase(config.markerFilter)
            .toArray()
            .then(results => {
              const prop =
                decorator.field.key === 'Minimum' ? 'min' : decorator.field.key === 'Maximum' ? 'max' : 'mean';
              let scale;
              switch (decorator.type) {
                case DataDecoratorTypeEnum.COLOR:
                  scale = this.getColorScale(results, Object.assign({}, decorator.field, { key: prop }));
                  decorator.values = results.map(v => ({
                    pid: null,
                    sid: null,
                    mid: v.m,
                    key: EntityTypeEnum.GENE,
                    label: v[prop],
                    value: scale(v[prop])
                  }));
                  decorator.legend = new Legend();
                  decorator.legend.type = 'COLOR';
                  decorator.legend.display = 'DISCRETE';
                  decorator.legend.name = 'Gene ' + decorator.field.label;
                  decorator.legend.labels = scale['range']().map(v =>
                    scale['invertExtent'](v)
                      .map(w => Math.round(w))
                      .join(' to ')
                  );
                  if (!decorator.legend.labels.find(v => v === 'NA')) {
                    decorator.legend.labels.concat(['NA']);
                  }
                  if(decorator.legend.labels.length = decorator.legend.values.length+1){
                    decorator.legend.values = scale['range']().concat(['#DDDDDD']);
                  }
             
                  break;

                case DataDecoratorTypeEnum.SHAPE:
                  // scale = ChartFactory.getScaleShapeLinear(minMax[0], minMax[1]);
                  scale = this.getShapeScale(results, Object.assign({}, decorator.field, { key: prop }));
                  decorator.values = results.map(v => ({
                    pid: null,
                    sid: null,
                    mid: v.m,
                    key: EntityTypeEnum.GENE,
                    label: v[prop],
                    value: scale(v[prop])
                  }));
                  decorator.legend = new Legend();
                  decorator.legend.type = 'SHAPE';
                  decorator.legend.display = 'DISCRETE';
                  decorator.legend.name = 'Gene ' + decorator.field.label;
                  decorator.legend.labels = scale['range']().map(v =>
                    scale['invertExtent'](v)
                      .map(w => Math.round(w))
                      .join(' to ')
                  );
                  if (!decorator.legend.labels.find(v => v === 'NA')) {
                    decorator.legend.labels.concat(['NA']);
                  }
                  if(decorator.legend.labels.length = decorator.legend.values.length+1){
                    decorator.legend.values = scale['range']().concat(['#DDDDDD']);
                  }
                  break;
              }
              // db.close();
              resolve(decorator);
            });
        });
      })
    );
  }

  private createSampleDataDecorator(config: GraphConfig, decorator: DataDecorator): Observable<any> {
    const formatLabel = (field: DataField, value: any): string => {
      if (value === null || value === undefined) {
        return 'NA';
      }
      let rv = value;
      switch (field.type) {
        case DataTypeEnum.NUMBER:
          return (Math.round(1000 * rv) / 1000).toString();
        case DataTypeEnum.STRING:
          rv = String(rv).trim();
          if (rv === 'undefined') {
            rv = 'NA';
          }
          break;
      }
      return rv;
    };
    const formatValue = (field: DataField, value: any): any => {
      let rv = value;
      switch (field.type) {
        case DataTypeEnum.STRING:
          rv = String(rv).trim();
          if (rv === 'undefined') {
            rv = 'NA';
          }
          break;
      }
      return rv;
    };

    decorator.field.key = decorator.field.key.toLowerCase().trim();

    return observableFrom(
      new Promise(resolve => {
        this.getPatientData('notitia-' + config.database, decorator.field.tbl)
        .then(result => {
          const items = result.data;
          const psMap = result.patientMap;
          let scale: Function;
          switch (decorator.type) {
            case DataDecoratorTypeEnum.LABEL:
              if (decorator.field.key === 'pid') {
                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: result.sampleMap[sid],
                    value: result.sampleMap[sid]
                  };
                });
              } else if (decorator.field.key === 'sid') {
                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: sid,
                    value: sid
                  };
                });
              } else { 
                if (decorator.field.tbl === 'sample') {
                  const data = items.reduce((p, c) => {
                    p[c.s] = c;
                    return p;
                  }, {});
                  decorator.values = Object.keys(result.sampleMap).map(sid => {
                    if (!data.hasOwnProperty(sid)) {
                      return {
                        sid: sid,
                        pid: result.sampleMap[sid],
                        mid: null,
                        key: EntityTypeEnum.SAMPLE,
                        label: 'NA',
                        value: 'NA'
                      };
                    }
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: formatLabel(decorator.field, data[sid][decorator.field.key]),
                      value: formatValue(decorator.field, data[sid][decorator.field.key])
                    };
                  });
                } else {
                  const data = items.reduce((p, c) => {
                    p[c.p] = c;
                    return p;
                  }, {});
                  decorator.values = Object.keys(result.sampleMap).map(sid => {
                    if (!data.hasOwnProperty(result.sampleMap[sid])) {
                      return {
                        sid: sid,
                        pid: result.sampleMap[sid],
                        mid: null,
                        key: EntityTypeEnum.SAMPLE,
                        label: 'NA',
                        value: 'NA'
                      };
                    }
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: formatLabel(decorator.field, data[result.sampleMap[sid]][decorator.field.key]),
                      value: formatValue(decorator.field, data[result.sampleMap[sid]][decorator.field.key])
                    };
                  });
                }
              }
              // db.close();
              resolve(decorator);
              break;

            case DataDecoratorTypeEnum.GROUP:
              scale = this.getGroupScale(items, decorator.field);
              decorator.values = items.map(v => ({
                pid: v.p,
                sid: psMap[v.p],
                mid: null,
                key: EntityTypeEnum.PATIENT,
                label: formatLabel(decorator.field, v[decorator.field.key]),
                value: scale(formatValue(decorator.field, v[decorator.field.key]))
              }));
              resolve(decorator);
              break;

            case DataDecoratorTypeEnum.SIZE:
              scale = this.getSizeScale(items, decorator.field);
              console.log('SIZE scale done.');
              decorator.values = items.map(function(v) {
                let newV = {
                  pid: v.p,
                  sid: psMap[v.p],
                  mid: null,
                  key: EntityTypeEnum.PATIENT,
                  label: formatLabel(decorator.field, v[decorator.field.key]),
                  value: scale(formatValue(decorator.field, v[decorator.field.key]))
                };
                return newV;
              });

              resolve(decorator);
              break;
      
            case DataDecoratorTypeEnum.COLOR:
              let data = {};
              scale = this.getColorScale(items, decorator.field);
              if (decorator.field.tbl === 'sample') {
                console.log(`MJ In setting color, decorator.field = ${JSON.stringify(decorator.field)}.`);

                data = items.reduce((accum, currentSample) => {
                  accum[currentSample.s] = currentSample;
                  return accum;
                }, {});
                console.log(`data should be completed.`);
                console.log(`data length = ${ data ? Object.keys(data).length : 'ERROR'}.`);
                let d = items.reduce((a,c)=>{ a[c.s]=c ; return a ;},{})
                console.log(`d length = ${ d ? Object.keys(d).length : 'ERROR'}.`);

                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  if (!data.hasOwnProperty(sid)) {
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: 'NA',
                      value: 0xeeeeee
                    };
                  }
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: formatLabel(decorator.field, data[sid][decorator.field.key]),
                    value: scale(formatValue(decorator.field, data[sid][decorator.field.key]))
                  };
                });
              } else {
                data = items.reduce((p, c) => {
                  p[c.p] = c;
                  return p;
                }, {});
                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  if (!data.hasOwnProperty(result.sampleMap[sid])) {
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: 'NA',
                      value: 0xdddddd
                    };
                  }
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: scale(formatLabel(decorator.field, data[result.sampleMap[sid]][decorator.field.key])),
                    value: scale(formatValue(decorator.field, data[result.sampleMap[sid]][decorator.field.key]))
                  };
                });
              }
              decorator.legend = new Legend();
              console.warn(`## newLegend() in data service...##`);
              console.dir(decorator.legend)

              decorator.legend.decorator = decorator;
              decorator.legend.result = null; // MJ TODO result;
              decorator.legend.type = 'COLOR';
              decorator.legend.display = 'DISCRETE';
              decorator.legend.name =
                config.entity === EntityTypeEnum.SAMPLE
                  ? 'Sample ' + decorator.field.label
                  : config.entity === EntityTypeEnum.GENE
                  ? 'Gene ' + decorator.field.label
                  : 'Patient ' + decorator.field.label;

              console.log('data is good here?');
              if (decorator.field.type === 'STRING') {
                decorator.legend.labels = scale['domain']().filter(v => v);
                if (!decorator.legend.labels.find(v => v === 'NA')) {
                  decorator.legend.labels.concat(['NA']);
                }
                decorator.legend.values = scale['range']().concat([0xdddddd]);
              } else {
                decorator.legend.labels = scale['range']().map(v =>
                  scale['invertExtent'](v)
                    .map(w => Math.round(w))
                    .join(' to ')
                );
                if (!decorator.legend.labels.find(v => v === 'NA')) {
                  decorator.legend.labels.concat(['NA']);
                }
                decorator.values.forEach(v => {
                  if (v.label === 'NA') {
                    v.value = 0xdddddd;
                  }
                });
                decorator.legend.values = scale['range']().concat([0xdddddd]);

              }
              decorator.legend.visibility = new Array(decorator.legend.labels.length).fill(1); 

              // Total up the counts for each label.
              let valueCounts = {};
              let valuePids = {}; // Each label will have an array of patient IDs
              decorator.values.forEach(v => {
                if(valueCounts[v.label] == null) {
                  valueCounts[v.label] = 0;
                  valuePids[v.label] = []; 
                }
                valueCounts[v.label]++;
                valuePids[v.label].push(v.pid);
              });
              let valueCountsArray: Array<number> = [];
              decorator.legend.values.forEach( value => {
                valueCountsArray.push(valueCounts[value]);
              });
              decorator.legend.counts = valueCountsArray;

              //   pidsByLabel: Array<[string, Array<string>]>;
              decorator.pidsByLabel = [];//valuePids;
              decorator.legend.items.map(item => {
                let row = {label: item.value, pids: valuePids[item.value]};
                decorator.pidsByLabel.push(row);
              });
              // Object.keys(valuePids).map(key => {
              //   let row = {label: key, pids: valuePids[key]};
              //   decorator.pidsByLabel.push(row);
              // });
              resolve(decorator);
              break;

            case DataDecoratorTypeEnum.SHAPE:
              scale = this.getShapeScale(items, decorator.field);
              if (decorator.field.tbl === 'sample') {
                const data = items.reduce((p, c) => {
                  p[c.s] = c;
                  return p;
                }, {});
                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  if (!data.hasOwnProperty(sid)) {
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: 'NA',
                      value: 'NA'
                    };
                  }
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: formatLabel(decorator.field, data[sid][decorator.field.key]),
                    value: scale(formatValue(decorator.field, data[sid][decorator.field.key]))
                  };
                });
              } else {
                const data = items.reduce((p, c) => {
                  p[c.p] = c;
                  return p;
                }, {});
                decorator.values = Object.keys(result.sampleMap).map(sid => {
                  if (!data.hasOwnProperty(result.sampleMap[sid])) {
                    return {
                      sid: sid,
                      pid: result.sampleMap[sid],
                      mid: null,
                      key: EntityTypeEnum.SAMPLE,
                      label: 'NA',
                      value: 'NA'
                    };
                  }
                  return {
                    sid: sid,
                    pid: result.sampleMap[sid],
                    mid: null,
                    key: EntityTypeEnum.SAMPLE,
                    label: scale(formatLabel(decorator.field, data[result.sampleMap[sid]][decorator.field.key])),
                    value: scale(formatValue(decorator.field, data[result.sampleMap[sid]][decorator.field.key]))
                  };
                });
              }
              decorator.legend = new Legend();
              decorator.legend.type = 'SHAPE';
              decorator.legend.display = 'DISCRETE';
              decorator.legend.name =
                config.entity === EntityTypeEnum.SAMPLE
                  ? 'Sample ' + decorator.field.label
                  : config.entity === EntityTypeEnum.GENE
                  ? 'Gene ' + decorator.field.label
                  : 'Patient ' + decorator.field.label;
              if (decorator.field.type === 'STRING') {
                decorator.legend.labels = scale['domain']();
                if (!decorator.legend.labels.find(v => v === 'NA')) {
                  decorator.legend.labels.concat(['NA']);
                }
                decorator.legend.values = scale['range']().concat([SpriteMaterialEnum.NA]);
              } else {
                decorator.legend.labels = scale['range']().map(v =>
                  scale['invertExtent'](v)
                    .map(w => Math.round(w))
                    .join(' to ')
                );
                if (!decorator.legend.labels.find(v => v === 'NA')) {
                  decorator.legend.labels.concat(['NA']);
                }
                decorator.legend.values = scale['range']().concat([SpriteMaterialEnum.NA]);
              }
              resolve(decorator);
              break;
          }
        });
      })
    );
  }

  createDataDecorator(config: GraphConfig, decorator: DataDecorator): Observable<any> {
    if (decorator.type === DataDecoratorTypeEnum.SELECT) {
       return observableFrom(
        new Promise(resolve => {
          resolve(decorator);
        })
      );
    }
    if (decorator.field.ctype & CollectionTypeEnum.MOLEC_DATA_FIELD_TABLES) {
      return this.createMolecularDataDecorator(config, decorator);
    }
    return this.createSampleDataDecorator(config, decorator);
  }

  createLegendFilter(config: GraphConfig, legendFilter: LegendFilter): Observable<any> {
    console.warn("***TBD: creatleLegendFilter in data service ***");
      return observableFrom(
      new Promise(resolve => {
        resolve(legendFilter);
      })
    );
  }

  getGeneMap(): Observable<any> {
    return observableFrom(DataService.db.table('genemap').toArray());
  }
  getChromosomeGeneCoords(): Observable<any> {
    return observableFrom(DataService.db.table('genecoords').toArray());
  }
  getChromosomeBandCoords(): Observable<any> {
    return observableFrom(DataService.db.table('bandcoords').toArray());
  }

  getDatasetTables(database:string): Promise<Array<DataTable>> {
    return new Promise(resolve => {
      console.log('start getDatasetTables...');
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('dataset')
          .toArray()
          .then(result => {
            console.log('... end getDatasetTables.');
            // db.close();
            resolve(result[0].tables);
          });
      });
    });
  }

  getTipFileFromVisualization(v: VisualizationEnum): string {
    switch (v) {
      case VisualizationEnum.LINKED_GENE:
      case VisualizationEnum.BOX_WHISKERS:
      case VisualizationEnum.PARALLEL_COORDS:
      case VisualizationEnum.HIC:
      case VisualizationEnum.DENDOGRAM:
      case VisualizationEnum.SPREADSHEET:
      case VisualizationEnum.DASHBOARD:
      case VisualizationEnum.HISTOGRAM:
      case VisualizationEnum.CHROMOSOME:
        return null;
      case VisualizationEnum.HAZARD:
      case VisualizationEnum.SURVIVAL:
        return 'survival.json';
      case VisualizationEnum.HEATMAP:
        return 'heatmap.json';
      case VisualizationEnum.TIMELINES:
        return 'timelines.json';
      case VisualizationEnum.PATHWAYS:
        return 'pathways.json';
      case VisualizationEnum.SPARSE_CODER:
      case VisualizationEnum.DECOMPOSITION:
      case VisualizationEnum.MANIFOLDLEARNING:
      case VisualizationEnum.SUPPORT_VECTOR_MACHINES:
      case VisualizationEnum.PCA:
      case VisualizationEnum.PLS:
      case VisualizationEnum.TSNE:
      case VisualizationEnum.UMAP:
      case VisualizationEnum.SCATTER:
      case VisualizationEnum.KMEANS:
      case VisualizationEnum.KMEDIAN:
      case VisualizationEnum.KMEDOIDS:
      case VisualizationEnum.SOM:
      case VisualizationEnum.MDS:
      case VisualizationEnum.SAVED_POINTS:
      case VisualizationEnum.DA:
      case VisualizationEnum.DE:
      case VisualizationEnum.FA:
      case VisualizationEnum.TRUNCATED_SVD:
      case VisualizationEnum.INCREMENTAL_PCA:
      case VisualizationEnum.KERNAL_PCA:
      case VisualizationEnum.SPARSE_PCA:
      case VisualizationEnum.PROBABILISTIC_PCA:
      case VisualizationEnum.RANDOMIZED_PCA:
      case VisualizationEnum.FAST_ICA:
      case VisualizationEnum.DICTIONARY_LEARNING:
      case VisualizationEnum.LDA:
      case VisualizationEnum.NMF:
      case VisualizationEnum.ISOMAP:
      case VisualizationEnum.LOCALLY_LINEAR_EMBEDDING:
      case VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING:
      case VisualizationEnum.MINI_BATCH_SPARSE_PCA:
      case VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS:
      case VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS:
      case VisualizationEnum.SPARSE_CODER:
      case VisualizationEnum.SPECTRAL_EMBEDDING:
      case VisualizationEnum.CCA:
      case VisualizationEnum.PLSSVD:
      case VisualizationEnum.PLSCANONICAL:
      case VisualizationEnum.PLSREGRESSION:
      case VisualizationEnum.LINEAR_SVC:
      case VisualizationEnum.LINEAR_SVR:
      case VisualizationEnum.NU_SVC:
      case VisualizationEnum.NU_SVR:
      case VisualizationEnum.ONE_CLASS_SVM:
      case VisualizationEnum.SVR:
        return 'clustering.json';
      case VisualizationEnum.GENOME:
        return 'genome.json';
      case VisualizationEnum.PROTEINS:
        return 'protein.json';
    }
  }

  getJsonFileFromVisualization(v: VisualizationEnum): string {
    return v === VisualizationEnum.BOX_WHISKERS
      ? 'box_whiskers.json'
      : v === VisualizationEnum.CHROMOSOME
      ? 'chromosome.json'
      : v === VisualizationEnum.DICTIONARY_LEARNING
      ? 'dictionary_learning.json'
      : v === VisualizationEnum.FA
      ? 'factor_analysis.json'
      : v === VisualizationEnum.FAST_ICA
      ? 'fast_ica.json'
      : v === VisualizationEnum.HIC
      ? 'force_directed_graph.json'
      : v === VisualizationEnum.GENOME
      ? 'genome.json'
      : v === VisualizationEnum.DENDOGRAM
      ? 'dendogram.json'
      : v === VisualizationEnum.HEATMAP
      ? 'heatmap.json'
      : v === VisualizationEnum.HISTOGRAM
      ? 'histogram.json'
      : v === VisualizationEnum.INCREMENTAL_PCA
      ? 'incremental_pca.json'
      : v === VisualizationEnum.ISOMAP
      ? 'isomap.json'
      : v === VisualizationEnum.KERNAL_PCA
      ? 'kernal_pca.json'
      : v === VisualizationEnum.LDA
      ? 'latent_dirichlet_allocation.json'
      : v === VisualizationEnum.LINEAR_DISCRIMINANT_ANALYSIS
      ? 'linear_discriminant_analysis.json'
      : v === VisualizationEnum.LOCALLY_LINEAR_EMBEDDING
      ? 'locally_linear_embedding.json'
      : v === VisualizationEnum.MDS
      ? 'mds.json'
      : v === VisualizationEnum.SAVED_POINTS
      ? 'saved_points.json'
      : v === VisualizationEnum.MINI_BATCH_DICTIONARY_LEARNING
      ? 'mini_batch_dictionary_learning.json'
      : v === VisualizationEnum.MINI_BATCH_SPARSE_PCA
      ? 'mini_batch_sparse_pca.json'
      : v === VisualizationEnum.NMF
      ? 'nmf.json'
      : v === VisualizationEnum.PATHWAYS
      ? 'pathways.json'
      : v === VisualizationEnum.PCA
      ? 'pca.json'
      : // tslint:disable-next-line:max-line-length
      v === VisualizationEnum.QUADRATIC_DISCRIMINANT_ANALYSIS
      ? 'quadratic_discriminant_analysis.json)'
      : v === VisualizationEnum.SPARSE_PCA
      ? 'sparse_pca.json'
      : v === VisualizationEnum.SPECTRAL_EMBEDDING
      ? 'spectral_embedding.json'
      : v === VisualizationEnum.SURVIVAL
      ? 'survival.json'
      : v === VisualizationEnum.HAZARD
      ? 'hazard.json'
      : v === VisualizationEnum.TIMELINES
      ? 'timelines.json'
      : v === VisualizationEnum.TRUNCATED_SVD
      ? 'truncated_svd.json'
      : v === VisualizationEnum.TSNE
      ? 'tsne.json'
      : v === VisualizationEnum.UMAP
      ? 'umap.json'
      : v === VisualizationEnum.SCATTER
      ? 'scatter.json'
      : v === VisualizationEnum.PLSSVD
      ? 'pls_svd.json'
      : v === VisualizationEnum.PLSREGRESSION
      ? 'pls_regression.json'
      : v === VisualizationEnum.PLSCANONICAL
      ? 'pls_canonical.json'
      : v === VisualizationEnum.CCA
      ? 'cca.json'
      : '';
  }
  
  getHelpInfo(config: GraphConfig): Promise<any> {
    const v = config.visualization;
    const method = this.getJsonFileFromVisualization(v);
    if (method === '') {
      return new Promise(resolve => {
        resolve({
          method: 'NA',
          desc: 'Comming Soon',
          url: 'NA',
          attrs: [],
          params: [],
          citations: []
        });
      });
    }

    return fetch('./assets/help/' + method, {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }

  getCitations(): Promise<any> {
    return fetch('./assets/citations/method-citations.json', {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }

  getEvents(database: string): Promise<Array<any>> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('dataset')
          .toArray()
          .then(result => {
            // db.close();
            resolve(result[0].events);
          });
      });
    });
  }

  composeQueryConfig = function(patientMetaFields:Array<any>, eventsMetaFields:Array<any>){
    const config = patientMetaFields.reduce((fields, field) => {
      switch (field.type) {
        case 'NUMBER':
          fields[field.key] = {
            name: field.label,
            type: field.type.toLowerCase()
          };
          return fields;
        case 'STRING':
          // if (field.values.length <= 10) {
          fields[field.key] = {
            name: field.label,
            type: 'category',
            options: field.values.map(val => ({
              name: val,
              value: val
            }))
          };
          // } else {
          //   fields[field.key] = { name: field.label, type: 'string' };
          // }
          return fields;
      }
    }, {});
    // eventsMetaFields is of form:   type: "Treatment", subtype: "DrugABC".
    // Want to transform them into an outline, so we can choose a specific
    // subtype, or a type, (or maybe any event at all).

    if(eventsMetaFields && eventsMetaFields.length > 0) {
      console.log(`Events Meta Fields: ${JSON.stringify(eventsMetaFields)}`);
      let emfSet = new Set();
      eventsMetaFields.map(e => emfSet.add(e.type));
      // Set(4) {"gvhd", "response", "treatment", "isp"}
      
      let topLevelTypes:any = {};
      Array.from(emfSet).map( (e:string) => {topLevelTypes[e] = []});
      eventsMetaFields.map((emf) => topLevelTypes[emf.type].push(emf.subtype));

      // Okay, add to existing config. ... TBD
    }

    return config;

  }

  async getQueryBuilderConfig(database: string): Promise<any> {
      const db = new Dexie('notitia-' + database);

      let v = await db.open();
      
      let patientMetaFields = await v.table('patientMeta').toArray();
      let eventsMetaFields = await v.table('eventsMeta').toArray();
      let finalFields = this.composeQueryConfig(patientMetaFields, eventsMetaFields);

      // db.close();
      return new Promise(resolve => {
        resolve({ fields: finalFields });
      });
  }

  getPatientIdsWithSampleIds(database: string, sampleIds: Array<string>): Promise<Array<string>> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        connection
          .table('patientSampleMap')
          .where('s')
          .anyOf(sampleIds)
          .toArray()
          .then(result => {
            // db.close();
            resolve(Array.from(new Set(result.map(v => v.p))));
          });
      });
    });
  }

  getSampleIdsWithPatientIds(database: string, patientIds: Array<string>): Promise<Array<string>> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        connection
          .table('patientSampleMap')
          .where('p')
          .anyOf(patientIds)
          .toArray()
          .then(result => {
            // db.close();
            resolve(Array.from(new Set(result.map(v => v.s))));
          });
      });
    });
  }

  getSavedPointsList(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        connection
          .table('savedPoints')
          .toArray()
          .then(result => {
            resolve(result);
            // db.close();
            
          });
      });
    });
  }

  putSavedPointsWrapper(database:string, wrapper:SavedPointsWrapper):Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        connection
          .table('savedPoints')
          .put(wrapper)
          .then(result => {
            console.log(`Wrapper [${wrapper.name}] put into savedPoints table.`);
            resolve(result);
            // db.close();
            
          });
      });
    });
  }

  getGeneStats(database: string, mids: Array<string>): Promise<any> {
    if (mids === undefined || mids === null) {
      mids = [];
    }
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        connection
          .table('dataset')
          .toArray()
          .then(dataset => {
            // Filter All Tables To Only Show Molecular
            const molecularTables = dataset[0].tables.filter(
              table => table.ctype & CollectionTypeEnum.MOLEC_DATA_FIELD_TABLES
            );

            // Build Query For Each Table
            const queries = molecularTables.map(tbl =>
              mids.length === 0
                ? connection.table(tbl.tbl.replace(/\s/gi, ''))
                : connection
                    .table(tbl.tbl)
                    .where('m')
                    .anyOfIgnoreCase(mids)
            );

            Promise.all(queries.map(query => query.toArray())).then(results => {
              // Do your math...
              // db.close();
              resolve(results);
            });
          });
      });
    });
  }
  getMarkerStats(mids: Array<string>): Promise<any> {
    if (mids === undefined || mids === null) {
      mids = [];
    }
    return new Promise(resolve => {
      resolve([]);
    });
  }
  getMarkerStatsText(mids: Array<string>): Promise<any> {
    if (mids === undefined || mids === null) {
      mids = [];
    }
    return new Promise(resolve => {
      let text = '<p>You selected ' + mids.length + ' genes including:</p>';
      text += mids.join(', ');
      resolve(text);
    });
  }
  
  getPatientStatsText(database: string, pids: Array<string>, sids: Array<string>): Promise<any> {
    if (pids === undefined || pids === null) {
      pids = [];
    }

    return new Promise(resolve => {
      // This builds a "sql" query
      this.getQueryBuilderConfig(database).then(config => {
        // Pull field Meta Data
        const fields = Object.keys(config.fields)
          .map(field => Object.assign(config.fields[field], { field: field }))
          .filter(item => item.type !== 'string')
          .sort((a, b) => (a.type !== b.type ? a.type.localeCompare(b.type) : a.name.localeCompare(b.name)));

        const db = new Dexie('notitia-' + database);
        db.open().then(connection => {
          const query =
            pids.length === 0
              ? connection.table('patient')
              : connection
                  .table('patient')
                  .where('p')
                  .anyOfIgnoreCase(pids);

          let text = '<p>You selected ' + pids.length + ' patients ' + ' from ' + sids.length + ' samples ';
          query.toArray().then(result => {
            text +=
              'with the following averages:</p>' +
              fields
                .filter(v => v.type === 'number')
                .map(f => {
                  const arr = result.map(v => v[f.field]);
                  return f.name + ' = ' + Math.round(JStat.mean(arr));
                })
                .join('<br />');

            // // db.close();
            resolve(text);
          });
        });
      });
    });
  }

  getPatientStats(database: string, pids: Array<string>): Promise<any> {
    if (pids === undefined || pids === null) {
      pids = [];
    }

    return new Promise(resolve => {
      // This builds a "sql" query
      this.getQueryBuilderConfig(database).then(config => {
        // Pull field Meta Data

        const fields = Object.keys(config.fields)
          .map(field => Object.assign(config.fields[field], { field: field }))
          .filter(item => item.type !== 'string')
          .sort((a, b) => (a.type !== b.type ? a.type.localeCompare(b.type) : a.name.localeCompare(b.name)));

        const db = new Dexie('notitia-' + database);
        db.open().then(connection => {
          const query =
            pids.length === 0
              ? connection.table('patient')
              : connection
                  .table('patient')
                  .where('p')
                  .anyOfIgnoreCase(pids);

          query.toArray().then(result => {
            const cat = fields
              .filter(v => v.type === 'category')
              .map(f => {
                const arr = result.map(v => v[f.field]);
                const stat = arr.reduce((p, c) => {
                  if (!p.hasOwnProperty(c)) {
                    p[c] = 1;
                  } else {
                    p[c] += 1;
                  }
                  return p;
                }, {});
                const stats = Object.keys(stat).map(v => ({
                  label: v,
                  value: stat[v]
                }));
                let orderedStats = f.options.map((opt) => {
                  let statEntry = stats.find(v => v.label == opt.name);
                  return {label:opt.name, value: (statEntry ? statEntry.value : 0)}
                });


                // stats.sort(function(a, b) {
                //   return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
                // })
                return Object.assign(f, { stat: orderedStats });
              });

            const num = fields
              .filter(v => v.type === 'number')
              .map(f => {
                const arr = result.map(v => v[f.field]);
                const first = JStat.min(arr);
                const binCnt = 10;
                const binWidth = (JStat.max(arr) - first) / binCnt;
                const len = arr.length;
                const bins = [];
                let i;
                for (i = 0; i < binCnt; i++) {
                  bins[i] = 0;
                }
                for (i = 0; i < len; i++) {
                  bins[Math.min(Math.floor((arr[i] - first) / binWidth), binCnt - 1)] += 1;
                }
                const stats = bins.map((v, j) => ({
                  label: Math.round(first + j * binWidth).toString(),
                  value: v
                }));
                return Object.assign(f, { stat: stats });
              });
            // db.close();
            resolve(num.concat(cat));
          });
        });
      });
    });
  }

  // If we have already loaded mutationRecords, calculate stats on them.
  // For example, how many patients (in the given cohort) have each type
  // of variant (intron, gain, loss, etc).
  getPatientMutationStats(database: string, pids: Array<string>): Promise<any> {
    if (pids === undefined || pids === null) {
      pids = []; // Treat empty pids as equal to "all patients"
    }

    if ( OncoData.instance && OncoData.instance.mutationRecords) {
      return new Promise(resolve => {
        let useAllPids:boolean = pids.length == 0;
        let mapOfCountsPerPatient:Map<string, any>  = new Map();
        let numAllPatients = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientData.length;
        if (OncoData.instance.variantCountsPerPatient == null) {
          let sampleMap:any = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.sampleMap;
          
          // Inefficient. Why can't we we use Object.entries? Is it a
          // JS targeting issue?
          let sampleMapKeys = Object.keys(sampleMap);
          let sampleMapAsMap = new Map();
          sampleMapKeys.map(v => {
            sampleMapAsMap.set(v, sampleMap[v]);
          });

          OncoData.instance.mutationRecords.map(v => {
            let pid:string = sampleMapAsMap.get(v.s) as string;
            let thisPatientCounts = mapOfCountsPerPatient.get(pid);
            if(thisPatientCounts == null) {
              thisPatientCounts = {};
              mapOfCountsPerPatient.set(pid, thisPatientCounts);
            }
            if(thisPatientCounts[v.t] == null) {
              thisPatientCounts[v.t] = 0;
            }
            thisPatientCounts[v.t]++;
          
          });
          OncoData.instance.variantCountsPerPatient = mapOfCountsPerPatient;
        } else {
          mapOfCountsPerPatient = OncoData.instance.variantCountsPerPatient;
        }

        // Given mapOfCountsPerPatient, loop through pids and total by type.
        let pidsInCohort = new Set(); // empty if 'all patients'
        pids.map(v => pidsInCohort.add(v));

        let allTypeCounts = {};
        mapOfCountsPerPatient.forEach((thisPidCounts, pid) => {
          if(useAllPids || pidsInCohort.has(pid)){ 
            Object.keys(thisPidCounts).map((typeKey) => {
              let typeItem = allTypeCounts[typeKey];
              if (typeItem == null) {
                allTypeCounts[typeKey] = 1;
              } else {
                allTypeCounts[typeKey]++;
              }
            });
          }
        });

        let numPatients:number = pids.length >0 ? pids.length : numAllPatients;
        let allTypesPercentKeys = Object.keys(allTypeCounts).map(v => {
          let percentage = allTypeCounts[v] / numPatients;
          return {label: v, value: percentage}
        });
        allTypesPercentKeys.sort(function(a, b) {
          return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
        })

        let mutResult = {
          name: '% patients with variants',
          field: 'patients_with_variants',
          type: 'category',
          "options": [{
                  "name": "intron",
                  "value": "intron"
              }, {
                  "name": "gain",
                  "value": "gain"
              }, {
                  "name": "loss",
                  "value": "loss"
              }
          ],
          stat: allTypesPercentKeys
        };
        resolve([mutResult]);
      });
    } else {
      // no mutation records
      return new Promise(resolve => {resolve ([])});
    }
  }

  getPatientIdsWithQueryBuilderCriteria(
    database: string,
    config: QueryBuilderConfig,
    criteria: {
      condition: string;
      rules: Array<{ field: string; operator: string; value: any }>;
    }
  ): Promise<Array<string>> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(connection => {
        Promise.all(
          criteria.rules
            .map(rule => {
              switch (config.fields[rule.field].type) {
                case 'number':
                  switch (rule.operator) {
                    case '=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .equals(rule.value)
                        .toArray();
                    case '!=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .notEqual(rule.value)
                        .toArray();
                    case '>':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .above(rule.value)
                        .toArray();
                    case '>=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .aboveOrEqual(rule.value)
                        .toArray();
                    case '<':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .below(rule.value)
                        .toArray();
                    case '<=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .belowOrEqual(rule.value)
                        .toArray();
                  }
                  break;

                case 'string':
                  switch (rule.operator) {
                    case '=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .equalsIgnoreCase(rule.value)
                        .toArray();
                    case '!=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .notEqual(rule.value)
                        .toArray();
                    case 'contains':
                      // return connection.table('patient').where(rule.field).(rule.value).toArray();
                      alert('Query Contains Operator Not Yet Implemented - Ignoring');
                      return null;
                    case 'like':
                      alert('Query Like Operator Not Yet Implemented - Ignoring');
                      return null;
                  }
                  break;

                case 'category':
                  switch (rule.operator) {
                    case '=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .equalsIgnoreCase(rule.value)
                        .toArray();
                    case '!=':
                      return connection
                        .table('patient')
                        .where(rule.field)
                        .notEqual(rule.value)
                        .toArray();
                  }
                  break;
              }
            })
            .filter(v => v)
        ).then(v => {
          let ids: Array<string>;
          if (criteria.condition === 'or') {
            ids = Array.from(
              new Set(
                v.reduce((p, c) => {
                  p = p.concat(c.map(cv => cv.p));
                  return p;
                }, [])
              )
            );
          } else if (criteria.condition === 'and') {
            const sets = v.map(c => new Set(c.map(cv => cv.p)));
            ids = Array.from(sets[0]);
            for (let i = 1; i < sets.length; i++) {
              const set = sets[i];
              ids = ids.filter(item => set.has(item));
            }
          }
          // db.close();
          resolve(ids);
        });
      });
    });
  }

  getPathwayCategories(): Promise<Array<{ c: string; n: string; d: string }>> {
    return new Promise(resolve => {
      resolve([
        {
          c: 'http://pathwaycommons.org/pc2/pid',
          n: 'NCI Pathway Interaction Database',
          d: 'NCI Curated Human Pathways from PID'
        },
        {
          c: 'http://pathwaycommons.org/pc2/reactome',
          n: 'Reactome',
          d: 'Reactome v61'
        },
        {
          c: 'http://pathwaycommons.org/pc2/humancyc',
          n: 'HumanCyc',
          d: 'HumanCyc 20; 2016; under license from SRI International'
        },
        {
          c: 'http://pathwaycommons.org/pc2/inoh',
          n: 'Integrating Network Objects with Hierarchies',
          d: 'INOH 4.0 (signal transduction and metabolic data)'
        },
        {
          c: 'http://pathwaycommons.org/pc2/netpath',
          n: 'NetPath',
          d: 'NetPath 12/2011 (BIOPAX)'
        },
        {
          c: 'http://pathwaycommons.org/pc2/panther',
          n: 'PANTHER Pathway',
          d: 'PANTHER Pathways 3.4.1 on 04-Jul-2016'
        },
        {
          c: 'http://pathwaycommons.org/pc2/smpdb',
          n: 'Small Molecule Pathway Database',
          d: 'Small Molecule Pathway Database 2.0, 05-Jun-2016'
        },
        {
          c: 'http://pathwaycommons.org/pc2/kegg',
          n: 'KEGG Pathway',
          d: 'KEGG 07/2011 (only human, hsa files)'
        },
        {
          c: 'http://pathwaycommons.org/pc2/wp',
          n: 'WikiPathways',
          d: 'WikiPathways - Community Curated Human Pathways; 29/09/2015'
        }
      ]);
    });
  }

  getPathways(): Promise<Array<any>> {
    return fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/pathways.json.gz', {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }
  createCustomPathway(database: string, pathway: Pathway): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('pathways')
          .add(pathway)
          .then(w => {
            resolve(w);
          });
      });
    });
  }
  deleteCustomPathway(database: string, pathway: Pathway): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('pathways')
          .where('n')
          .equalsIgnoreCase(pathway.n)
          .delete()
          .then(w => {
            resolve(w);
          });
      });
    });
  }

  getPreprocessingSteps(): Promise<Array<PreprocessingStep>> {
    return new Promise((resolve, reject) => {
      return fetch('https://oncoscape.v3.sttrcancer.org/assets/preprocessing.json', {
        method: 'GET',
        headers: DataService.headersJson
      })
        .then(res => res.json())
        .then(res => {
          resolve(res as Array<PreprocessingStep>);
        });
    });
  }

  getCustomPreprocessing(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('preprocessing')
          .toArray()
          .then(result => {
            resolve(result);
          });
      });
    });
  }
  
  getCustomVisSettings(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('visSettings')
          .toArray()
          .then(result => {
            resolve(result);
          });
      });
    });
  }
  
  getCustomPathways(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('pathways')
          .toArray()
          .then(result => {
            const pathways = result;
            pathways.unshift({
              n: 'integrated cancer pathway',
              uri:
                'https://oncoscape.v3.sttrcancer.org/data/pathways/http___identifiers.org_wikipathways_WP1971.json.gz'
            });
            resolve(result);
          });
      });
    });
  }
  getRowCount(database: string, table: string): Promise<number> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        let copyOfV:any = v; // hack to avoid TS not knowing about _allTables.
        // Sometimes the 'mut' table isn't created yet, because we don't have a mut file for this project.
        // Don't die, just return '0' for the row count.
        if(copyOfV._allTables.hasOwnProperty(table)) {
        v.table(table)
          .count()
          .then(result => {
            resolve(result);
          });
        } else {
          console.warn('WARNING: getRowCount did not find table ' + table + '.');
          resolve(0);
        }
      });
    });
  }

  setMiscMeta(database: string, miscType: string, val: any): Promise<any> {
    let table:string = 'miscMeta';
    console.log('qwerty');
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        let copyOfV:any = v; // hack to avoid TS not knowing about _allTables.
        if(copyOfV._allTables.hasOwnProperty(table)) {
          try {
            v.table(table)
            .add({
              type: miscType,
              data: val
            })
            .then(result => {
              console.log(`MJ setMiscMeta [${miscType}], value set. `);
              resolve(result);
            }).catch(function(e) {
              console.error(e.message); // "oh, no!"
              console.error(`Caught in promise-catch setMiscMeta for ${miscType}. Size is next`);
              console.log(`size ${JSON.stringify(val).length} `);
              });
          } catch(err) {
            console.error(`Caught in setMiscMeta for ${miscType}. Size is next`);
            console.log(`size ${JSON.stringify(val).length} `);
          }
        } else {
          console.warn('WARNING: setMiscMeta did not find value for ' + miscType + '.');
          resolve(0);
        }
      });
    });
  }

  // look up a value from miscMeta database, where misctype is the 'type' key. 
  // e.g., "mutationTypes",  for list of variant names imported.
  getMiscMeta(database: string, miscType: string): Promise<any> {
    let table:string = 'miscMeta';
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        let copyOfV:any = v; // hack to avoid TS not knowing about _allTables.
        if(copyOfV._allTables.hasOwnProperty(table)) {
        v.table(table)
          .get(miscType)
          .then(result => {
            resolve(result);
          });
        } else {
          console.warn('WARNING: getMiscMeta did not find value for ' + miscType + '.');
          resolve(0);
        }
      });
    });
  }

  async getTable(database: string, tbl: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        let copyOfV:any = v; // hack to avoid TS not knowing about _allTables.
        if(copyOfV._allTables.hasOwnProperty(tbl)) {
          resolve( v.table(tbl));
        } else {
          console.warn('WARNING: getTable did not find table ' + tbl + '.');
          resolve(0);
        }
      });
    });
  }

  getPublicDatasets(): Promise<Array<any>> {
    return fetch('https://oncoscape.v3.sttrcancer.org/public/datasets', {
      method: 'GET',
      headers: DataService.headersJson
    }).then(res => res.json());
  }
  
  // TODO: Harmonize the next four functions, which are two variants of two functions.
  // ==== START ======
  getGeneSetByCategory(categoryCode: string): Observable<any> {
    return observableFrom(
      fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/genesets/' + categoryCode + '.json.gz', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: DataService.headersJson
      }).then(res => res.json())
    );
  }
  
  getGeneSetCategories(): Observable<any> {
    return observableFrom(
      fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/genesets/categories.json.gz', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: DataService.headersJson
      }).then(res => res.json())
    );
  }

  getGenesetCategories(): Promise<Array<{ code: string; name: string; desc: string }>> {
    return fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/genesets/categories.json.gz', {
      method: 'GET',
      mode: 'cors',
      headers: DataService.headersJson
    }).then(res => 
      {
        return res.json();
      });
  }

  getGenesets(category: string): Promise<Array<any>> {
    return fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/geneset-' + category.toLowerCase() + '.json.gz', {
      method: 'GET',
      mode: 'cors',
      headers: DataService.headersJson
    }).then(res => res.json());
  }
  // ==== END ======


  getCustomGenesets(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('genesets')
          .toArray()
          .then(result => {
            const genesets = result;
            if (database === 'tcga_brain') {
              
              genesets.unshift({
                n: 'Glioma Markers',
                g: [
                  'ABCG2',
                  'AHNAK2',
                  'AKT1',
                  'ARHGAP26',
                  'ASNS',
                  'ATP2B3',
                  'BCL11A',
                  'BCL2',
                  'BCL6',
                  'BCOR',
                  'BMI1',
                  'BRAF',
                  'BRCA1',
                  'BRD4',
                  'CACNA1D',
                  'CAMTA1',
                  'CARD11',
                  'CBLB',
                  'CCND3',
                  'CD44',
                  'CDKN2C',
                  'CIITA',
                  'COL1A1',
                  'CREBBP',
                  'CUL1',
                  'DAXX',
                  'DDX5',
                  'DMRTA1',
                  'DNAH5',
                  'DOCK5',
                  'ECT2L',
                  'EGFR',
                  'ELN',
                  'ERBB2',
                  'ERCC5',
                  'EZH2',
                  'EZR',
                  'FAM46C',
                  'FBXW7',
                  'FCRL4',
                  'FGFR3',
                  'FLG',
                  'FLI1',
                  'FLT3',
                  'FOXA1',
                  'GLI1',
                  'HGF',
                  'HMCN1',
                  'HNRNPA2B1',
                  'HOOK3',
                  'HOXA9',
                  'IDH1',
                  'IGF1R',
                  'IRF4',
                  'IRS1',
                  'KCNJ5',
                  'KDM5A',
                  'KDR',
                  'KEL',
                  'KIT',
                  'KLF4',
                  'KMT2C',
                  'KMT2D',
                  'LDLR',
                  'LPA',
                  'LPP',
                  'LRP2',
                  'MALT1',
                  'MAX',
                  'MDM2',
                  'MECOM',
                  'MED12',
                  'MLIP',
                  'MLLT4',
                  'MLLT6',
                  'MSH6',
                  'MTOR',
                  'MUC16',
                  'MUC17',
                  'MYB',
                  'MYH11',
                  'MYH9',
                  'NF1',
                  'NIN',
                  'NLRP2',
                  'NOTCH2',
                  'NTRK1',
                  'OBSCN',
                  'OLIG2',
                  'OR4K5',
                  'OR4Q3',
                  'PAX3',
                  'PAX5',
                  'PCLO',
                  'PCM1',
                  'PDE4DIP',
                  'PDGFRA',
                  'PDGFRB',
                  'PDPR',
                  'PICALM',
                  'PIK3C2G',
                  'PIK3CA',
                  'PIK3CB',
                  'PIK3CG',
                  'PIK3R1',
                  'PIK3R2',
                  'PIM1',
                  'PKHD1',
                  'PMS1',
                  'PRKCD',
                  'PRKCQ',
                  'PTCH1',
                  'PTEN',
                  'PTPN11',
                  'PTPRC',
                  'RABEP1',
                  'RANBP17',
                  'RB1',
                  'RPL10',
                  'RPL22',
                  'RPL5',
                  'RYR2',
                  'RYR3',
                  'SDC4',
                  'SETBP1',
                  'SETD2',
                  'SF3B1',
                  'SHH',
                  'SIRPB1',
                  'SLC34A2',
                  'SLC45A3',
                  'SPTA1',
                  'SREBF2',
                  'SRSF2',
                  'SS18',
                  'STAG2',
                  'TCF12',
                  'TCHH',
                  'TET2',
                  'TMPRSS2',
                  'TP53',
                  'TPM3',
                  'TRIM24',
                  'TRRAP',
                  'TTN',
                  'UBR5',
                  'USH2A',
                  'USP6',
                  'VOPP1',
                  'VSTM2A',
                  'WIF1',
                  'ZNF521',
                  'ZRSR2',
                  'ABCA1',
                  'ABI1',
                  'ABL1',
                  'AFF3',
                  'AGAP2',
                  'AKAP9',
                  'AKT1S1',
                  'AKT2',
                  'AKT3',
                  'ALK',
                  'ARHGEF12',
                  'ARPC1A',
                  'ASPSCR1',
                  'ATF1',
                  'ATM',
                  'ATRX',
                  'BAGE',
                  'BAGE2',
                  'BAGE3',
                  'BAGE4',
                  'BAGE5',
                  'BCL11B',
                  'BCL3',
                  'BCL7A',
                  'BCR',
                  'BIRC3',
                  'BMPR1A',
                  'BRCA2',
                  'BRD3',
                  'BRIP1',
                  'CALR',
                  'CANT1',
                  'CBL',
                  'CBLC',
                  'CBX4',
                  'CCDC6',
                  'CCND1',
                  'CCND2',
                  'CCNE1',
                  'CD274',
                  'CD79B',
                  'CDK2',
                  'CDK4',
                  'CDK6',
                  'CDKN1A',
                  'CDKN1B',
                  'CDKN2A',
                  'CDKN2B',
                  'CEBPA',
                  'CHI3L1',
                  'CHIC2',
                  'CLP1',
                  'CLTC',
                  'CLTCL1',
                  'CNBP',
                  'CNOT3',
                  'CNTRL',
                  'CREB3L2',
                  'DDIT3',
                  'DDX10',
                  'DDX6',
                  'DEPTOR',
                  'DICER1',
                  'DNM2',
                  'DNMT3A',
                  'E2F1',
                  'EED',
                  'EIF4A2',
                  'ELAVL2',
                  'ELF4',
                  'ELK4',
                  'ERBB3',
                  'ERC1',
                  'ETV1',
                  'ETV5',
                  'ETV6',
                  'EXT1',
                  'FANCC',
                  'FANCD2',
                  'FANCG',
                  'FAS',
                  'FCGR2B',
                  'FGFR2',
                  'FH',
                  'FIP1L1',
                  'FNBP1',
                  'FOXL2',
                  'FOXO3',
                  'FOXO4',
                  'FSTL3',
                  'FZD1',
                  'GATA1',
                  'GATA2',
                  'GATA3',
                  'GIMAP8',
                  'GMPS',
                  'GNA11',
                  'GNAQ',
                  'GPC3',
                  'GRB2',
                  'GUSB',
                  'H3F3A',
                  'H3F3B',
                  'HIP1',
                  'HMGA2',
                  'HNF1A',
                  'HOXA11',
                  'HOXA13',
                  'HOXA4',
                  'HOXA5',
                  'HOXA7',
                  'HOXC11',
                  'HOXC13',
                  'HRAS',
                  'HSP90AA1',
                  'HSP90AB1',
                  'IFNA1',
                  'IFNA14',
                  'IFNA2',
                  'IFNA4',
                  'IFNA6',
                  'IFNA7',
                  'IFNA8',
                  'IFNB1',
                  'IFNW1',
                  'IKZF1',
                  'JAK1',
                  'JAK2',
                  'JAZF1',
                  'KDM5C',
                  'KIAA1549',
                  'KLF6',
                  'KMT2A',
                  'KRAS',
                  'LANCL2',
                  'LMO2',
                  'LRIG3',
                  'LYL1',
                  'MALAT1',
                  'MAML2',
                  'MAP2K2',
                  'MAPK1',
                  'MDM4',
                  'MEN1',
                  'MET',
                  'MGAM',
                  'MIR200C',
                  'MLF1',
                  'MLLT1',
                  'MLLT10',
                  'MLLT3',
                  'MNX1',
                  'MSI2',
                  'MTAP',
                  'MTCP1',
                  'MUC1',
                  'MUC20',
                  'MYC',
                  'MYCN',
                  'NACA',
                  'NCOA1',
                  'NDRG1',
                  'NFIB',
                  'NFKB2',
                  'NONO',
                  'NOTCH1',
                  'NR1H2',
                  'NR2E1',
                  'NR4A3',
                  'NRAS',
                  'NRCAM',
                  'NT5C2',
                  'NUMA1',
                  'NUP214',
                  'NUTM2A',
                  'OR2Z1',
                  'PAFAH1B2',
                  'PAX7',
                  'PBX1',
                  'PCSK7',
                  'PDCD1LG2',
                  'PDGFA',
                  'PDPK1',
                  'PHF6',
                  'PIK3C2B',
                  'PKM',
                  'PMEL',
                  'PMS2',
                  'POT1',
                  'POTED',
                  'POU2AF1',
                  'PPARG',
                  'PPP2R1A',
                  'PRCC',
                  'PRDM16',
                  'PRH1',
                  'PRKAR1A',
                  'PRKCA',
                  'PRKCG',
                  'PRKCI',
                  'PRKCZ',
                  'PRR4',
                  'PRRX1',
                  'PSIP1',
                  'RAC1',
                  'RAD21',
                  'RAF1',
                  'RALGDS',
                  'RASA3',
                  'RECQL4',
                  'RELA',
                  'RHOH',
                  'RNF213',
                  'RNF43',
                  'RPN1',
                  'RPS6KA4',
                  'RPS6KB1',
                  'SBDS',
                  'SDHC',
                  'SDHD',
                  'SEC61G',
                  'SEPT14',
                  'SEPT5',
                  'SEPT9',
                  'SERPINE1',
                  'SET',
                  'SF3B6',
                  'SH3GL1',
                  'SMARCA4',
                  'SMO',
                  'SOX2',
                  'SPRY2',
                  'SRGAP3',
                  'SRSF3',
                  'SSX2',
                  'STIL',
                  'STK11',
                  'SUFU',
                  'SYK',
                  'TAL2',
                  'TARP',
                  'TBL1XR1',
                  'TCF3',
                  'TCL1A',
                  'TCL6',
                  'TFEB',
                  'TFG',
                  'TFPT',
                  'TFRC',
                  'TLX1',
                  'TNFRSF14',
                  'TPM4',
                  'TSC1',
                  'VHL',
                  'VTI1A',
                  'WHSC1',
                  'WT1',
                  'WWTR1',
                  'XPA',
                  'XPC',
                  'ZBTB16',
                  'ZEB1',
                  'ZNF331',
                  'ZNF384',
                  'ZNF713',
                  'ACKR3',
                  'ACSL3',
                  'ACSL6',
                  'AFF4',
                  'ALDH2',
                  'ARAF',
                  'ARID2',
                  'ATIC',
                  'ATP1A1',
                  'AXIN1',
                  'BCL10',
                  'BCL9',
                  'BTG1',
                  'BUB1B',
                  'CARS',
                  'CASC5',
                  'CASP8',
                  'CBFA2T3',
                  'CCNB1IP1',
                  'CD74',
                  'CDH11',
                  'CDX2',
                  'CHN1',
                  'CREB1',
                  'CREB3L1',
                  'CRLF2',
                  'DUSP22',
                  'EBF1',
                  'EP300',
                  'ERCC2',
                  'ERRFI1',
                  'EXT2',
                  'FANCA',
                  'FANK1',
                  'FEV',
                  'FGFR1OP',
                  'FN1',
                  'FOXO1',
                  'FRG1',
                  'FUBP1',
                  'FUS',
                  'GAS7',
                  'GDF2',
                  'GOLGA5',
                  'GOPC',
                  'GPHN',
                  'GYS1',
                  'HEATR4',
                  'HERPUD1',
                  'HIF1A',
                  'HIST1H3B',
                  'HMGN2P46',
                  'HOXD11',
                  'HOXD13',
                  'IL21R',
                  'ITK',
                  'JUN',
                  'KDM6A',
                  'KLK2',
                  'KTN1',
                  'LCP1',
                  'LHFP',
                  'LMO1',
                  'MAFB',
                  'MAP2K4',
                  'MAPK3',
                  'MGMT',
                  'MKL1',
                  'MLST8',
                  'MYCL',
                  'NCKIPSD',
                  'NCOA4',
                  'NFE2L2',
                  'NFKB1',
                  'NOTCH2NL',
                  'NPM1',
                  'NRXN3',
                  'NSD1',
                  'NTRK3',
                  'NUP98',
                  'NUTM1',
                  'OR4K1',
                  'OR4K2',
                  'OR4M1',
                  'OR52N5',
                  'P2RY8',
                  'PALB2',
                  'PATZ1',
                  'PER1',
                  'PHF21A',
                  'PHOX2B',
                  'PIK3CD',
                  'POTEB',
                  'PRF1',
                  'PRKCB',
                  'PRKCH',
                  'RAD51B',
                  'RBM15',
                  'ROS1',
                  'RPS6KA5',
                  'SEC22B',
                  'SH2B3',
                  'SPECC1',
                  'SSX1',
                  'SSX4',
                  'TAF15',
                  'TAL1',
                  'TCF7L2',
                  'TERT',
                  'TET1',
                  'TFE3',
                  'TLX3',
                  'TNFAIP3',
                  'TRAF7',
                  'TRIM33',
                  'TRIP11',
                  'TSC2',
                  'TSHR',
                  'TTL',
                  'WAS',
                  'WWOX',
                  'YWHAE',
                  'ZMYM2'
                ]
              });
              
            } else {
              genesets.unshift({
                n: 'Pathways in Cancer',
                g: [
                  'ABL1',
                  'AKT1',
                  'AKT2',
                  'AKT3',
                  'APC',
                  'APC2',
                  'APPL1',
                  'AR',
                  'ARAF',
                  'ARNT',
                  'ARNT2',
                  'AXIN1',
                  // tslint:disable-next-line:max-line-length
                  'AXIN2',
                  'BAD',
                  'BAX',
                  'BCL2',
                  'BCL2L1',
                  'BCR',
                  'BID',
                  'BIRC2',
                  'BIRC3',
                  'BIRC5',
                  'BMP2',
                  'BMP4',
                  'BRAF',
                  'BRCA2',
                  'CASP3',
                  // tslint:disable-next-line:max-line-length
                  'CASP8',
                  'CASP9',
                  'CBL',
                  'CBLB',
                  'CBLC',
                  'CCDC6',
                  'CCNA1',
                  'CCND1',
                  'CCNE1',
                  'CCNE2',
                  'CDC42',
                  'CDH1',
                  'CDK2',
                  'CDK4',
                  'CDK6',
                  // tslint:disable-next-line:max-line-length
                  'CDKN1A',
                  'CDKN1B',
                  'CDKN2A',
                  'CDKN2B',
                  'CEBPA',
                  'CHUK',
                  'CKS1B',
                  'COL4A1',
                  'COL4A2',
                  'COL4A4',
                  'COL4A6',
                  'CREBBP',
                  'CRK',
                  'CRKL',
                  // tslint:disable-next-line:max-line-length
                  'CSF1R',
                  'CSF2RA',
                  'CSF3R',
                  'CTBP1',
                  'CTBP2',
                  'CTNNA1',
                  'CTNNA2',
                  'CTNNA3',
                  'CTNNB1',
                  'CUL2',
                  'CYCS',
                  'DAPK1',
                  'DAPK2',
                  'DAPK3',
                  // tslint:disable-next-line:max-line-length
                  'DCC',
                  'DVL1',
                  'DVL2',
                  'DVL3',
                  'E2F1',
                  'E2F2',
                  'E2F3',
                  'EGF',
                  'EGFR',
                  'EGLN1',
                  'EGLN2',
                  'EGLN3',
                  'EP300',
                  'EPAS1',
                  'ERBB2',
                  'ETS1',
                  // tslint:disable-next-line:max-line-length
                  'FADD',
                  'FAS',
                  'FASLG',
                  'FGF1',
                  'FGF10',
                  'FGF11',
                  'FGF12',
                  'FGF13',
                  'FGF14',
                  'FGF16',
                  'FGF17',
                  'FGF18',
                  'FGF19',
                  'FGF2',
                  'FGF20',
                  // tslint:disable-next-line:max-line-length
                  'FGF21',
                  'FGF22',
                  'FGF23',
                  'FGF3',
                  'FGF4',
                  'FGF5',
                  'FGF6',
                  'FGF7',
                  'FGF8',
                  'FGF9',
                  'FGFR1',
                  'FGFR2',
                  'FGFR3',
                  'FH',
                  'FIGF',
                  'FLT3',
                  // tslint:disable-next-line:max-line-length
                  'FLT3LG',
                  'FN1',
                  'FOS',
                  'FOXO1',
                  'FZD1',
                  'FZD10',
                  'FZD2',
                  'FZD3',
                  'FZD4',
                  'FZD5',
                  'FZD6',
                  'FZD7',
                  'FZD8',
                  'FZD9',
                  'GLI1',
                  'GLI2',
                  // tslint:disable-next-line:max-line-length
                  'GLI3',
                  'GRB2',
                  'GSK3B',
                  'GSTP1',
                  'HDAC1',
                  'HDAC2',
                  'HGF',
                  'HHIP',
                  'HIF1A',
                  'HRAS',
                  'HSP90AA1',
                  'HSP90AB1',
                  'HSP90B1',
                  'IGF1',
                  // tslint:disable-next-line:max-line-length
                  'IGF1R',
                  'IKBKB',
                  'IKBKG',
                  'IL6',
                  'IL8',
                  'ITGA2',
                  'ITGA2B',
                  'ITGA3',
                  'ITGA6',
                  'ITGAV',
                  'ITGB1',
                  'JAK1',
                  'JUN',
                  'JUP',
                  'KIT',
                  // tslint:disable-next-line:max-line-length
                  'KITLG',
                  'KLK3',
                  'KRAS',
                  'LAMA1',
                  'LAMA2',
                  'LAMA3',
                  'LAMA4',
                  'LAMA5',
                  'LAMB1',
                  'LAMB2',
                  'LAMB3',
                  'LAMB4',
                  'LAMC1',
                  'LAMC2',
                  'LAMC3',
                  // tslint:disable-next-line:max-line-length
                  'LEF1',
                  'LOC652346',
                  'LOC652671',
                  'LOC652799',
                  'MAP2K1',
                  'MAP2K2',
                  'MAPK1',
                  'MAPK10',
                  'MAPK3',
                  'MAPK8',
                  'MAPK9',
                  'MAX',
                  'MDM2',
                  // tslint:disable-next-line:max-line-length
                  'MECOM',
                  'MET',
                  'MITF',
                  'MLH1',
                  'MMP1',
                  'MMP2',
                  'MMP9',
                  'MSH2',
                  'MSH3',
                  'MSH6',
                  'MTOR',
                  'MYC',
                  'NCOA4',
                  'NFKB1',
                  'NFKB2',
                  'NFKBIA',
                  // tslint:disable-next-line:max-line-length
                  'NKX3-1',
                  'NOS2',
                  'NRAS',
                  'NTRK1',
                  'PAX8',
                  'PDGFA',
                  'PDGFB',
                  'PDGFRA',
                  'PDGFRB',
                  'PGF',
                  'PIAS1',
                  'PIAS2',
                  'PIAS3',
                  'PIAS4',
                  'PIK3CA',
                  // tslint:disable-next-line:max-line-length
                  'PIK3CB',
                  'PIK3CD',
                  'PIK3CG',
                  'PIK3R1',
                  'PIK3R2',
                  'PIK3R3',
                  'PIK3R5',
                  'PLCG1',
                  'PLCG2',
                  'PLD1',
                  'PML',
                  'PPARD',
                  'PPARG',
                  'PRKCA',
                  // tslint:disable-next-line:max-line-length
                  'PRKCB',
                  'PRKCG',
                  'PTCH1',
                  'PTCH2',
                  'PTEN',
                  'PTGS2',
                  'PTK2',
                  'RAC1',
                  'RAC2',
                  'RAC3',
                  'RAD51',
                  'RAF1',
                  'RALA',
                  'RALB',
                  'RALBP1',
                  // tslint:disable-next-line:max-line-length
                  'RALGDS',
                  'RARA',
                  'RARB',
                  'RASSF1',
                  'RASSF5',
                  'RB1',
                  'RBX1',
                  'RELA',
                  'RET',
                  'RHOA',
                  'RUNX1',
                  'RUNX1T1',
                  'RXRA',
                  'RXRB',
                  'RXRG',
                  // tslint:disable-next-line:max-line-length
                  'SHH',
                  'SKP2',
                  'SLC2A1',
                  'SMAD2',
                  'SMAD3',
                  'SMAD4',
                  'SMO',
                  'SOS1',
                  'SOS2',
                  'SPI1',
                  'STAT1',
                  'STAT3',
                  'STAT5A',
                  'STAT5B',
                  'STK36',
                  // tslint:disable-next-line:max-line-length
                  'STK4',
                  'SUFU',
                  'TCEB1',
                  'TCEB2',
                  'TCF7',
                  'TCF7L1',
                  'TCF7L2',
                  'TFG',
                  'TGFA',
                  'TGFB1',
                  'TGFB2',
                  'TGFB3',
                  'TGFBR1',
                  'TGFBR2',
                  'TP53',
                  // tslint:disable-next-line:max-line-length
                  'TPM3',
                  'TPR',
                  'TRAF1',
                  'TRAF2',
                  'TRAF3',
                  'TRAF4',
                  'TRAF5',
                  'TRAF6',
                  'VEGFA',
                  'VEGFB',
                  'VEGFC',
                  'VHL',
                  'WNT1',
                  'WNT10A',
                  'WNT10B',
                  // tslint:disable-next-line:max-line-length
                  'WNT11',
                  'WNT16',
                  'WNT2',
                  'WNT2B',
                  'WNT3',
                  'WNT3A',
                  'WNT4',
                  'WNT5A',
                  'WNT5B',
                  'WNT6',
                  'WNT7A',
                  'WNT7B',
                  'WNT8A',
                  'WNT8B',
                  'WNT9A',
                  'WNT9B',
                  'XIAP',
                  'ZBTB16'
                ]
              });
            }
            resolve(result);
          });
      });
    });
  }
  createCustomPreprocessing(database: string, preprocessing: Preprocessing): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('preprocessing')
          .add(preprocessing)
          .then(w => {
            resolve(w);
          });
      });
    });
  }
  deleteCustomPreprocessing(database: string, preprocessing: Preprocessing): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('preprocessing')
          .where('n')
          .equalsIgnoreCase(preprocessing.n)
          .delete()
          .then(result => {
            resolve(result);
          });
      });
    });
  }
  createCustomGeneset(database: string, geneset: GeneSet): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('genesets')
          .add(geneset)
          .then(w => {
            resolve(w);
          });
      });
    });
  }
  updateCustomGeneset(database: string, geneset: GeneSet): Promise<any> {
    let p = null;
    try {
      p = new Promise(resolve => {
        const db = new Dexie('notitia-' + database);
        db.open().then(v => {
          v.table('genesets')
            .where('n')
            .equalsIgnoreCase(geneset.n)
            .modify({g: geneset.g})
            .then(w => {
              resolve(w);
            });
        });
      });
    } catch (err) {
      console.error("Generic error: " + err);
    }

    return p;
  }
  createCustomGenesetFromSelect(database: string, geneset: GeneSet): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(conn => {
        conn
          .table('genesets')
          .add(geneset)
          .then(v => {
            resolve(v);
          });
      });
    });
  }
  deleteCustomGeneset(database: string, geneset: GeneSet): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('genesets')
          .where('n')
          .equalsIgnoreCase(geneset.n)
          .delete()
          .then(result => {
            resolve(result);
          });
      });
    });
  }
  getCustomCohorts(database: string): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('cohorts')
          .toArray()
          .then(result => {
            const cohorts = result;
            // if (result[0] === undefined) { result[0] = []; }
            cohorts.unshift({ n: 'All Patients', pids: [], sids: [] });
            resolve(cohorts);
          });
      });
    });
  }
  createCustomCohortFromSelect(database: string, cohort: Cohort): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(conn => {
        conn
          .table('cohorts')
          .add(cohort)
          .then(v => {
            resolve(v);
          });
      });
    });
  }
  createCustomCohort(database: string, cohort: Cohort): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = new Dexie('notitia-' + database);
      db.open().then(conn => {
        if(cohort["fromSelection"]) { // save it with no conditions. It was created by manual selection. MJ
          conn
          .table('cohorts')
          .add(cohort)
          .then(v => {
            resolve(v);
          });
          return true;
        }

        const queries = cohort.conditions
          .map(condition => {
            if (condition.field.type === 'number') {
              if (condition.min !== null && condition.max !== null) {
                return conn
                  .table('patient')
                  .where(condition.field.key.replace(/ /gi, '_'))
                  .between(condition.min, condition.max)
                  .toArray();
              }
              if (condition.min !== null) {
                return conn
                  .table('patient')
                  .where(condition.field.key.replace(/ /gi, '_'))
                  .aboveOrEqual(condition.min)
                  .toArray();
              }
              if (condition.max !== null) {
                return conn
                  .table('patient')
                  .where(condition.field.key.replace(/ /gi, '_'))
                  .belowOrEqual(condition.max)
                  .toArray();
              }
              return null;
            }
            return conn
              .table('patient')
              .where(condition.field.key.replace(/ /gi, '_'))
              .equalsIgnoreCase(condition.value)
              .toArray();
          })
          .filter(q => q);

        Promise.all(queries).then(conditions => {
          try {
            if (!cohort.n.trim().length) {
              const d = new Date();
              cohort.n = d.toLocaleDateString + ' ' + d.toLocaleTimeString();
            }
            conditions.forEach((patients, i) => {
              cohort.conditions[i].pids = patients.map(v => v.p);
            });
            const orGroups = cohort.conditions.reduce((p, c) => {
              if (c.condition === 'where' || c.condition === 'and') {
                p.push([c]);
              } else {
                p[p.length - 1].push(c);
              }
              return p;
            }, []);
            const andGroups = orGroups.map(group =>
              group.reduce((p, c) => {
                return Array.from(new Set([...p, ...c.pids]));
              }, [])
            );
            const pids =
              andGroups.length === 1
                ? andGroups[0]
                : Array.from(
                    andGroups.reduce((p, c) => {
                      const cSet = new Set(c);
                      return new Set([...p].filter(x => cSet.has(x)));
                    }, andGroups.shift())
                  );
            cohort.pids = pids;
            conn
              .table('patientSampleMap')
              .toArray()
              .then(ps => {
                const pids2 = new Set(cohort.pids);
                cohort.sids = ps.filter(v => pids2.has(v.p)).map(v => v.s);
                if (cohort.sids.length === 0) {
                  alert('Your query did not match any samples');
                  // reject('Your query did not match any samples');
                  return;
                }
                conn
                  .table('cohorts')
                  .add(cohort)
                  .then(v => {
                    resolve(v);
                  });
              });
          } catch (e) {
            alert('Your query did not match any samples.');
            // reject('Your query did not match any samples');
          }
        });
      });
    });
  }
  deleteCustomCohort(database: string, cohort: Cohort): Promise<any> {
    return new Promise(resolve => {
      const db = new Dexie('notitia-' + database);
      db.open().then(v => {
        v.table('cohorts')
          .where('n')
          .equalsIgnoreCase(cohort.n)
          .delete()
          .then(w => {
            resolve(w);
          });
      });
    });
  }

  resolveGeneSymbols(): void {
    console.log('WARNING TEMPNOTE: resolveGeneSymbols is currently empty.');
    // debugger;
    // API.get('dataset', '/alias/idh1', {}).then(v => {
    //   debugger;
    // }).catch(e => {
    //   debugger;
    // };
    // const dc = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    // const q = {
    //   TableName: 'dataset',
    //   KeyConditionExpression: '#did = :did and #uid = :uid',
    //   ExpressionAttributeNames: {
    //     '#uid': 'userId',
    //     '#did': 'datasetId'
    //   },
    //   ExpressionAttributeValues: {
    //     ':uid': 'us-west-2:35741391-ccbb-4ef4-a686-a667a2c4b6b9',
    //     ':did': 'a5434010-6a86-11e8-9813-ab4170836103'
    //   }
    // };
    // dc.query(q, (err, data) => {
    //   debugger;
    // });
  }

  // "source" is "owner" for your own, or "access" for datasets shared with  you
  getUserDatasets(user:string, token: string, source: string): Promise<any> {
    let uri = `https://jwjvsfcl6c.execute-api.us-west-2.amazonaws.com/${environment.envName.toLocaleUpperCase()}/onco-private-dev-getsets` +
      `?user=${encodeURIComponent(user)}&environment=${environment.envName}&source=${source}&fromOnco=yes&zager=${token}`;
    console.log(`In getUserDatasets, URI = '${uri}'.`);
    let parsed = null;
    return new Promise((resolve, reject) => {
      fetch(uri, {
        method: 'GET',
        mode: 'cors',
        headers: { zager: token }
      })
        .then(res => res.text())
        .then(value => {
          parsed = JSON.parse(value);
          let newDatasets = [];
          parsed.sets.Items
          .map(rawItem => {
            let item = rawItem;
            if(parsed.source=="access"){
              item = rawItem.details
              item.user = rawItem.owner_itemid.split('/')[0];  // Copy owner into the "user" field
            }
            return item
          })
          .filter(item => item.lastError == "none" && item.statusCode == "converted")
          .map(item => {
            let dataSet:iDataSet = {
              project: item.itemId + '|' + item.user,
              studyDetails: item.studyDetails,
              datasetAnnotations: item.datasetAnnotations,
              content: {
                "description": "NA",
                "isHuman": true,
                "isPhi": false,
                "isPublic": false,
                "name": item.datasetName,
                "reviewNumber": "NA",
                "reviewType": "Exempt",
                "site": ""   //e.g. "DSBrain"
              },
              friendlyName: item.datasetName
            };
            newDatasets.push(dataSet);
          })

          console.log(`===== Results for parsing newDatasets ....`);
          console.dir(newDatasets);
          console.log(`end newDatasets results ================`);
          // const base64Url = value.split('.')[1];
          // const base64 = base64Url.replace('-', '+').replace('_', '/');
          // const ds = JSON.parse(window.atob(base64));
          const rv = { env: environment.envName, datasets: newDatasets };
          resolve(rv);
        });
    });
  }

  // getUserDatasets(token: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     fetch('https://oncoscape.v3.sttrcancer.org/dataset', {
  //       method: 'GET',
  //       headers: {
  //         zager: token
  //       }
  //     })
  //       .then(res => res.text())
  //       .then(value => {
  //         console.log(value);
  //         const base64Url = value.split('.')[1];
  //         const base64 = base64Url.replace('-', '+').replace('_', '/');
  //         const ds = JSON.parse(window.atob(base64));
  //         const rv = { token: value, datasets: ds };
  //         resolve(rv);
  //       });
  //   });
  // }

  constructor() {
    DataService.instance = this;

    Dexie.exists('notitia').then(exists => {
      DataService.db = new Dexie('notitia');

      if (exists) {
        DataService.db.open();
        DataService.db.on('versionchange', function() {});
        DataService.db.on('blocked', () => {});
        return;
      }

      DataService.db.version(1).stores({
        genecoords: 'gene, chr, arm, type',
        bandcoords: '++id',
        genemap: 'hugo',
        genelinks: '++id, source, target',
        genetrees: '++id'
      });
      DataService.db.open();
      DataService.db.on('versionchange', function() {});
      DataService.db.on('blocked', () => {});

      requestAnimationFrame(() => {
        DataService.db
          .table('genemap')
          .count()
          .then(count => {
            if (count > 0) {
              return;
            }
            const genecoords = fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/genecoords.json.gz', {
              method: 'GET',
              headers: DataService.headersJson
            }).then(res => res.json());
            const bandcoords = fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/bandcoords.json.gz', {
              method: 'GET',
              headers: DataService.headersJson
            }).then(res => res.json());
            const genemap = fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/genemap.json.gz', {
              method: 'GET',
              headers: DataService.headersJson
            }).then(res => res.json());
            const genelinks = fetch('https://oncoscape-data-2019.s3-us-west-2.amazonaws.com/data/reference/genelinks.json.gz', {
              method: 'GET',
              headers: DataService.headersJson
            }).then(res => res.json());
            observableZip(genecoords, bandcoords, genemap, genelinks).subscribe(result => {
              const hugoLookup = result[2];
              hugoLookup.forEach(gene => {
                gene.hugo = gene.hugo.toUpperCase();
                gene.symbols = gene.symbols.map(sym => sym.toUpperCase());
              });
              const validHugoGenes = new Set(hugoLookup.map(gene => gene.hugo));
              const geneLinksData = result[3].map(d => ({
                source: d[0].toUpperCase(),
                target: d[1].toUpperCase(),
                tension: d[2]
              }));
              const allGenes = Array.from(
                new Set([
                  ...Array.from(new Set(geneLinksData.map(gene => gene.source))),
                  ...Array.from(new Set(geneLinksData.map(gene => gene.target)))
                ])
              );
              const missingGenes = allGenes.filter(gene => !validHugoGenes.has(gene));
              const missingMap = missingGenes.reduce((p, c) => {
                const value = hugoLookup.find(v2 => v2.symbols.indexOf(c) >= 0);
                if (value) {
                  p[c.toString()] = value;
                }
                return p;
              }, {});
              geneLinksData.forEach(link => {
                link.target = validHugoGenes.has(link.target)
                  ? link.target
                  : missingMap.hasOwnProperty(link.target)
                  ? missingMap[link.target].hugo
                  : null;
                link.source = validHugoGenes.has(link.source)
                  ? link.source
                  : missingMap.hasOwnProperty(link.source)
                  ? missingMap[link.source].hugo
                  : null;
              });
              // Filter Out Links That Could Not Be Resolved + Suplement With Additonal Data
              const geneLookup = result[0].reduce((p, c) => {
                p[c.gene] = c;
                return p;
              }, {});
              const links = geneLinksData
                .filter(link => link.source !== null && link.target !== null)
                .map(link => {
                  link.sourceData = geneLookup[link.source];
                  link.targetData = geneLookup[link.target];
                  return link;
                });
              DataService.db.table('genecoords').bulkAdd(result[0]);
              DataService.db.table('bandcoords').bulkAdd(result[1]);
              DataService.db.table('genemap').bulkAdd(result[2]);
              DataService.db.table('genelinks').bulkAdd(links);
            });
          });
      });
    });
  }
}
