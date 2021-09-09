import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum, SpriteMaterialEnum } from '../../../model/enum.model';
import { Legend } from '../../../model/legend.model';
import { SVRConfigModel } from './svr.model';

export const SVRCompute = (
  config: SVRConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  
  worker.util.getDataMatrix(config).then(matrix => {
    const classes = matrix.sid.map(v => {
      return [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      ];
    });
    worker.util
      .fetchResult({
        method: 'cluster_sk_svr',
        n_components: config.n_components,
        c: config.c,
        kernal: config.kernal,
        degree: config. degree,
        coef0: config.coef0,
        shrinking: config.shrinking,
        tol: config.tol,
        verbose: config.verbose,
        max_iter: config.max_iter,
        epsilon: config.epsilon,
        // cache_size : float, // optional
        // gamma = // optional
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
        worker.postMessage({ config: config, data: result });
        worker.postMessage('TERMINATE');
      });
  });
};
