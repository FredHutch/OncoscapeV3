import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { SomConfigModel } from './som.model';

export const somCompute = (config: SomConfigModel, worker: DedicatedWorkerGlobalScope): void => {
    // if(config.reuseLastComputation) {
    //     worker.postMessage({config: config, data: {cmd:'reuse'}});
    //     return;
    //   }
      
    
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
    //         worker.postMessage({
    //             config: config,
    //             data: {
    //                 legendItems: legendItems,
    //             }
    //         });
    //         worker.postMessage('TERMINATE');
    // });
};
