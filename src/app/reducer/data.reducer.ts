import { Action } from '@ngrx/store';
import * as data from 'app/action/data.action';
import {
  DataLoadedAction,
  DataUpdateCohortsAction,
  DataUpdateGenesetsAction,
  DataUpdatePathwayAction,
  DataUpdatePreprocessingAction
} from './../action/data.action';
import { DataField, DataTable } from './../model/data-field.model';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { OncoData } from 'app/oncoData';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { AbstractVisualization } from 'app/component/visualization/visualization.abstract.component';
import { AbstractScatterVisualization } from 'app/component/visualization/visualization.abstract.scatter.component';
import { Vector3, Camera } from 'three';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';

export interface State {
  // chromosome: DataChromosome;
  dataset: string;
  fields: Array<DataField>;
  tables: Array<DataTable>;
  pathways: Array<any>;
  genesets: Array<any>;
  cohorts: Array<any>;
  preprocessings: Array<any>;
  events: Array<{ type: string; subtype: string }>;
  description: DatasetDescription;
  updatesVersion: number;   // 0.23 means data version 0, tweak 23 since that last data.
}

const initialState: State = {
  // chromosome: null,
  dataset: null,
  fields: [],
  tables: [],
  events: [],
  pathways: [],
  genesets: [],
  cohorts: [],
  preprocessings: [],
  description: null,
  updatesVersion: 0
};

export function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case data.DATA_LOADED:

      WorkspaceComponent.instance.clearLoadedTables();
      const dla: DataLoadedAction = action as DataLoadedAction;
      OncoData.instance.dataLoadedAction = dla; // For handy access. MJ
      OncoData.instance.mutationRecords = null;
      OncoData.instance.variantCountsPerPatient = null;
      OncoData.instance.cnaRecords = null;
      OncoData.instance.variantsEdgeArray = null; // mut and cna records, transformed to be ready for drawEdges.
      console.warn('setting vissettings');
      OncoData.instance.visSettings = dla.visSettings;
      try {
        ChartScene.instance.views.map(v => {
          let sc = (v.chart as AbstractVisualization);
          if(sc){
            let asv = (sc as AbstractScatterVisualization);
            if(asv && asv.selectionController){
              if(asv.selectionController.scatterHistory){
                asv.selectionController.scatterHistory.clear();
              }
            }
          }
        });
      } catch(err) {
        console.error('Clearing history, error.');
      }

      // try {
      //   ChartScene.instance.views.map(v => {
      //     v.controls.target = new Vector3(0,0,0);
      //     v.camera.position.setX(0);
      //     v.camera.position.setY(0);
      //     v.camera.position.setZ(0);
      //   });
      // } catch(err) {
      //   console.error('Clearing history, error.');
      // }

      return Object.assign({}, state, {
        cohorts: dla.cohorts,
        pathways: dla.pathways,
        genesets: dla.genesets,
        preprocessing: dla.preprocessings,
        dataset: dla.dataset,
        fields: dla.fields,
        tables: dla.tables,
        events: dla.events,
        description: dla.datasetDesc
      });
    case data.DATA_UPDATE_COHORTS:
      const duc: DataUpdateCohortsAction = action as DataUpdateCohortsAction;
      return Object.assign({}, state, { cohorts: duc.payload });
    case data.DATA_UPDATE_PATHWAYS:
      const dup: DataUpdatePathwayAction = action as DataUpdatePathwayAction;
      return Object.assign({}, state, { pathways: dup.payload });
    case data.DATA_UPDATE_GENESETS:
      const dug: DataUpdateGenesetsAction = action as DataUpdateGenesetsAction;
      return Object.assign({}, state, { genesets: dug.payload });
    case data.DATA_UPDATE_PREPROCESSING:
      const duz: DataUpdatePreprocessingAction = action as DataUpdatePreprocessingAction;
      return Object.assign({}, state, { preprocessings: duz.payload });
    default:
      return state;
  }
}

export const getDatasetDescription = (state: State) => state.description;
export const getPathways = (state: State) => state.pathways;
export const getGenesets = (state: State) => state.genesets;
export const getCohorts = (state: State) => state.cohorts;
export const getPreprocessing = (state: State) => state.preprocessings;
export const getDataset = (state: State) => state.dataset;
export const getFields = (state: State) => state.fields;
export const getTables = (state: State) => state.tables;
export const getEvents = (state: State) => state.events;
export const getUpdatesVersion = (state: State) => state.updatesVersion;
