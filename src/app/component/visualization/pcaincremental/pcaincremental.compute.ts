import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum, SpriteMaterialEnum } from './../../../model/enum.model';
import { Legend } from './../../../model/legend.model';
import { PcaIncrementalConfigModel } from './pcaincremental.model';

export const pcaIncrementalCompute = (config: PcaIncrementalConfigModel, worker: DedicatedWorkerGlobalScope): void => {
    if(config.reuseLastComputation) {
        worker.postMessage({config: config, data: {cmd:'reuse'}});
        return;
      }
      
    
    worker.util.getDataMatrix(config).then(matrix => {
        worker.util
            .fetchResult({
                method: 'cluster_sk_pca_incremental',
                n_components: config.n_components,
                data: matrix.data,
                whiten: config.whiten,
                batch_size: config.batch_size
            }).then(result => {
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
