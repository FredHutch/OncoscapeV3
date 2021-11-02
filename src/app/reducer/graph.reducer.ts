import * as graph from 'app/action/graph.action';
import * as e from 'app/model/enum.model';
import { OncoData,LoadedTable } from 'app/oncoData';

// tslint:disable-next-line:max-line-length
import {
  COMPUTE_BOX_WHISKERS_COMPLETE,
  COMPUTE_CHROMOSOME_COMPLETE,
  COMPUTE_DA_COMPLETE,
  COMPUTE_DENDOGRAM_COMPLETE,
  COMPUTE_DE_COMPLETE,
  COMPUTE_DICTIONARY_LEARNING_COMPLETE,
  COMPUTE_FAST_ICA_COMPLETE,
  COMPUTE_FA_COMPLETE,
  COMPUTE_GENOME_COMPLETE,
  COMPUTE_HAZARD_COMPLETE,
  COMPUTE_HEATMAP_COMPLETE,
  COMPUTE_HIC_COMPLETE,
  COMPUTE_ISO_MAP_COMPLETE,
  COMPUTE_LDA_COMPLETE,
  COMPUTE_LINKED_GENE_COMPLETE,
  COMPUTE_LOCAL_LINEAR_EMBEDDING_COMPLETE,
  COMPUTE_MDS_COMPLETE,
  COMPUTE_SAVED_POINTS_COMPLETE,
  COMPUTE_TABLE_LOADER_COMPLETE,
  COMPUTE_NMF_COMPLETE,
  COMPUTE_NONE_COMPLETE,
  COMPUTE_PARALLEL_COORDS_COMPLETE,
  COMPUTE_PATHWAYS_COMPLETE,
  COMPUTE_PROTEIN_COMPLETE,
  COMPUTE_PCA_COMPLETE,
  COMPUTE_PCA_INCREMENTAL_COMPLETE,
  COMPUTE_PCA_KERNAL_COMPLETE,
  COMPUTE_PCA_SPARSE_COMPLETE,
  COMPUTE_PLSR_COMPLETE,
  COMPUTE_SOM_COMPLETE,
  COMPUTE_SPECTRAL_EMBEDDING_COMPLETE,
  COMPUTE_SURVIVAL_COMPLETE,
  COMPUTE_TIMELINES_COMPLETE,
  COMPUTE_TRUNCATED_SVD_COMPLETE,
  COMPUTE_TSNE_COMPLETE,
  COMPUTE_UMAP_COMPLETE,
  COMPUTE_SCATTER_COMPLETE,
  COMPUTE_PLS_REGRESSION_COMPLETE,
  COMPUTE_PLS_CANONICAL_COMPLETE,
  COMPUTE_PLS_SVD_COMPLETE,
  COMPUTE_CCA_COMPLETE,
  COMPUTE_LINEAR_SVC_COMPLETE,
  COMPUTE_LINEAR_DISCRIMINANT_ANALYSIS_COMPLETE,
  COMPUTE_LINEAR_SVR_COMPLETE,
  COMPUTE_NU_SVR_COMPLETE,
  COMPUTE_NU_SVC_COMPLETE,
  COMPUTE_ONE_CLASS_SVM_COMPLETE,
  COMPUTE_SVR_COMPLETE,
  COMPUTE_QUADRATIC_DISCRIMINANT_ANALYSIS_COMPLETE
} from './../action/compute.action';
import { UnsafeAction } from './../action/unsafe.action';
import { DataCollection } from './../model/data-collection.model';
import { DataDecorator, LegendFilter } from './../model/data-map.model';
import { DataSet } from './../model/data-set.model';
import { GraphConfig } from './../model/graph-config.model';
import { SelectionToolConfig } from 'app/model/selection-config.model';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';

// Visibility / DataFields / Depth / Visualization / Config
export interface State {
  dataSet: DataSet;
  dataCollection: DataCollection;
  visualizationType: e.VisualizationEnum;
  selectionToolConfig: SelectionToolConfig;
  config: GraphConfig;
  decorators: Array<DataDecorator>;
  legendFilters: Array<LegendFilter>;
  depth: e.DepthEnum;
  visibility: e.VisibilityEnum;
  data: any;
  threeDOptions: any; // dict of option/value pairs. TBD MJ
}

const initialState: State = {
  dataSet: null,
  dataCollection: null,
  visualizationType: e.VisualizationEnum.NONE,
  selectionToolConfig: SelectionToolConfig.createDefault(),
  depth: null,
  visibility: e.VisibilityEnum.HIDE,
  config: null,
  decorators: [],
  legendFilters: [],
  data: null,
  threeDOptions: {}
};

function theRoughSizeOfObject( dataObject ) {

  if (dataObject == null) {
    return 0;
  }
  if(Array.isArray(dataObject)) {
    if (dataObject.length ==0) {
      return 0;
    } else {
      if(Array.isArray(dataObject[0])) {
        return 8 * dataObject[0].length * dataObject.length;
      }
    }    
  }

  return 0
}

function processAction(action: UnsafeAction, state: State): State {
  let dataToUse = action.payload.data;
  let dataSizeEstimate:number= theRoughSizeOfObject(dataToUse);
  console.log(`processAction [${action.type}], dataSizeEstimate = ${dataSizeEstimate}.`);
  if (dataSizeEstimate > 1000000) {
    console.log(`NOte: Large data size in processAction, at ${dataSizeEstimate}.`);
  }

  switch (action.type) {
    case COMPUTE_NONE_COMPLETE:
    case COMPUTE_PATHWAYS_COMPLETE:
    case COMPUTE_PROTEIN_COMPLETE:
    case COMPUTE_TIMELINES_COMPLETE:
    case COMPUTE_DENDOGRAM_COMPLETE:
    case COMPUTE_HEATMAP_COMPLETE:
    case COMPUTE_BOX_WHISKERS_COMPLETE:
    case COMPUTE_PARALLEL_COORDS_COMPLETE:
    case COMPUTE_LINKED_GENE_COMPLETE:
    case COMPUTE_HIC_COMPLETE:
    case COMPUTE_PCA_COMPLETE:
    case COMPUTE_CHROMOSOME_COMPLETE:
    case COMPUTE_GENOME_COMPLETE:
    case COMPUTE_PLSR_COMPLETE:
    case COMPUTE_SOM_COMPLETE:
    case COMPUTE_MDS_COMPLETE:
    case COMPUTE_SAVED_POINTS_COMPLETE:
    case COMPUTE_TSNE_COMPLETE:
    case COMPUTE_UMAP_COMPLETE:
    case COMPUTE_SCATTER_COMPLETE:
    case COMPUTE_DA_COMPLETE:
    case COMPUTE_DE_COMPLETE:
    case COMPUTE_FA_COMPLETE:
    case COMPUTE_NMF_COMPLETE:
    case COMPUTE_LDA_COMPLETE:
    case COMPUTE_DICTIONARY_LEARNING_COMPLETE:
    case COMPUTE_FAST_ICA_COMPLETE:
    case COMPUTE_TRUNCATED_SVD_COMPLETE:
    case COMPUTE_LOCAL_LINEAR_EMBEDDING_COMPLETE:
    case COMPUTE_ISO_MAP_COMPLETE:
    case COMPUTE_SPECTRAL_EMBEDDING_COMPLETE:
    case COMPUTE_PCA_SPARSE_COMPLETE:
    case COMPUTE_PCA_INCREMENTAL_COMPLETE:
    case COMPUTE_PCA_KERNAL_COMPLETE:
    case COMPUTE_HAZARD_COMPLETE:
    case COMPUTE_PLS_CANONICAL_COMPLETE:
    case COMPUTE_PLS_REGRESSION_COMPLETE:
    case COMPUTE_PLS_SVD_COMPLETE:
    case COMPUTE_CCA_COMPLETE:
    case COMPUTE_LINEAR_SVC_COMPLETE:
    case COMPUTE_LINEAR_DISCRIMINANT_ANALYSIS_COMPLETE:
    case COMPUTE_SURVIVAL_COMPLETE:
    case COMPUTE_PLS_SVD_COMPLETE:
    case COMPUTE_PLS_REGRESSION_COMPLETE:
    case COMPUTE_PLS_CANONICAL_COMPLETE:
    case COMPUTE_CCA_COMPLETE:
    case COMPUTE_LINEAR_SVC_COMPLETE:
    case COMPUTE_LINEAR_SVR_COMPLETE:
    case COMPUTE_NU_SVR_COMPLETE:
    case COMPUTE_NU_SVC_COMPLETE:
    case COMPUTE_ONE_CLASS_SVM_COMPLETE:
    case COMPUTE_SVR_COMPLETE:
    case COMPUTE_QUADRATIC_DISCRIMINANT_ANALYSIS_COMPLETE:
      let savedDecorators = OncoData.instance.dataLoadedAction.datasetTableInfo.decorators;
      if (savedDecorators && savedDecorators.length >0){
          savedDecorators.map(dec => {
            let decAndConfig = {
              config: action.payload.config,
              decorator: dec
            }
            console.log('sending out decorator');
            setTimeout(function(){ 
              WorkspaceComponent.instance.graphPanelAddDecorator(
                decAndConfig
              );
            }, 10);
          })
      }
      return Object.assign({}, state, {
        data: action.payload.data,
        config: action.payload.config
      });    
    case COMPUTE_TABLE_LOADER_COMPLETE: {
      console.warn(`Tableloaded, completion event seen in graph reducer.`);
    }
    // case COMPUTE_DECORATOR_UPDATE:
    //     return Object.assign({}, state, { decorators: (action as compute.DecoratorUpdateAction).payload.decorators });
    case graph.SELECTION_TOOL_CHANGE:
      return Object.assign({}, state, {
        selectionToolConfig: action.payload.selectionTool
      });
    case graph.VISIBILITY_TOGGLE:
      return Object.assign({}, state, { visibility: action.payload.data });
    case graph.DEPTH_TOGGLE:
      return Object.assign({}, state, { depth: action.payload.data });
    case graph.VISUALIZATION_TYPE_SET:
      return Object.assign({}, state, { visualization: action.payload.data });
    case graph.VISUALIZATION_COMPLETE:
      return Object.assign({}, state, { chartObject: action.payload.data });

      // --- DataDecorators ---
    case graph.DATA_DECORATOR_ADD:
      console.log('==GraphReducer adding decorator. ');
      console.dir(action.payload.decorator);

      const decorator = action.payload.decorator;
      const decorators = state.decorators.filter(v => v.type !== decorator.type);
      decorators.push(decorator);
      return Object.assign({}, state, { decorators: decorators });
    case graph.DATA_DECORATOR_DEL:
      return Object.assign({}, state, {
        decorators: state.decorators.filter(v => v.type !== action.payload.decorator.type)
      });
    case graph.DATA_DECORATOR_DEL_ALL:
      return Object.assign({}, state, { decorators: [] });

      // --- LegendFilters ---
      case graph.LEGEND_FILTER_ADD:
      console.log('==GraphReducer adding legendFilter. ');
      console.dir(action.payload.legendFilter);
      const legendFilter = action.payload.legendFilter as LegendFilter;
      const legendFilters = state.legendFilters; // *** MJ: Can currently have multi filters on one aspect, so hide this:  .filter(v => v.legend.type !== decorator.type);
      legendFilters.push(legendFilter);
      return Object.assign({}, state, { legendFilters: legendFilters });
    case graph.LEGEND_FILTER_DEL:
      return Object.assign({}, state, {
        // We always will delete in reverse order of creation.
        // So, hide this: legendFilters: state.legendFilters.filter(v => v.legend.type !== action.payload.legend.type)
        // Return all but last one.
        legendFilters: state.legendFilters.slice(0, -1)
      });
    case graph.LEGEND_FILTER_DEL_ALL:
      return Object.assign({}, state, { legendFilters: [] });
        
    case graph.THREED_RENDER_OPTION:
      const currentThreeDOptions = state.threeDOptions;
      currentThreeDOptions[action.payload.option] = action.payload.value;
      ChartScene.instance.applyThreeDOption(state.config, action.payload.option, action.payload.value);
      return Object.assign({}, state, { threeDOptions: currentThreeDOptions });

    default:
      return state;
  }
}


export function graphReducerA(state = initialState, action: UnsafeAction): State {
  let stateToReturn:any = state;
  if (action.payload === undefined) {
    return stateToReturn;
  }
  if (action.payload.config === undefined) {
    return stateToReturn;
  }
  if (action.payload.config.graph !== e.GraphEnum.GRAPH_A) {
    return stateToReturn;
  }
  return processAction(action, stateToReturn);
}

export function graphReducerB(state = initialState, action: UnsafeAction): State {
  if (action.payload === undefined) {
    return state;
  }
  if (action.payload.config === undefined) {
    return state;
  }
  if (action.payload.config.graph !== e.GraphEnum.GRAPH_B) {
    return state;
  }
  return processAction(action, state);
}
