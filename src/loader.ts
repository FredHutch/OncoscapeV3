import Dexie from 'dexie';
import { AccessS3 } from "./accessS3";
import { environment } from './environments/environment';
import { VisualizationEnum } from './app/model/enum.model';
import { inspect } from 'util'
import { resolve } from 'url';

// declare var Dexie: any;

/* Patient Sample Map, Dataset, Mutation */
/* Add Compounind index For Mut */
export interface LoaderWorkerGlobalScope extends Window {
  postMessage(data: any, transferList?: any): void;
  importScripts(src: string): void;
  MJbackchannelLog(msg: string): void;
}
const mutationType = {
  1: 'Missense',
  2: 'Silent',
  4: 'Frame_Shift_Del',
  8: 'Splice_Site',
  16: 'Nonsense_Mutation',
  32: 'Frame_Shift_Ins',
  64: 'RNA',
  128: 'In_Frame_Del',
  256: 'In_Frame_Ins',
  512: 'Nonstop_Mutation',
  1024: 'Translation_Start_Site',
  2048: 'De_novo_Start_OutOfFrame',
  4096: 'De_novo_Start_InFrame',
  8192: 'Intron',
  // tslint:disable-next-line:quotemark
  16384: "3'UTR",
  32768: 'IGR',
  // tslint:disable-next-line:quotemark
  65536: "5'UTR",
  131072: 'Targeted_Region',
  262144: 'Read-through',
  // tslint:disable-next-line:quotemark
  524288: "5'Flank",
  // tslint:disable-next-line:quotemark
  1048576: "3'Flank",
  2097152: 'Splice_Site_SNP',
  4194304: 'Splice_Site_Del',
  8388608: 'Splice_Site_Ins',
  16777216: 'Indel',
  33554432: 'Other'
};

let baseUrl = 'https://oncoscape.v3.sttrcancer.org/data/tcga/';
//let token = '';

const requestInit = (token): RequestInit => {
  if (token == '') {
    return requestPublicInit();
  } else {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept-Encoding', 'gzip');
    headers.append('zager', token);
    let aRequestInit:RequestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    return aRequestInit;
  }
};
  
// Only cache the public request init. If it has a token, we need to make a new init.
let _requestInit = null;
const requestPublicInit = (): RequestInit => {
  if (!_requestInit) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept-Encoding', 'gzip');
    _requestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
  }
  return _requestInit;
};

// const requestInit: RequestInit = {
//   method: 'GET',
//   headers: headers,
//   mode: 'cors',
//   cache: 'default'
// };

const report = (msg: string) => {
  const date = new Date();
  const inbetween = self as unknown;
  const me = inbetween as LoaderWorkerGlobalScope;
  const fullMessage:string = JSON.stringify({
    cmd: 'msg',
    msg: msg
  });
  me.postMessage(fullMessage);
};

const MJbackchannelLog = (msg: string) => {
  const date = new Date();
  const inbetween = self as unknown;
  const me = inbetween as LoaderWorkerGlobalScope;
  const fullMessage:string = JSON.stringify({
    cmd: 'log',
    msg: msg
  });
  // commented out for now: me.postMessage(fullMessage);
};

const processResource = (env: string, resource: { name: string; dataType: string; file: string }): Promise<any> => {
  resource.name = resource.name.replace(/ /gi, '').toLowerCase();
  return resource.dataType === 'clinical' || resource.dataType === 'patient' 
    ? loadPatient(env, resource.name, resource.file, false, '')
    : resource.dataType === 'psmap'
    ? loadPatientSampleMap(env, resource.name, resource.file, false, '')
    : resource.dataType === 'matrix'
    ? loadMatrix(env, resource.name, resource.file, false, '')
    : resource.dataType === 'gistic_threshold'
    ? loadMatrix(env, resource.name, resource.file, false, '')
    : resource.dataType === 'gistic'
    ? loadGistic(env, resource.name, resource.file, false, '')
    : resource.dataType === 'mut'
    ? loadMutation(env, resource.name, resource.file, false, '')
    : resource.dataType === 'rna'
    ? loadRna(env, resource.name, resource.file, false, '')
    : resource.dataType === 'events'
    ? loadEvents(env, resource.name, resource.file, false, '')
    : null;
};

// Complete
const loadEvents = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Loading Events');
      return response.json();
    })
    .then(response => {
      report('Events Parsed');
      const eventTable = [];
      const mult = 86400000;

      let lookup:Array<any> = null;
      try {
        lookup = Object.keys(response.map).reduce((p, c) => {
          p.push({ type: response.map[c], subtype: c });
          return p;
        }, []);
      } catch (respReduceErr) {
        console.error(`In loadevents, response reduce error is...`);  
        console.dir(respReduceErr);
      }

      const data = response.data.map(datum =>
        Object.assign(
          {
            p: datum[0].toLowerCase(),
            start: datum[2], // * 86400000,
            end: datum[3], // * 86400000,
            data: datum[4]
          },
          lookup[datum[1]]
        )
      );
      report('Processing Events');
      // For timeline visualization, pass along the barConfig from the file.
      //visSettings: "visEnum,settings
      let visSettingsToAdd = [{
        visEnum: VisualizationEnum.TIMELINES,
        settings: JSON.stringify(response.barsConfig)
      }]
      
      return new Promise((resolve, reject) => {
        resolve([{ tbl: name, data: data, visSettings: visSettingsToAdd }]);
      });
    });
};

// Complete
const loadPatient = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Subjects...');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate, self as LoaderWorkerGlobalScope)
    .then(response => {
      report('Subjects Loaded');
      return response.json();
    })
    .then(response => {
      report('Parsing Subjects');
      // MJbackchannelLog('Subjects loaded response.fields = ' + JSON.stringify(response.fields));
      
      const patientMetaTable = Object.keys(response.fields).map((key, index) => ({
        ctype: 2,
        key: key.toLowerCase(),
        label: key.replace(/_/gi, ' '),
        tbl: 'patient',
        type: Array.isArray(response.fields[key]) ? 'STRING' : 'NUMBER',
        values: response.fields[key]
      }));

      const patientTable = response.ids.map((id, index) => {
        return patientMetaTable.reduce(
          (p, v, i) => {
            const value = response.values[index][i];
            p[v.key.toLowerCase()] = v.type === 'NUMBER' ? value : v.values[value];
            return p;
          },
          { p: id.toLowerCase() }
        );
      });

      report('Processing Clinical');
      return new Promise((resolve, reject) => {
        resolve([
          // { tbl: 'patientMeta', data: patientMetaTable },
          { tbl: 'patient', data: patientTable }
        ]);
      });
    })
    .catch(error => {
      MJbackchannelLog('Caught error in loadPatient : ' + JSON.stringify(error));
    });
};

const loadSample = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Samples');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Samples Loaded');
      return response.json();
    })
    .then(response => {
      report('Parsing Samples');
      const sampleMetaTable = Object.keys(response.fields).map((key, index) => ({
        ctype: 1,
        key: key.toLowerCase(),
        label: key.replace(/_/gi, ' '),
        tbl: 'sample',
        type: Array.isArray(response.fields[key]) ? 'STRING' : 'NUMBER',
        values: response.fields[key]
      }));
      const sampleTable = response.ids.map((id, index) => {
        return sampleMetaTable.reduce(
          (p, v, i) => {
            const value = response.values[index][i];
            p[v.key.toLowerCase().replace(/\s/gi, '_')] = v.type === 'NUMBER' ? value : v.values[value];
            return p;
          },
          { s: id.toLowerCase() }
        );
      });
      report('Processing Samples');
      return new Promise((resolve, reject) => {
        resolve([
          // { tbl: 'patientMeta', data: patientMetaTable },
          { tbl: 'sample', data: sampleTable }
        ]);
      });
    });
};

// Complete
const loadMatrix = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Molecular Matrix');
  const fullFilePath = baseUrl + file + '.gz';
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Molecular Matrix Loaded');
      return response.json();
    })
    .then(response => {
      report('Parsing Molecular Matrix');
      const sampleIds = response.ids.map((s, i) => ({
        i: i,
        s: s.toLowerCase()
      }));
      if (response.values === undefined) {
        response.values = response.data;
      }
      const sampleTable = response.values.map((v, i) => {
        const obj = v.reduce(
          (p, c) => {
            p.min = Math.min(p.min, c);
            p.max = Math.max(p.max, c);
            p.mean += c;
            return p;
          },
          { m: response.genes[i], d: v, min: Infinity, max: -Infinity, mean: 0 }
        );
        obj.mean /= v.length;
        return obj;
      });
      report('Processing Molecular Matrix');
      return new Promise((resolve, reject) => {
        resolve([{ tbl: name, data: sampleTable }, { tbl: name + 'Map', data: sampleIds }]);
      });
    });
};

// Complete
const loadGistic = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Gistic Scores');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Gistic Loaded');
      return response.json();
    })
    .then(response => {
      report('Parsing Gistic Scores');
      const gisticSampleIds = response.ids.map((s, i) => ({
        i: i,
        s: s.toLowerCase()
      }));
      const gisticTable = response.values.map((v, i) => {
        const obj = v.reduce(
          (p, c) => {
            p.min = Math.min(p.min, c);
            p.max = Math.max(p.max, c);
            p.mean += c;
            return p;
          },
          { m: response.genes[i], d: v, min: Infinity, max: -Infinity, mean: 0 }
        );
        obj.mean /= v.length;
        return obj;
      });
      report('Processing Gistic Scores');
      return new Promise((resolve, reject) => {
        resolve([{ tbl: name, data: gisticTable }, { tbl: name + 'Map', data: gisticSampleIds }]);
      });
    });
};

const loadPatientSampleMap = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Patient Sample Maps');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Parsing Patient Sample Maps');
      return response.json();
    })
    .then(response => {
      report('Processing Patient Sample Maps');
      const data = Object.keys(response).reduce((p, c) => {
        response[c].forEach(v => {
          p.push({ p: c.toLowerCase(), s: v.toLowerCase() });
        });
        return p;
      }, []);
      return new Promise((resolve, reject) => {
        resolve([{ tbl: 'patientSampleMap', data: data }]);
      });
    });
};

const loadMutation = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Mutation Data');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Parsing Mutation Data');
      return response.json();
    })
    .then(response => {
      report('Processing Mutation Data');
      const ids = response.ids;
      const genes = response.genes;
      const mType = mutationType;
      const lookup = Object.keys(mType);

      const data = response.values
        .map(v =>
          v
            .split('-')
            .map(v1 => parseInt(v1, 10))
            .map((v2, i) => (i === 0 ? genes[v2] : i === 1 ? ids[v2] : v2))
        )
        .reduce((p, c) => {
          p.push(
            ...lookup.filter(v => parseInt(v, 10) & c[2]).map(v => ({ m: c[0], s: c[1].toLowerCase(), t: mType[v] }))
          );
          return p;
        }, []);

      try {
        var sampleCountHolder = {};
        // Count mutation instances per sample ("s").
        data.forEach(function(d) {
          if (sampleCountHolder.hasOwnProperty(d.s)) {
            sampleCountHolder[d.s] = sampleCountHolder[d.s] + 1;
          } else {
            sampleCountHolder[d.s] = 1;
          }
        });
        
        var sampleCountArray = [];
        
        for (var prop in sampleCountHolder) {
          sampleCountArray.push({ name: prop.replace('"',''), value: sampleCountHolder[prop] });
        }
      } catch (errJ) {
        MJbackchannelLog('Error = ' + errJ.name +',   ' + errJ.message);
      }
  
      return new Promise((resolve, reject) => {
        resolve([{ tbl: 'mut', data: data }]);
      });
    });
};

const loadMutationV3 = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading Mutation Data');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Parsing Mutation Data');
      return response.json();
    })
    .then(response => {
      report('Processing Mutation Data');
      const muts = Object.keys(response.muts).reduce((p, c) => {
        p[response.muts[c]] = c;
        return p;
      }, {});
      const ids = response.ids;
      const genes = response.genes;
      const mType = muts;
      // report(`loadMutationV3, muts=${JSON.stringify(mType)}.`);
      const lookup = Object.keys(mType);
      const data = response.values
        .map(v =>
          v
            .split('-')
            .map(v1 => parseInt(v1, 10))
            .map((v2, i) => (i === 0 ? genes[v2] : i === 1 ? ids[v2] : v2))
        )
        .reduce((p, c) => {
          p.push(
            ...lookup.filter(v => parseInt(v, 10) & c[2]).map(v => ({ m: c[0], s: c[1].toLowerCase(), t: mType[v] }))
          );
          return p;
        }, []);


      return new Promise((resolve, reject) => {
        // TODO: This is a bug.  Need to replace token mut with value from result
        resolve([{ tbl: 'mut', data: data, mType: mType }]);
      });
    });
};

// Complete
const loadRna = (env: string, name: string, file: string, fromPrivate:boolean=false, token:string): Promise<any> => {
  report('Loading RNA Data');
  return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
    .then(response => {
      report('Parsing Rna Data');
      return response.json();
    })
    .then(response => {
      report('Processing RNA Data');
      const rnaSampleIds = response.ids.map((s, i) => ({
        i: i,
        s: s.toLowerCase()
      }));
      const rnaTable = response.values.map((v, i) => {
        const obj = v.reduce(
          (p, c) => {
            p.min = Math.min(p.min, c);
            p.max = Math.max(p.max, c);
            p.mean += c;
            return p;
          },
          { m: response.genes[i], d: v, min: Infinity, max: -Infinity, mean: 0 }
        );
        obj.mean /= v.length;
        return obj;
      });
      return new Promise((resolve, reject) => {
        resolve([{ tbl: name, data: rnaTable }, { tbl: name + 'Map', data: rnaSampleIds }]);
      });
    });
};

const processV31 = (env: string, resource: { name: string; dataType: string; file: string }, fromPrivate:boolean, token:string): Promise<any> => {
  report('in processV31, ' + resource.file);
  switch (resource.dataType.toLowerCase().trim()) {
    case 'patient':
      return loadPatient(env, resource.name, resource.file, fromPrivate, token);
    case 'sample':
      return loadSample(env, resource.name, resource.file, fromPrivate, token);
    case 'matrix':
      return loadMatrix(env, resource.name, resource.file, fromPrivate, token);
    case 'events':
      return loadEvents(env, resource.name, resource.file, fromPrivate, token);
    case 'mut':
      return loadMutationV3(env, resource.name, resource.file, fromPrivate, token);
    case 'psmap':
      return loadPatientSampleMap(env, resource.name, resource.file, fromPrivate, token);

      default:
      return new Promise((resolve, reject) => {
        resolve();
      });
  }
};

const countMutationsIfPresent = (db: Dexie, tables: Array<{ tbl: string; data: Array<any> }>): Promise<any> => {
  // MJbackchannelLog(`table count = ${tables.length}`);
  // MJbackchannelLog(`table 0 = ${tables[0].tbl}`);
  // MJbackchannelLog(`table 0 data...`);
  // MJbackchannelLog(JSON.stringify(tables[0].data));
  
  if(tables[0].tbl == 'mut') {
    return new Promise((resolve, reject) => {
      // TBD: count the mutations per gene.
      // Here is some old code to repurpose.
      /*
          return AccessS3.fetchSupportingPresigned(env, baseUrl + file + '.gz', requestInit(token), fromPrivate)
            .then(response => {
              report('Parsing Rna Data');
              return response.json();
            })
            .then(response => {
              report('Processing RNA Data');
              const rnaSampleIds = response.ids.map((s, i) => ({
                i: i,
                s: s.toLowerCase()
              }));
              const rnaTable = response.values.map((v, i) => {
                const obj = v.reduce(
                  (p, c) => {
                    p.min = Math.min(p.min, c);
                    p.max = Math.max(p.max, c);
                    p.mean += c;
                    return p;
                  },
                  { m: response.genes[i], d: v, min: Infinity, max: -Infinity, mean: 0 }
                );
                obj.mean /= v.length;
                return obj;
              });
              return new Promise((resolve, reject) => {
                resolve([{ tbl: name, data: rnaTable }, { tbl: name + 'Map', data: rnaSampleIds }]);
              });
            });
      */
      resolve(true);
    });
  } else {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

};

onmessage = function(e) {
  const inbetween = self as unknown;
  const me = inbetween as LoaderWorkerGlobalScope;

  // MJbackchannelLog(`onmessage in loader.ts. now e.data.cmd=${e.data.cmd}.`);
  // MJbackchannelLog(`onmessage in loader.ts. e.data.env passed in =${e.data.env}.`);
  // MJbackchannelLog(`onmessage in loader.ts. env=${environment.envName}, file=${JSON.stringify(e.data.file)}.`);
  // MJbackchannelLog(`And e.data=${JSON.stringify(e.data)}.`); 
  switch (e.data.cmd) {
    case 'load':
      const db = new Dexie('notitia-' + e.data.uid);
      baseUrl = e.data.baseUrl;
      const token = e.data.token;
      db.open().then(v => {
        if (e.data.hasOwnProperty('version')) {
          if (e.data.version === '3.1') {
            try {
              processV31(e.data.env, e.data.file, e.data.fromPrivate, token).then(values => {
                const tables: Array<{ tbl: string; data: Array<any>; visSettings: Array<any> }> = values;
                const summarizeTablesAsText  = tables.map(t => {
                  return {
                    tbl: t.tbl,
                    numItems: t.data.length
                  }
                });
                Promise.all(
                  tables.map(tbl => {
                    if (tbl.tbl.toLowerCase().trim() === 'sample' || tbl.tbl.toLowerCase().trim() === 'patient') {
                      const d = tbl.data.map(datum => {
                        const rv = Object.keys(datum).reduce((p, c) => {
                          p[c.trim().replace(/ /gi, '_')] = datum[c];
                          return p;
                        }, {});
                        return rv;
                      });

                      return db.table(tbl.tbl).bulkAdd(d);
                    }

                    let d:any = [];
                    let keyName = 'm';
                    if (tbl.tbl.endsWith('Map')) {
                      keyName = 's'
                    }
                   
                    let mutationTypes = null;
                    if (tbl['mType'] && tbl.tbl.toLowerCase().trim() === 'mut') { // map of mutation types, if this is mutation
                      mutationTypes = tbl['mType'];
                    }

                    let checkForUniqueIds:boolean = e.data.file.dataType == 'matrix';
                    let previousKey:string = ''; //TEMPNOTE: Assumes data is sorted by key, coming in.
                    let seenSymbolsSet = new Set();
                    tbl.data.map(datum => {
                      if (checkForUniqueIds && seenSymbolsSet.has(datum[keyName])) {
                        MJbackchannelLog('TBD: Compile notes on which keys have been seen before.');
                        MJbackchannelLog(`TEMPNOTE: Table ${tbl.tbl}, Have already seen key'${datum.m}'.`);
                      } else {
                        d.push(datum);
                        if(checkForUniqueIds) {
                          seenSymbolsSet.add(datum[keyName]);
                        }
                      }
                    });
                    return db.table(tbl.tbl).bulkAdd(d)
                    .then( something => {
                      if (mutationTypes) {  //log them
                        return db.table('miscMeta').add({
                          type: 'mutationTypes',
                          data: mutationTypes
                        }).then(xyz => {
                          return countMutationsIfPresent(db, tables);
                        });
                        
                      }
                    });
                  })
                )
                .catch(function(err) {
                  // log that I have an error, return the entire array;
                  MJbackchannelLog(`#2 probably failed to bulkAdd.. ${inspect(err)}.`);
                  return err;
                })
                .then((input) => {
                  //debugger;
                  //MJbackchannelLog(`MJ INPUT for tbl ${tables[0].tbl} = ${inspect(input).substring(0,30)+'... '}.`);
                  if (tables[0].visSettings && tables[0].visSettings.length >0 ) {
                    report('Saving related settings ... ');
                    return db.table('visSettings').bulkAdd(tables[0].visSettings);
                  }
                }
                ).then((stuff) => {
                  report('Now Saving ' + tables[0].tbl);
                  me.postMessage(
                    JSON.stringify({
                      cmd: 'terminate'
                    })
                  );
                });
              });
            } catch (e) {
              MJbackchannelLog('LOADER error e is....'); // Show details separately in case stringify fails.
              MJbackchannelLog('err: ' + JSON.stringify(e)); //' + JSON.stringify(e.data)+'.');

            }
            // MJbackchannelLog(`MJ loader.ts3.1 appears to have finished file [${JSON.stringify(e.data.file)}]`);
          } else {
            MJbackchannelLog(`ERROR - Unknown version seen in Loader.onmessage: [${JSON.stringify(e.data.version)}].`);
          }
        } else {
          try {
            processResource(e.data.env, e.data.file).then(values => {
              const tables: Array<{ tbl: string; data: Array<any> }> = values;
              tables.forEach(w => {
                if (w.tbl.indexOf('matrix') === 0) {
                  w.tbl = w.tbl.replace('matrix', '').replace(/_/gi, '');
                }
              });

              Promise.all(tables.map(tbl => db.table(tbl.tbl).bulkAdd(tbl.data)))
                .then(xyz => {
                  return countMutationsIfPresent(db, tables);
                })
                .then(() => {
                  report('Saving ' + tables[0].tbl);
                  me.postMessage(
                    JSON.stringify({
                      cmd: 'terminate'
                    })
                  );
                })
                .catch((err1) => {
                  MJbackchannelLog('Loader error after processResource = ' + JSON.stringify(err1)+'.');
                });
            });
          } catch (err2) {
            MJbackchannelLog('Loader err2.'); // Show details separately in case stringify fails.
            MJbackchannelLog('Loader err2 = ' + JSON.stringify(err2)+'.');
          }
        }
      });
      break;
  }
};
