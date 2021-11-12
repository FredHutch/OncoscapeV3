import { Injectable } from '@angular/core';
import Dexie from 'dexie';

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs';
import { CollectionTypeEnum } from './../model/enum.model';
import { DataFieldFactory } from './../model/data-field.model';

import { AccessS3 } from "../../accessS3";
import { environment } from 'environments/environment';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { SavedPointsWrapper } from 'app/component/visualization/savedpoints/savedpoints.model';
import { DataService } from './data.service';
import { SavedPointsFormComponent } from 'app/component/visualization/savedpoints/savedpoints.form.component';
import { DatasetUpdates } from 'app/model/dataset-updates.model';
import { DatasetTableInfo } from 'app/model/dataset-table-info.model';

@Injectable()
export class DatasetService {
  // Can I make these private?
  public static API_PATH = '/assets/tcga/';
  public static db: Dexie;
  public static dataTables: Array<{
    tbl: string;
    map: string;
    label: string;
    type: CollectionTypeEnum;
  }>;
  private loader$ = new Subject<any>();
  public loaderStatusUpdate = new Subject<string>();

  public deleteAllDataSets(): Promise<any> {
    return new Promise((resolve, reject) => {
      Dexie.getDatabaseNames().then((dbNames: Array<string>) => {
        Promise.all(dbNames.map(dbName => Dexie.delete(dbName))).then(resolve);
      });
    });
  }

  public getDataset(database: string): Promise<any> {
    var w = window;
    console.log(`dataset.service.getDataset, looking for notitia-[${database}]`);
    return new Promise((resolve, reject) => {
      Dexie.exists('notitia-' + database).then(exists => {
        if (exists) {
          console.log(`dataset.service.getDataset, found notitia-[${database}]`);
          DatasetService.db = new Dexie('notitia-' + database);
          DatasetService.db.open().then(v => {
            w['oncoDatasetServiceDb'] = DatasetService.db;
            DatasetService.db
              .table('dataset')
              .where({ name: database })
              .first()
              .then(result => {
                resolve(result);
              });
          });
        } else {
          console.log(`dataset.service.getDataset, did not find notitia-[${database}]`);
          reject();
        }
      });
    });
  }

  public updateDatasetTable(dbName, changes:DatasetUpdates){
    let promise = this.getDataset(dbName).then(dataset => {
      console.log("==updateDatasetTable, dataset... " );
      console.dir(dataset);
      //return this.getDataset(dbName); // !!!! make this a WRITE
      if (dataset == null) { dataset = {} };
      dataset.updateVersion = changes.version;
      dataset.defaultVizConfig = changes.defaultVizConfig;
      dataset.decorators = 
        changes.decorators ? changes.decorators : [];
      dataset.tooltips = 
        changes.tooltips ? changes.tooltips : [];

      DatasetService.db = new Dexie('notitia-' + dbName);
      return DatasetService.db.open().then(v => {
        return DatasetService.db
          .table('dataset')
          .clear()
          .then(sdfd => {
            console.log("==dataset table cleared, now saving version " + changes.version)
            return DatasetService.db
            .table('dataset')
            .add(dataset)
          })
      });

    });
    return promise;
  }

  public load(args: any, fromPrivate: boolean): Observable<any> {
    DataFieldFactory.setMutationFields(null);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept-Encoding', 'gzip');
    if (args.hasOwnProperty('token')) {
      headers.append('zager', args.token);
    }
    const requestInit: RequestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    this.loaderStatusUpdate.next('Creating Local Database');

    // Get updates first, if exist.
    console.log('About to do loadDatasetUpdates');
    this.loadDatasetUpdates(args.baseUrl + "updates.txt")
    .then(updates =>{
      console.log('updates...');
      console.dir(updates);
      
      // Get manifest file, then go retrieve all the files listed inside it.
      let manifestRequest: any = args.manifest;
      if (fromPrivate == false) {
        // manifestRequest is string
        console.warn('Moving sttrcancer.org ref to AWS.');
        manifestRequest = (manifestRequest as string).replace("oncoscape.v3.sttrcancer.org", "oncoscape-data.s3-us-west-2.amazonaws.com");
      }

      AccessS3.fetchSupportingPresigned(environment.envName, manifestRequest, requestInit, fromPrivate).then(response => {
        return response.json()
      })
        .then(response => {
          // Ensure all matrices are in schema
          response.files
            .filter(v => !v.name.toLowerCase().indexOf('matrix'))
            .map(v => {
              return v.name
                .replace('matrix ', '')
                .replace('matrix_', '')
                .toLowerCase()
                .replace(/_/gi, '');
            })
            .forEach(matrix => {
              response.schema[matrix] = 'm';
              response.schema[matrix + 'Map'] = 's';
            });
          // Ensure Patient Keys Are LCase
          if (response.schema.hasOwnProperty('patient')) {
            response.schema.patient = response.schema.patient.toLowerCase();
          }
          if (response.schema.hasOwnProperty('sample')) {
            response.schema.sample = response.schema.sample.toLowerCase();
          }

          console.log('Dexie exists test - pre');
          Dexie.exists('notitia-' + args.uid).then(function (temp_exists_check) {
            if (temp_exists_check)
              console.log("Database exists");
            else
              console.log("Database doesn't exist");
          }).catch(function (error) {
            console.error("Oops, an error occurred when trying to check database existance");
          });
          console.log('Dexie exists test - post');


          Dexie.exists('notitia-' + args.uid).then(exists => {
            // Add Table Defs
            response.schema.pathways = '++, n';
            response.schema.cohorts = '++, n';
            response.schema.genesets = '++, n';
            response.schema.preprocessing = '++, n';
            // TODO: Temp Patch For Sample Meta Data
            if (!response.schema.hasOwnProperty('sampleMeta')) {
              response.schema.sampleMeta = 'key';
            }

            DatasetService.db = new Dexie('notitia-' + args.uid);
            DatasetService.db.on('versionchange', function (event) { });
            DatasetService.db.on('blocked', () => { });

            let db = DatasetService.db;

            db.version(1).stores(response.schema);
            // TEMPNOTE: For anyone who tried the production V3, we need to signal changes.
            // Put the changes in "version 2".
            db.version(2).stores({
              visSettings: "++id,visEnum" // also "settings", but we don't need to index on that.
            });
            db.version(3).stores({
              eventsMeta: "++id,type,subtype"
            });
            db.version(4).stores({
              miscMeta: "type,data" // For example, type:mutationTypes data:[array of KVPs] 
            });
            db.version(5).stores({
              savedPoints: "name"
            });

            // NOTE from https://dexie.org/docs/Dexie/Dexie.open() ...
            // Even though open() is asynchronous,
            // you can already now start interact with the database.
            // The operations will be pending until open() completes.
            // If open() succeeds, the operations below will resume.
            // If open() fails, the below operations below will fail and
            // their catch() blocks be called.            
            db.open().catch(function (err) {
              console.error('Failed to open db: ' + (err.stack || err));
            });


              // MJ Moved existence test _after_ the version bumps.
              if (exists) {
                console.log('exists ABOUT TO CREATE updatePromisesResult');
                this.getDataset(args.uid)
                .then(dataset => {
                  WorkspaceComponent.instance.updateVersion = dataset.updateVersion;

                  DataService.instance.getPatientData('notitia-' + args.uid, 'patient')
                  .then(patientDataResult => {
                    let sampleMap = patientDataResult.sampleMap;
                    let datasetUpdateVersion:number = 0;
                    if(dataset && dataset.updateVersion){
                      datasetUpdateVersion = dataset.updateVersion
                    }
                    let updatePromises = this.generateUpdatePromises(args.uid, sampleMap, datasetUpdateVersion);
                    Promise.all(updatePromises).then(updatePromisesResult => {
                      console.log('exists COMPLETED updatePromisesResult');
                      this.loader$.next(args);
                      return;
                    });
                  });
                })
              console.log("==if exists true, dont fall out.");
              } else{

                console.log("==if exists is false.")

                this.loaderStatusUpdate.next('Loading Metadata');
                if (response.hasOwnProperty('version')) {
                  console.log('NOTexists');

                    const patient = Object.keys(response.patient).map(v => ({
                      ctype: CollectionTypeEnum.PATIENT,
                      key: v
                        .toLowerCase()
                        .trim()
                        .replace(/ /gi, '_'),
                      label: v.toLowerCase().trim(),
                      tbl: 'patient',
                      type: Array.isArray(response.patient[v]) ? 'STRING' : 'NUMBER',
                      values: response.patient[v]
                    }));
                    const sample = Object.keys(response.sample).map(v => ({
                      ctype: CollectionTypeEnum.SAMPLE,
                      key: v
                        .toLowerCase()
                        .trim()
                        .replace(/ /gi, '_'),
                      label: v.toLowerCase().trim(),
                      tbl: 'sample',
                      type: Array.isArray(response.sample[v]) ? 'STRING' : 'NUMBER',
                      values: response.sample[v]
                    }));

                    let events = [];
                    if (response.events) {
                      events = Object.keys(response.events).map(key => ({
                        type: response.events[key],
                        subtype: key
                      }));
                    }

                    const tbls = response.files
                      .map(file => {
                        const name = file.name.toLowerCase().trim();
                        switch (file.dataType) {
                          case 'patient':
                            return {
                              tbl: 'patient',
                              map: 'patientMap',
                              label: 'Patient',
                              ctype: CollectionTypeEnum.PATIENT
                            };
                          case 'sample':
                            return {
                              tbl: 'sample',
                              map: 'sampleMap',
                              label: 'Sample',
                              ctype: CollectionTypeEnum.SAMPLE
                            };
                          case 'psmap':
                            return null;
                          case 'events':
                            return {
                              tbl: name,
                              map: name + 'Map',
                              label: name,
                              ctype: CollectionTypeEnum.EVENT
                            };
                          case 'mut':
                            return {
                              tbl: name,
                              map: name + 'Map',
                              label: name,
                              ctype: CollectionTypeEnum.MUTATION
                            };
                          case 'matrix':
                            return {
                              tbl: name,
                              map: name + 'Map',
                              label: name,
                              ctype: 
                                name == 'cna' ? CollectionTypeEnum.GISTIC_THRESHOLD 
                                : (name == 'gsva' ? CollectionTypeEnum.GENESET_SCORE : CollectionTypeEnum.MATRIX)
                            };
                        }
                      })
                      .filter(v => v);
                      
                    const updateVersionToWrite = WorkspaceComponent.instance.updatesIncomingData ? WorkspaceComponent.instance.updatesIncomingData.version : 0;
                    console.log(`=== updateVersionToWrite = ${updateVersionToWrite}.`)
                    const dataset = {
                      version: response.version,
                      name: args.uid,
                      events: events,
                      fields: patient.concat(sample),
                      // patients: patient,
                      // samples: sample,
                      tables: tbls,
                      updateVersion: updateVersionToWrite
                    };

                    console.log('==about to save dataset table.');
                    // Add Dataset + Meta Info
                    let metaPromises = [];
                    metaPromises.push(db.table('dataset').add(dataset));
                    metaPromises.push(db.table('patientMeta').bulkAdd(patient));
                    metaPromises.push(db.table('sampleMeta').bulkAdd(sample));
                    if (events.length > 0) {
                      metaPromises.push(db.table('eventsMeta').bulkAdd(events));
                    }
                    Promise.all(metaPromises).then(abcd => {
                      this.loaderStatusUpdate.next('Metadata Loaded');

                      // Send a worker thread message for each table, to load, wait for all to complete.
                      Promise.all(
                        response.files
                          .filter(file => {
                            console.log(`TEMPNOTE: file we should save: ${JSON.stringify(file)}.`);
                            return (file.name !== 'manifest.json');
                          })
                          .map(file => {
                            if (file.dataType === '') {
                              file.dataType = 'matrix';
                            }
                            return new Promise((resolve, reject) => {
                              const loader = new Worker('/assets/loader.js');
                              const onMessage = msgEvent => {
                                const msgFromWebWorker = JSON.parse(msgEvent.data);
                                let rawMsg: string = JSON.stringify(msgFromWebWorker);
                                console.log(`RAW msg in load: ${rawMsg} .`);
                                if (msgFromWebWorker.cmd === 'msg' || msgFromWebWorker.cmd === 'log') {
                                  console.log(`${msgFromWebWorker.cmd} MSGfromLoader: ${msgFromWebWorker.msg}.`);
                                }
                                if (msgFromWebWorker.cmd && msgFromWebWorker.cmd.toLowerCase() === 'terminate') {
                                  loader.removeEventListener('message', onMessage);
                                  loader.terminate();
                                  resolve();
                                } else {
                                  if (msgFromWebWorker.cmd == 'msg') {
                                    // Feedback to pop up in loader status dialog/pane
                                    this.loaderStatusUpdate.next(msgFromWebWorker.msg);
                                  }
                                }
                              };
                              loader.addEventListener('message', onMessage);
                              let loadArgs: any = {
                                env: environment.envName,
                                cmd: 'load',
                                version: response.version,
                                disease: args.disease,
                                uid: args.uid,
                                baseUrl: args.baseUrl,
                                file: file,
                                token: args.token ? args.token : '',
                                fromPrivate: fromPrivate
                              };

                              let loggingArgs: any = {
                                env: loadArgs.env,
                                file: file,
                                token: loadArgs.token.substring(0, 15)
                              }
                              console.log(`MJ Posting load msg for ${JSON.stringify(loggingArgs)}.`)

                              loader.postMessage(loadArgs);
                            });
                          })
                      ).then(v => {
                        // console.log('MJ args = ' + JSON.stringify(args));
                        this.getDataset(args.uid)
                        .then(dataset => {
                          WorkspaceComponent.instance.updateVersion = dataset.updateVersion;

                          DataService.instance.getPatientData('notitia-' + args.uid, 'patient')
                          .then(patientDataResult => {
                            let sampleMap = patientDataResult.sampleMap;
                            console.log('update ready to go: initial database created.');
                            console.log('NOTexists ABOUT TO CREATE updatePromisesResult');
                            let updatePromises = this.generateUpdatePromises(args.uid, sampleMap, 0); // Cannot be datasetUpdateVersion, because we just created the database.
                            Promise.all(updatePromises).then(updatePromisesResult => {
                              console.log('NOTexists COMPLETED updatePromisesResult');
                              this.loader$.next(args);
                              this.loaderStatusUpdate.next('Performing Initial Analysis');
                            });
                          });
                        });        
                    });
                  });
                } else {            // V1 Data Mode
                  console.log('NOTE: loading data in V1 mode. '); //MJ
                  // Patient Meta Data
                  const fields = Object.keys(response.fields).map(v => ({
                    ctype: CollectionTypeEnum.PATIENT,
                    key: v.toLowerCase(),
                    label: v.replace(/_/gi, ' '),
                    tbl: 'patient',
                    type: Array.isArray(response.fields[v]) ? 'STRING' : 'NUMBER',
                    values: response.fields[v]
                  }));
                  const events = Object.keys(response.events).map(key => ({
                    type: response.events[key],
                    subtype: key
                  }));
                  const tbls = response.files
                    .map(v => {
                      const dt = v.dataType.toLowerCase();
                      const name = v.name
                        .replace('matrix ', '')
                        .replace('matrix_', '')
                        .toLowerCase()
                        .replace(/_/gi, '');
                      return dt === 'clinical'
                        ? {
                          tbl: 'patient',
                          map: 'patientMap',
                          label: 'Patient',
                          ctype: CollectionTypeEnum.PATIENT
                        }
                        : dt === 'events'
                          ? {
                            tbl: name,
                            map: name + 'Map',
                            label: name,
                            ctype: CollectionTypeEnum.EVENT
                          }
                          : (dt === 'matrix' && name == "cna") // TBD: Support this in import
                            ? {
                              tbl: name,
                              map: name + 'Map',
                              label: name,
                              ctype: CollectionTypeEnum.GISTIC_THRESHOLD
                            }
                            : dt === 'matrix'
                            ? {
                              tbl: name,
                              map: name + 'Map',
                              label: name,
                              ctype: CollectionTypeEnum.MATRIX
                            }
                              : dt === 'gistic'
                                ? {
                                  tbl: name,
                                  map: name + 'Map',
                                  label: name,
                                  ctype: CollectionTypeEnum.GISTIC
                                }
                                : dt === 'gistic_threshold'
                                  ? {
                                    tbl: name,
                                    map: name + 'Map',
                                    label: name,
                                    ctype: CollectionTypeEnum.GISTIC_THRESHOLD
                                  }
                                  : dt === 'mut'
                                    ? {
                                      tbl: name,
                                      map: name + 'Map',
                                      label: name,
                                      ctype: CollectionTypeEnum.MUTATION
                                    }
                                    : dt === 'rna'
                                      ? {
                                        tbl: name,
                                        map: name + 'Map',
                                        label: name,
                                        ctype: CollectionTypeEnum.RNA
                                      }
                                      : null;
                    })
                    .filter(v => v);

                  const updateVersionToWrite = WorkspaceComponent.instance.updatesIncomingData ? WorkspaceComponent.instance.updatesIncomingData.version : 0;
                  console.log(`=== V1 updateVersionToWrite = ${updateVersionToWrite}.`)

                  const dataset:DatasetTableInfo = {
                    name: args.uid,
                    title: args.uid, // ! should be human friendly
                    version: 1, // ???
                    events: events,
                    fields: fields,
                    tables: tbls,
                    updateVersion: updateVersionToWrite,
                    defaultVizConfig: null ,
                    decorators: [],
                    tooltips: []                   
                  };

                  // Add Dataset + Meta Info
                  db.table('dataset').add(dataset);
                  db.table('patientMeta').bulkAdd(fields).then(() => {
                    this.loaderStatusUpdate.next('Metadata Loaded');
                    // console.log('MJ metadata loaded');
                    Promise.all(
                      response.files
                        .filter(file => file.name !== 'manifest.json')
                        .map(file => {
                          if (file.dataType === '') {
                            file.dataType = 'matrix';
                          }
                          return new Promise((resolve, reject) => {
                            const loader = new Worker('/assets/loader.js');
                            const onMessage = msgEvent => {
                              const msgFromLoader = JSON.parse(msgEvent.data);
                              if (msgFromLoader.cmd && msgFromLoader.cmd.toLowerCase() === 'terminate') {
                                loader.removeEventListener('message', onMessage);
                                loader.terminate();
                                resolve();
                              } else {
                                if (msgFromLoader.cmd && msgFromLoader.cmd == 'log') {                         // Feedback to pop up in loader status dialog/pane
                                  console.log(msgFromLoader.msg);
                                } else {
                                  this.loaderStatusUpdate.next(msgFromLoader.msg);
                                }
                              }
                            };
                            loader.addEventListener('message', onMessage);
                            loader.postMessage({
                              cmd: 'load',
                              disease: args.disease,
                              uid: args.uid,
                              baseUrl: args.baseUrl,
                              file: file,
                              token: args.token ? args.token : ''
                            });
                          });
                        })
                    ).then(v => {
                      // console.log('MJ outside promiseall of response.files.');
                      this.loader$.next(args);
                      this.loaderStatusUpdate.next('Performing Initial Analysis');
                    });

                  });
                }
                // ===== End after all update promises resolve.
              }

          });
          console.log('MJ: After Dexie.exists, in load().');

          
        })
        .catch(err => {
          alert('An error happened while trying to access private data.');
          console.log('Private data error is...');
          console.log(err);
        });
//      return this.loader$;
    });
    return this.loader$;
  }

  generateUpdatePromises(dbName:string, sampleMap:any, datasetUpdateVersion:number) {
    // let dummySleepPromise1 = this.dummySleep(6000, 'longSleep');
    // let dummySleepPromise2 = this.dummySleep(3000, 'shortSleep');
    let dummyPromise = new Promise ((resolve, reject) => {
      console.log('== processing update dummyPromise')
      resolve(true)
    })
    let updatePromises = [dummyPromise];

    let changes = WorkspaceComponent.instance.updatesIncomingData;
    if(changes==null) {
      changes = new DatasetUpdates();
      changes.version = 0;
    }
    let mustUpdate = changes.version > datasetUpdateVersion;

    if(mustUpdate && WorkspaceComponent.instance.updatesIncomingData) {
      WorkspaceComponent.instance.updateVersion = changes.version;

      // For each type of database change seen, create a promise.
      console.log('incoming updates...')
      console.dir(changes);

      // updating dataset table
      updatePromises.push(this.updateDatasetTable(dbName, changes));

      // savedPoints
      if(changes.savedPoints){
        changes.savedPoints.map(sp => {
          console.log(`Should (over)write saved points "${sp.name}", ${sp.points.length} points.`)
          let wrapper:SavedPointsWrapper = new SavedPointsWrapper();
          wrapper.name = sp.name;
          wrapper.savedPoints = SavedPointsFormComponent.SavedPointsFromUpdatePoints( sp.points, sampleMap);
          wrapper.created = 12345; // ???

          let spPromise = DataService.instance.putSavedPointsWrapper(dbName, wrapper);
          updatePromises.push(spPromise);
        })
      }

    }

    return updatePromises;
  }

  dummySleep (ms, tag) {
    return new Promise((resolve, reject) => {
      console.log("=== update dummySleep START timeout "+ tag)
      setTimeout(() => {
        console.log("=== update dummySleep COMPLETED timeout "+ tag)
        resolve(true)
      }, ms)
    })
  }

  async loadDatasetUpdates(updatesUrl: string) {
    let self = this;
    WorkspaceComponent.instance.updatesIncomingData = null;
    let tempWorkspace = WorkspaceComponent.instance;
    console.log(`WS projectName? '${tempWorkspace.projectName}'`);

    let headers = {};
    headers['Content-Type'] = 'text/plain'; // 'application/json';
    //headers['Accept-Encoding'] = 'gzip'; //
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET';
    headers['Access-Control-Allow-Headers'] = 'content-type, content-encoding';
    const requestInit: RequestInit = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'reload'
    };

    updatesUrl = (updatesUrl as string).replace("oncoscape.v3.sttrcancer.org", "oncoscape-data.s3-us-west-2.amazonaws.com");

    let res = await fetch(updatesUrl, requestInit)
      .then(response => {
        if (response.status == 200) {
          response.text().then(function (text) {
            //console.log('text...')
            //console.log(text);
            let updates = JSON.parse(text);
            console.log('UPDATES Version = ' + updates.version);
            let currentVersion = WorkspaceComponent.instance.updateVersion;
            if(updates.version > currentVersion) {
              console.log(`Need to upgrade from version ${currentVersion} to ${updates.version}.`);
              WorkspaceComponent.instance.updatesIncomingData = updates;
            } else {
              console.log(`Still on dataset version ${currentVersion}.`);
            }
          });
        } else {
          console.log(`Updates request gave status ${response.status}.`)
        }
      })

    return res;
  }

  constructor() {}
}
