import { KmedianConfigModel } from './../kmedians/kmedians.model';
import { Legend } from 'app/model/legend.model';
import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import * as _ from 'lodash';
declare var ML: any;

// Internal Caches
const _config: KmedianConfigModel = null;
const _molecularData: any = null;
const _pca: any = null;
const _pointColor: Array<number> = [];
const _pointSize: Array<number> = [];
const _pointShape: Array<number> = [];

export const kmedianCompute = (
  config: KmedianConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  // if(config.reuseLastComputation) {
  //   worker.postMessage({config: config, data: {cmd:'reuse'}});
  //   return;
  // }
  

  //     worker.util.loadData(config.dataKey).then((data) => {
  //         const legendItems: Array<Legend> = [];
  //         const molecularData = data.molecularData[0];
  //         let matrix = molecularData.data;
  //         if (config.markerFilter.length > 0) {
  //             const genesOfInterest = molecularData.markers
  //                 .map( (v, i) => (config.markerFilter.indexOf(v) >= 0) ? {gene: v, i: i} : -1 )
  //                 .filter( v => v !== -1 );
  //             matrix = genesOfInterest.map( v => molecularData.data[ v.i ] );
  //         }
  //         worker.postMessage('TERMINATE');
  // });
};
