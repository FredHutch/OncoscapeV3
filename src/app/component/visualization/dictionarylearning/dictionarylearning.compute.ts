import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum, SpriteMaterialEnum } from './../../../model/enum.model';
import { Legend } from './../../../model/legend.model';
import { DictionaryLearningConfigModel } from './dictionarylearning.model';

export const dictionaryLearningCompute = (
  config: DictionaryLearningConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  
  worker.util.getDataMatrix(config).then(matrix => {
    worker.util
      .fetchResult({
        method: 'cluster_sk_dictionary_learning',
        data: matrix.data,
        n_components: config.n_components,
        dimension: config.dimension,
        alpha: config.alpha,
        max_iter: config.max_iter,
        tol: config.tol,
        fit_algorithm: config.fit_algorithm,
        transform_algorithm: config.transform_algorithm,
        split_sign: config.split_sign
      })
      .then(result => {
        if (result && result['message'] && result['stack']) { // duck typecheck for error
          return worker.util.postCpuError(result, worker);
        }
        result.resultScaled = worker.util.scale3d(
          result.result,
          config.pcx - 1,
          config.pcy - 1,
          config.pcz - 1
        );
        result.sid = matrix.sid;
        result.mid = matrix.mid;
        result.pid = matrix.pid;
        result.legends = [
          Legend.create( result,
            'Data Points',
            config.entity === EntityTypeEnum.GENE ? ['Genes'] : ['Samples'],
            [SpriteMaterialEnum.CIRCLE],
            'SHAPE',
            'DISCRETE'
          )
        ];
        worker.postMessage({
          config: config,
          data: result
        });
        worker.postMessage('TERMINATE');
      });
  });
};
