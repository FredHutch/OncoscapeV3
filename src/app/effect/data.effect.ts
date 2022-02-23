import { ChromosomeConfigModel } from './../component/visualization/chromosome/chromosome.model';
import { DatasetDescription } from './../model/dataset-description.model';
import { from as observableFrom, of as observableOf } from 'rxjs';
import { mergeMap, switchMap, map } from 'rxjs/operators';
import { ScatterConfigModel } from './../component/visualization/scatter/scatter.model';
import { Observable } from 'rxjs/Rx';
import { TipSetVisualizationAction } from './../action/tip.action';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as data from 'app/action/data.action';
import * as tip from 'app/action/tip.action';
import { GraphEnum, EntityTypeEnum, VisualizationEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import * as compute from './../action/compute.action';
import { Auth } from 'aws-amplify';
import { DataTable, DataField, DataFieldFactory } from './../model/data-field.model';
import { OncoData } from 'app/oncoData';

// tslint:disable-next-line:max-line-length
import {
  DataAddCohortAction,
  DataAddGenesetAction,
  DataAddPathwayAction,
  DataDelCohortAction,
  DataDelGenesetAction,
  DataDelPathwayAction,
  DataLoadedAction,
  DataLoadFromDexieAction,
  DataUpdateCohortsAction,
  DataUpdateGenesetAction,
  DataUpdateGenesetsAction,
  DataAddPreprocessingAction,
  DataDelPreprocessingAction,
  DataUpdatePreprocessingAction,
  DataUpdatePathwayAction
} from './../action/data.action';
import { WorkspaceConfigAction } from './../action/graph.action';
import { LoaderShowAction, LoaderHideAction } from './../action/layout.action';
import { UnsafeAction } from './../action/unsafe.action';
import { EdgeConfigModel } from './../component/visualization/edges/edges.model';
import { GenomeConfigModel } from './../component/visualization/genome/genome.model';
import { SurvivalConfigModel } from './../component/visualization/survival/survival.model';
import { CollectionTypeEnum } from './../model/enum.model';
import { WorkspaceLayoutEnum } from './../model/enum.model';
import { WorkspaceConfigModel } from './../model/workspace.model';
import { DataService } from './../service/data.service';
import { DatasetService } from './../service/dataset.service';
import { PcaConfigModel } from '../component/visualization/pca/pca.model';
import { ProteinConfigModel } from 'app/component/visualization/protein/protein.model';
import { TimelinesConfigModel } from 'app/component/visualization/timelines/timelines.model';
import { MdsConfigModel } from 'app/component/visualization/mds/mds.model';
import { config } from 'aws-sdk';
import { SavedPointsConfigModel } from 'app/component/visualization/savedpoints/savedpoints.model';
import { TableLoaderConfigModel } from 'app/component/visualization/tableLoader/tableLoader';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';

@Injectable()
export class DataEffect {
  // Pathway Crud
  @Effect()
  addPathway: Observable<Action> = this.actions$.pipe(ofType(data.DATA_ADD_PATHWAY)).pipe(
    switchMap((args: DataAddPathwayAction) => {
      return observableFrom(
        this.dataService
          .createCustomPathway(args.payload.database, args.payload.pathway)
          .then(() => this.dataService.getCustomPathways(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdatePathwayAction(args));
    })
  );

  @Effect()
  loadVisualizationTip: Observable<Action> = this.actions$.pipe(ofType(tip.TIP_SET_VISUALIZATION)).pipe(
    switchMap((args: TipSetVisualizationAction) => {
      return observableFrom(this.dataService.getVisualizationTip(args.payload));
    }),
    switchMap((args: any) => {
      return observableOf(new tip.TipSetVisualizationCompleteAction(args));
    })
  );

  @Effect()
  delPathway: Observable<Action> = this.actions$.pipe(ofType(data.DATA_DEL_PATHWAY)).pipe(
    switchMap((args: DataDelPathwayAction) => {
      return observableFrom(
        this.dataService
          .deleteCustomPathway(args.payload.database, args.payload.pathway)
          .then(() => this.dataService.getCustomPathways(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdatePathwayAction(args));
    })
  );

  // Cohort Crud
  @Effect()
  addCohort: Observable<Action> = this.actions$.pipe(ofType(data.DATA_ADD_COHORT)).pipe(
    switchMap((args: DataAddCohortAction) => {
      return observableFrom(
        this.dataService
          .createCustomCohort(args.payload.database, args.payload.cohort)
          .then(() => this.dataService.getCustomCohorts(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdateCohortsAction(args));
    })
  );

  @Effect()
  delCohort: Observable<Action> = this.actions$.pipe(ofType(data.DATA_DEL_COHORT)).pipe(
    switchMap((args: DataDelCohortAction) => {
      return observableFrom(
        this.dataService
          .deleteCustomCohort(args.payload.database, args.payload.cohort)
          .then(() => this.dataService.getCustomCohorts(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdateCohortsAction(args));
    })
  );

  // Geneset Crud
  @Effect()
  addGeneset: Observable<Action> = this.actions$.pipe(ofType(data.DATA_ADD_GENESET)).pipe(
    switchMap((args: DataAddGenesetAction) => {
      return observableFrom(
        this.dataService
          .createCustomGeneset(args.payload.database, args.payload.geneset)
          .then(() => this.dataService.getCustomGenesets(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdateGenesetsAction(args));
    })
  );

  @Effect()
  updateGeneset: Observable<Action> = this.actions$.pipe(ofType(data.DATA_UPDATE_GENESET)).pipe(
    switchMap((args: DataUpdateGenesetAction) => {
      return observableFrom(
        this.dataService
          .updateCustomGeneset(args.payload.database, args.payload.geneset)
          .then(() => this.dataService.getCustomGenesets(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdateGenesetsAction(args));
    })
  );

  @Effect()
  delGeneset: Observable<Action> = this.actions$.pipe(ofType(data.DATA_DEL_GENESET)).pipe(
    switchMap((args: DataDelGenesetAction) => {
      return observableFrom(
        this.dataService
          .deleteCustomGeneset(args.payload.database, args.payload.geneset)
          .then(() => this.dataService.getCustomGenesets(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdateGenesetsAction(args));
    })
  );

  // Geneset Crud
  @Effect()
  addPreprocessing: Observable<Action> = this.actions$.pipe(ofType(data.DATA_ADD_PREPROCESSING)).pipe(
    switchMap((args: DataAddPreprocessingAction) => {
      return observableFrom(
        this.dataService
          .createCustomPreprocessing(args.payload.database, args.payload.preprocessing)
          .then(() => this.dataService.getCustomPreprocessing(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdatePreprocessingAction(args));
    })
  );

  @Effect()
  delPreprocessing: Observable<Action> = this.actions$.pipe(ofType(data.DATA_DEL_PREPROCESSING)).pipe(
    switchMap((args: DataDelPreprocessingAction) => {
      return observableFrom(
        this.dataService
          .deleteCustomPreprocessing(args.payload.database, args.payload.preprocessing)
          .then(() => this.dataService.getCustomPreprocessing(args.payload.database))
      );
    }),
    switchMap((args: any) => {
      return observableOf(new DataUpdatePreprocessingAction(args));
    })
  );

  // Load Data From Public
  @Effect()
  dataLoadFromPublic$: Observable<any> = this.actions$.pipe(ofType(data.DATA_LOAD_FROM_PUBLIC)).pipe(
    map((action: UnsafeAction) => action.payload),
    switchMap(args => {
      let essentialBase = 'https://oncoscape.v3.sttrcancer.org/data/';
      if (args['src'] === 'tcga') {
        args['baseUrl'] =  essentialBase + args['src'] + '/';
        args['manifest'] = essentialBase + args['src'] + '/' + args['prefix'] + 'manifest.json.gz';
      } else {  // assume src= "public"
        args['baseUrl'] =  essentialBase + args['src'] + '/'+ args['uid'] + '/';
        args['manifest'] = essentialBase + args['src'] + '/'+ args['uid'] + '/manifest.json.gz';
        args['token'] = '';
      }
      console.log('dataLoadFromPublic args...');
      console.dir(args);
      return this.datasetService.load(args, false, null);
    }),
    mergeMap(args => {
      return [
        // new FilePanelToggleAction(),
        new DataLoadFromDexieAction(args.uid, args.name)
      ];
    })
  );

  getMyUserId() {
    let email = window['storedAuthBits'].email; 
    return email;
  }

  /*
  oncoscape-privatedata-${env}/converted/
  bucket is `${user}/${itemId}`
  */
  // Load Data From Private S3
  @Effect()
  dataLoadFromPrivate$: Observable<any> = this.actions$.pipe(ofType(data.DATA_LOAD_FROM_PRIVATE)).pipe(
    map((action: UnsafeAction) => action.payload),
    switchMap(args => {
      let env = args['env'];
      console.log(`MJ CHECK! env is ${env }`);
      console.log(`MJ dataLoadFromPrivate, args = ${JSON.stringify(args
        ) }`);
      let user =   args['bucket'].split('/')[0]; // actual owner of item
      args["owner"]=user;
      let userEncoded = encodeURIComponent(user);
      let itemId = args['bucket'].split('/')[1];
      args['token'] = self['zagerToken']; // MJ window
      args['uid'] =itemId; 
      // args['baseUrl'] = 'https://oncoscape.v3.sttrcancer.org/datasets/' + args['bucket'] + '/';
      // args['manifest'] = 'https://oncoscape.v3.sttrcancer.org/datasets/' + args['bucket'] + '/manifest.json.gz';
      let me = null; // Don't need to say who I am if I own the dataset, only if I am a grantee.
      if (user != this.getMyUserId()){
        // Owned by someone else. Treat ourself as a grantee.
        me = this.getMyUserId()
        args['grantee']=me;
      }

      args['baseUrl'] = `https://oncoscape-privatedata-${env}.s3-us-west-2.amazonaws.com/converted/${userEncoded}/${itemId}/final/`;
      args['manifest'] = `https://oncoscape-privatedata-${env}.s3-us-west-2.amazonaws.com/converted/${userEncoded}/${itemId}/final/manifest.json.gz`;
      // console.log('MJ before call load');
      return this.datasetService.load(args, true, me);
    }),
    mergeMap(args => {
      // console.log('MJ before guts of mergeMap');
      return [
        // new FilePanelToggleAction(),
        new DataLoadFromDexieAction(args.uid, args.name)
      ];
    })
  );

  // Load Data From Dexie
  @Effect()
  dataLoadFromDexie$: Observable<DataLoadedAction> = this.actions$.pipe(ofType(data.DATA_LOAD_FROM_DEXIE)).pipe(
    switchMap((args: DataLoadFromDexieAction) => {
      console.log(`data.effect.dataLoadFromDexie$, #1 args.dataset = [${args.dataset}]`);
      console.log('ALL argsfrom this.dataLoadFromDexie$ ... ');
      console.dir(args);

      GraphConfig.database = args.dataset;
      GraphConfig.datasetName = args.datasetname;
      if ((args.datasetname == null) && args.dataset.includes('.zip_20') ) {
        GraphConfig.datasetName = args.dataset.split('.zip_20')[0];
      }
      return observableFrom(
        Promise.all([
          this.datasetService.getDataset(args.dataset), //0
          this.dataService.getCustomGenesets(args.dataset), //1
          this.dataService.getCustomCohorts(args.dataset), //2
          this.dataService.getCustomPathways(args.dataset), //3
          this.dataService.getCustomPreprocessing(args.dataset), //4
          this.dataService.getRowCount(args.dataset, 'mut'), //5
          this.dataService.getMiscMeta(args.dataset, 'mutationTypes'), //6
          new Promise((resolve, reject) => {
            resolve(args.datasetname); //7
          }),
          this.dataService.getCustomVisSettings(args.dataset) //8
        ])
      );
    }), 
    // switchMap(args => {
    //   console.log('** if process updates, do it here in pipe of data effect.');
    //   return observableOf(args);
    // }),

    switchMap(args => {
      console.log(`data.effect.dataLoadFromDexie$, #2 args are...`);
      console.dir(args);
      if (args[1] === undefined) {
        args[1] = [];
      }
      if (args[2] === undefined) {
        args[2] = [];
      }

      console.log('dataLoadFromDexie, check fields.');
      // Temp Fix While Converting To New Data Model
      const fields = args[0].hasOwnProperty('fields') ? args[0].fields : args[0].patients.concat(args[0].samples);

      console.log(`MJ - Please note population of DatasetDescription`);
      console.log(`MJ - At populating DSD, args[0] (Study details?) is...`);
      console.dir(args[0]);
      const dsd = new DatasetDescription();
      dsd.hasPrecomputed = false; // Default, but make it clear.
      dsd.hasEvents = args[0].events.length > 0;
      console.log(`MJ - dsd events length =  ${args[0].events.length}.`);
      dsd.hasPatientFields = args[0].fields.filter(v => v.tbl === 'patient').length > 0;
      dsd.hasSampleFields = args[0].fields.filter(v => v.tbl === 'sample').length > 0;
      dsd.hasMatrixFields = args[0].tables.filter(v => v.ctype & CollectionTypeEnum.MOLECULAR_FOR_SCATTER).length > 0;
      dsd.hasHeatmappableFields = args[0].tables.filter(v => v.ctype & CollectionTypeEnum.HEATMAPPABLE).length > 0;
      dsd.hasMutations = args[5] > 1;
      dsd.hasCopyNumber = args[0].tables.filter(v => (v.ctype & CollectionTypeEnum.GISTIC) 
      || (v.ctype & CollectionTypeEnum.GISTIC_THRESHOLD)
      || (v.ctype & CollectionTypeEnum.CNV)
      || (v.tbl.toLowerCase().endsWith('nn_data_cna')) // Hardcoded hack for NN glioma. -MJ TBD
        ).length > 0;

      if (args[6]) { // we are setting a mutationVariantNames overrride.
        dsd.mutationVariantNames = Object.keys(args[6]['data']).map(key => args[6]['data'][key]);
        DataFieldFactory.setMutationFields(dsd.mutationVariantNames);
      }

      let hasTcgaSurvival:boolean =
        args[0].fields.filter(v => {
          return v.key === 'days_to_death' || v.key === 'vital_status' || v.key === 'days_to_last_follow_up';
        }).length === 3;

      // try "_followup" [sic]
      if(hasTcgaSurvival==false) {
        hasTcgaSurvival =
        args[0].fields.filter(v => {
          return v.key === 'days_to_death' || v.key === 'vital_status' || v.key === 'days_to_last_followup';
        }).length === 3;
      }
      let hasCbioportalSurvival:boolean =
        args[0].fields.filter(v => {
          return v.key === 'os_months' || v.key === 'os_status';
        }).length === 2;
      dsd.hasSurvival = hasTcgaSurvival || hasCbioportalSurvival;

      if (args[6] === undefined) {
        args[6] = '';
      }
      return observableOf(
        new DataLoadedAction(
          args[0].name,
          args[0].tables,
          fields,
          args[0].events,
          args[1],
          args[2],
          args[3],
          args[4],
          args[6].toString(),
          dsd,
          args[8],
          args[0] // DatasetTableInfo
        )
      );
    })
  );


  setupConfigsFromArgs(args: DataLoadedAction) {
    let workspaceConfig = new WorkspaceConfigModel();
    workspaceConfig.layout = WorkspaceLayoutEnum.SINGLE;
    const edgeConfig = new EdgeConfigModel();

    // console.log('MJ edge is ' + JSON.stringify(EntityTypeEnum.EDGE));
    const survivalConfig = new SurvivalConfigModel();
    survivalConfig.graph = GraphEnum.GRAPH_A;
    survivalConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.PATIENT) > 0))[0]; // was MOLECULAR, but that was probably copy and paste error. MJ

    // const pathwaysConfig = new PathwaysConfigModel();
    // pathwaysConfig.graph = GraphEnum.GRAPH_A;
    // pathwaysConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    // const chromosomeConfig = new ChromosomeConfigModel();
    // chromosomeConfig.graph = GraphEnum.GRAPH_A;
    // chromosomeConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    // const boxWhiskersConfig = new BoxWhiskersConfigModel();
    // boxWhiskersConfig.graph = GraphEnum.GRAPH_B;
    // boxWhiskersConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[0];

    // const timelinesConfigA = new TimelinesConfigModel();
    // timelinesConfigA.graph = GraphEnum.GRAPH_A;
    // timelinesConfigA.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[0];

    const timelinesConfig = new TimelinesConfigModel();
    timelinesConfig.graph = GraphEnum.GRAPH_A;
    timelinesConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.EVENT) > 0)[0]; // was MOLECULAR, but that was probably copy and paste error. MJ

    // const graphBConfig = new PcaIncrementalConfigModel();
    // graphBConfig.graph = GraphEnum.GRAPH_A;
    // graphBConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    // const hicConfig = new HicConfigModel();
    // hicConfig.graph = GraphEnum.GRAPH_B;
    // hicConfig.table = args.tables.filter( v => ( (v.ctype & CollectionTypeEnum.MOLECULAR) > 0) )[1];

    // const graphAConfig = new LinkedGeneConfigModel();
    // graphAConfig.graph = GraphEnum.GRAPH_A;
    // graphAConfig.table = args.tables.filter( v => ( (v.ctype & CollectionTypeEnum.MOLECULAR) > 0) )[1];

    // const pcaIncConfig2 = new PcaIncrementalConfigModel();
    // pcaIncConfig2.graph = GraphEnum.GRAPH_B;
    // pcaIncConfig2.table = args.tables.filter(
    //   v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0
    // )[1];

    // const pcaIncConfig = new PcaIncrementalConfigModel();
    // pcaIncConfig.graph = GraphEnum.GRAPH_A;
    // pcaIncConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[0];

    // const graphBConfig = new PcaIncrementalConfigModel();
    // graphBConfig.graph = GraphEnum.GRAPH_A;
    // graphBConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    const pcaConfig = new PcaConfigModel();
    pcaConfig.graph = GraphEnum.GRAPH_A;
    pcaConfig.datasetName = args.datasetName;
    pcaConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[0];

    const savedPointsConfig = new SavedPointsConfigModel();
    savedPointsConfig.graph = GraphEnum.GRAPH_A;
    savedPointsConfig.datasetName = args.datasetName;
    // MJ table is null

    const genomeConfigB = new GenomeConfigModel();
    genomeConfigB.graph = GraphEnum.GRAPH_B;
    genomeConfigB.datasetName = args.datasetName;
    genomeConfigB.entity = EntityTypeEnum.GENE;
    genomeConfigB.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[0];


    // scatterConfig.datasetName = args.datasetName;
    // const histogramConfig = new HistogramConfigModel();
    // histogramConfig.graph = GraphEnum.GRAPH_A;
    // histogramConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    // const heatmapConfig = new HeatmapConfigModel();
    // heatmapConfig.graph = GraphEnum.GRAPH_B;
    // heatmapConfig.table = args.tables.filter(v => ((v.ctype & CollectionTypeEnum.MOLECULAR) > 0))[1];

    // const pathwaysConfig = new PathwaysConfigModel();
    // pathwaysConfig.graph = GraphEnum.GRAPH_A;
    // pathwaysConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[1];

    // const chromoConfig = new ChromosomeConfigModel();
    // chromoConfig.graph = GraphEnum.GRAPH_A;
    // chromoConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[1];

    // const proteinConfig = new ProteinConfigModel();
    // proteinConfig.graph = GraphEnum.GRAPH_A;
    // proteinConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[1];


    // This is the default visualization we show.
    // Try PCA, Survival, Timeline, then SavedPoints.
    let visActionA:Action = new LoaderHideAction(); // compute.NullDataAction();
    if (args.dataset == 'tcga_brain') {
      const mdsConfig = new MdsConfigModel();
      mdsConfig.graph = GraphEnum.GRAPH_A;
      mdsConfig.datasetName = args.datasetName;
      mdsConfig.table = args.tables.filter(v => (v.ctype & CollectionTypeEnum.MOLECULAR) > 0)[0];
      visActionA = new compute.MdsAction({ config: mdsConfig });

    } else {
      let defaultConfig:GraphConfig = null;
      let visType:VisualizationEnum;
      if (args.datasetDesc.hasMatrixFields) {
        visType = VisualizationEnum.PCA;
        defaultConfig = pcaConfig;
        // visActionA = new compute.PcaAction({ config: pcaConfig })
      } else {
        if (args.datasetDesc.hasSurvival) {
          visType = VisualizationEnum.SURVIVAL;
          defaultConfig = survivalConfig;
          //visActionA = new compute.SurvivalAction({ config: survivalConfig });
        } else {
          if (args.datasetDesc.hasEvents) {
            visType = VisualizationEnum.TIMELINES;
            defaultConfig = timelinesConfig;
            //visActionA = new compute.TimelinesAction({ config: timelinesConfig });
          } else {
            const savedPointsConfig = new SavedPointsConfigModel();
            savedPointsConfig.graph = GraphEnum.GRAPH_A;
            savedPointsConfig.datasetName = args.datasetName;

            visType = VisualizationEnum.SAVED_POINTS;
            defaultConfig = savedPointsConfig;
            //visActionA = new compute.SavedPointsAction({ config: savedPointsConfig })

            alert('Defaulting to Saved Points visualization, as nothing else matched.');
            // // What other option is generic? Pass along the NullDataAction
            // document.querySelector('.loader')['style']['visibility'] = 'hidden';
            // alert('No visualization was found to match this data. Please contact Oncoscape support for help with checking your data.');
          }
        }
      }



      // if defaultViz in table, defaultConfig = it

      if(args.datasetTableInfo && args.datasetTableInfo.defaultVizConfig){
        console.log("-- start defaultVizConfig ---");
        defaultConfig = args.datasetTableInfo.defaultVizConfig;
        visType = args.datasetTableInfo.defaultVizConfig.visualization;
        console.log("-- end defaultVizConfig ---");
      }

      // tranform defaultConfig to use visSettings
      let graphConfigValue = defaultConfig;

      let v:any = OncoData.instance.visSettings.find(v=> v.visEnum == graphConfigValue.visualization);
      if(graphConfigValue.hasAppliedMetafileOverrides == false) {
        if(v) {
          let settings = JSON.parse(v.settings);
          if (settings) {
            console.log(`TEMPNOTE: Found settings for visEnum=${graphConfigValue.visualization}...`);
            console.log(`TEMPNOTE: settings = ${v.settings}!`);
            let overrideKeys = Object.keys(settings);
            overrideKeys.map(ok => {
              console.log(`TEMPNOTE: override "${ok}" with "${JSON.stringify(settings[ok])}"!`);
              graphConfigValue[ok] = settings[ok];
            });
            // console.log('MJ settings overridden.');
            graphConfigValue.hasAppliedMetafileOverrides = true;
            console.log(`TEMPNOTE: New config = ${JSON.stringify(graphConfigValue)}!`);
          }
        }
        // console.log('MJ Now continue on with dispatching the vis.');
      }

      switch (visType) {
        case VisualizationEnum.PCA:
        visActionA = new compute.PcaAction({ config: defaultConfig as PcaConfigModel })
        break;

        case VisualizationEnum.SURVIVAL:
        visActionA = new compute.SurvivalAction({ config: defaultConfig as SurvivalConfigModel })
        break;

        case VisualizationEnum.TIMELINES:
        visActionA = new compute.TimelinesAction({ config: defaultConfig as TimelinesConfigModel })
        break;

        case VisualizationEnum.SAVED_POINTS:
        visActionA = new compute.SavedPointsAction({ config: defaultConfig as SavedPointsConfigModel })
        break;


        default:
      }

    }

    return [
      new DataUpdateCohortsAction(args.cohorts),
      new DataUpdateGenesetsAction(args.genesets),
      new DataUpdatePreprocessingAction(args.preprocessings),
      new WorkspaceConfigAction(workspaceConfig),
      // new GraphPanelToggleAction( GraphPanelEnum.GRAPH_A )
      visActionA,
      new compute.GenomeAction({config: genomeConfigB}),
      new LoaderShowAction()
    ];

  }

  @Effect()
  dataLoaded$: Observable<Action> = this.actions$.pipe(ofType(data.DATA_LOADED)).pipe(
    mergeMap((args: DataLoadedAction) => {

      // Count mutations if we haven't already.
      let mutationTable:DataTable = args.tables.find(t => t.ctype ==  CollectionTypeEnum.MUTATION);
      // console.log('MJ past get mutationTable.');
      if(mutationTable && 
        args.fields.find(f => f.key == "oncoscape_mutation_count") == null) {
          // console.log('MJ =====> need to create field for mutationcount');
          // 1. Create our own field, in patientMeta.
          // 2. Add column in patient table.
          // 3. Populate column in patient table.
          // 4. Update fields in "args" here.
          // All TBD.  TODO

        return this.setupConfigsFromArgs(args);
      } else {
        return this.setupConfigsFromArgs(args);
      }
    })
  );

  constructor(private actions$: Actions, private dataService: DataService, private datasetService: DatasetService) {}
}
