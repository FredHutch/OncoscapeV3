import { Legend } from './../../../model/legend.model';
import { TsneConfigModel } from './tsne.model';
import {
  EntityTypeEnum,
  SpriteMaterialEnum
} from './../../../model/enum.model';
import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';

export const tsneCompute = (
  config: TsneConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  
  worker.util.getDataMatrix(config).then(matrix => {
    worker.util
      .fetchResult({
        method: 'manifold_sk_tsne',
        data: matrix.data,
        n_components: config.n_components,
        dimension: config.dimension,
        perplexity: config.perplexity,
        early_exaggeration: config.early_exaggeration,
        learning_rate: config.learning_rate,
        n_iter: config.n_iter,
        n_iter_without_progress: config.n_iter,
        min_grad_norm: config.min_grad_norm,
        metric: config.metric,
        sk_method: config.sk_method
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
