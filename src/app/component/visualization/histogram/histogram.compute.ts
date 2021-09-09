import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { HistogramConfigModel } from './histogram.model';

export const histogramCompute = (
  config: HistogramConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  
  worker.postMessage({
    config: config,
    data: {
      test: 'hi'
    }
  });

  worker.postMessage('TERMINATE');
};
