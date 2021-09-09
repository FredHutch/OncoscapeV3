import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum } from './../../../model/enum.model';
import { EdgeConfigModel } from './edges.model';
import Dexie from 'dexie';

export const edgesCompute = (config: EdgeConfigModel, worker: DedicatedWorkerGlobalScope): void => {
  if (config.field.type === 'UNDEFINED') {
    worker.postMessage({
      config: config,
      data: { result: [] }
    });
    worker.postMessage('TERMINATE');
    return;
  }

  console.log(`TEMPNOTE: edgesCompute with entities ${config.entityA}, ${config.entityB}.`);
  const edges = {
    getEventsEvents(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getEventsGenes(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getEventsPatients(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getEventsSamples(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getGenesGenes(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        const b = new Set(cfg.markerFilterB);
        resolve(
          [...cfg.markerFilterA].filter(x => b.has(x)).map(g => ({
            a: g,
            b: g,
            c: 0x81d4fa,
            i: null
          }))
        );
      });
    },
    getGenesPatients(cfg: EdgeConfigModel): Promise<any> {
      console.log(`TEMPNOTE: edgesCompute with genes-patients, skip, with cfg.field.key=[${cfg.field.key}]`);
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getGenesSamples(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        console.log(`TEMPNOTE: edgesCompute with cfg.field.key=[${cfg.field.key}]`);
        console.log(`TEMPNOTE: edgesCompute work shifted to edges.graph.`);
        resolve([ 'getLocally' ]);
        return;
      });
    },

    getPatientsPatients(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {});
      });
    },
    getPatientsSamples(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        worker.util.openDatabaseData(config.database).then(db => {
          db.table('patientSampleMap')
            .toArray()
            .then(result => {
              resolve(
                result.map(v => ({
                  a: config.entityA === EntityTypeEnum.PATIENT ? v.p : v.s,
                  b: config.entityB === EntityTypeEnum.PATIENT ? v.p : v.s,
                  c: 0x81d4fa,
                  i: null
                }))
              );
            });
        });
      });
    },
    getSamplesSamples(cfg: EdgeConfigModel): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.edgeOptions === 'None') {
          resolve([]);
          return;
        }
        switch (cfg.field.type) {
          case 'UNDEFINED':
            resolve([]);
            break;
          default:
            worker.util.openDatabaseData(config.database).then(db => {
              db.table('patientSampleMap')
                .toArray()
                .then(result => {
                  resolve(
                    result.map(v => ({
                      a: v.s,
                      b: v.s,
                      c: 0x81d4fa,
                      i: null
                    }))
                  );
                });
            });
            break;
        }
      });
    }
  };

  edges['get' + [config.entityA, config.entityB].sort().join('')](config).then(result => {
    worker.postMessage({
      config: config,
      data: {
        result: result
      }
    });
    worker.postMessage('TERMINATE');
  });

  // if (config.entityA === EntityTypeEnum.SAMPLE && config.entityB === EntityTypeEnum.SAMPLE) {
  //     worker.util.getEdgesSampleSample(config).then( result => {
  //         worker.postMessage({
  //             config: config,
  //             data: {
  //                 result: result
  //             }
  //         });
  //         worker.postMessage('TERMINATE');
  //     });
  // }

  // if (config.entityA === EntityTypeEnum.GENE && config.entityB === EntityTypeEnum.GENE) {
  // worker.util.getEdgesGeneGene(config).then( result => {
  //         worker.postMessage({
  //             config: config,
  //             data: {
  //                 result: result
  //             }
  //         });
  //         worker.postMessage('TERMINATE');
  //     });
  // }

  // if ( (config.entityA === EntityTypeEnum.SAMPLE && config.entityB === EntityTypeEnum.GENE) ||
  //      (config.entityA === EntityTypeEnum.GENE && config.entityB === EntityTypeEnum.SAMPLE) ) {
  //     worker.util.getEdgesGeneSample(config).then( result => {
  //         worker.postMessage({
  //             config: config,
  //             data: {
  //                 result: result
  //             }
  //         });
  //         worker.postMessage('TERMINATE');
  //     });
  // }
};
