import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import {
  EntityTypeEnum,
  SpriteMaterialEnum
} from './../../../model/enum.model';
import { Legend } from './../../../model/legend.model';
import { UmapConfigModel } from './umap.model';

export const umapCompute = (
  config: UmapConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }

  worker.util.getDataMatrix(config).then(matrix => {
    worker.util
      .fetchResult({
        method: 'cluster_umap',
        data: matrix.data,
        n_neighbors: config.n_neighbors,
        min_dist: config.min_dist,
        metric: config.metric,
        n_components: config.n_components,
        spread: config.spread,
        set_op_mix_ratio: config.set_op_mix_ratio,
        target_weight: config.target_weight,
        target_n_neighbors: config.target_n_neighbors,
        angular_rp_forest: config.angular_rp_forest,
        transform_queue_size: config.transform_queue_size,
        repulsion_strength: config.repulsion_strength,
        local_connectivity: config.local_connectivity,
        negative_sample_rate: config.negative_sample_rate,
        learning_rate: config.learning_rate
      })
      .then(result => {
        if (result && result['message'] && result['stack']) { // duck typecheck for error
          return worker.util.postCpuError(result, worker);
        }
        result.resultScaled = worker.util.scale3d(result.result);
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
