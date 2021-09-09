import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum, SpriteMaterialEnum } from './../../../model/enum.model';
import { Legend } from './../../../model/legend.model';
import { SpectralEmbeddingConfigModel } from './spectralembedding.model';

export const spectralEmbeddingCompute = (config: SpectralEmbeddingConfigModel, worker: DedicatedWorkerGlobalScope): void => {

    if(config.reuseLastComputation) {
        worker.postMessage({config: config, data: {cmd:'reuse'}});
        return;
      }
      
    worker.util.getDataMatrix(config).then(matrix => {
        worker.util
            .fetchResult({
                // added more than server is calling
                method: 'manifold_sk_spectral_embedding',
                data: matrix.data,
                n_components: config.n_components,
                dimension: config.dimension,
                eigen_solver: config.eigen_solver,
                n_neighbors: config.n_neighbors,
                gamma: config.gamma,
                affinity: config.affinity
            })
            .then(result => {
                if (result && result['message'] && result['stack']) { // duck typecheck for error
                    return worker.util.postCpuError(result, worker);
                }
                result.resultScaled = worker.util.scale3d(result.result, config.pcx - 1, config.pcy - 1, config.pcz - 1);
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
                    )];
                worker.postMessage({
                    config: config,
                    data: result
                });
                worker.postMessage('TERMINATE');
            });
    });
};
