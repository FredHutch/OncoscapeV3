import { DirtyEnum } from 'app/model/enum.model';
import { DictionaryLearningConfigModel } from './dictionarylearning.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { Legend } from 'app/model/legend.model';
import { DedicatedWorkerGlobalScope } from 'compute';
import * as _ from 'lodash';
declare var ML: any;

export const dictionaryLearningCompute = (config: DictionaryLearningConfigModel, worker: DedicatedWorkerGlobalScope): void => {

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
                result.resultScaled = worker.util.scale3d(result.result, config.pcx - 1, config.pcy - 1, config.pcz - 1);
                result.sid = matrix.sid;
                result.mid = matrix.mid;
                result.pid = matrix.pid;
                worker.postMessage({
                    config: config,
                    data: result
                });
                worker.postMessage('TERMINATE');
            });
    });
};
