import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';

import { TableLoaderConfigModel } from './tableLoader';

export const TableLoaderCompute = (
  config: TableLoaderConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  // if(config.reuseLastComputation) {
  //   worker.postMessage({config: config, data: {cmd:'reuse'}});
  //   return;
  // }
  worker.util.getPlainTable(config.database, config.tableName).then(data => {
  //worker.util.getDataMatrix(config).then(matrix => {
    let result = {
      matrix: data,
      testVersion:125
    }
 
    worker.postMessage({
      config: config,
      data: result
    });
    worker.postMessage('TERMINATE');
  });

};





