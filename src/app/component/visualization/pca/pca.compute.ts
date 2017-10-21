import { EntityTypeEnum, DirtyEnum } from './../../../model/enum.model';
import { Legend } from 'app/model/legend.model';
import { PcaConfigModel, PcaDataModel } from './pca.model';
import { DedicatedWorkerGlobalScope } from 'compute';
import * as _ from 'lodash';
declare var ML: any;


export const pcaCompute = (config: PcaConfigModel, worker: DedicatedWorkerGlobalScope): void => {

    worker.util.processShapeColorSizeIntersect(config, worker);

    if (config.dirtyFlag & DirtyEnum.LAYOUT) {
        worker.util
            .getMatrix(config.markerFilter, config.sampleFilter, config.table.map, config.table.tbl, config.entity)
            .then(mtx => {
                Promise.all([
                    worker.util.getSamplePatientMap(),
                    worker.util
                        .fetchResult({
                            // added more than server is calling
                            method: 'cluster_sk_pca',
                            data: mtx.data,
                            n_components: config.n_components,
                            dimension: config.dimension,
                            random_state: config.random_state,
                            tol: config.tol,
                            svd_solver: config.svd_solver,
                            whiten: config.whiten,
                            copy: config.copy,
                            iterated_power: config.iterated_power
                        })
                ]).then(result => {
                    const psMap = result[0].reduce((p, c) => { p[c.s] = c.p; return p; }, {});
                    const data = JSON.parse(result[1].body);
                    const resultScaled = worker.util.scale3d(data.result);
                    worker.postMessage({
                        config: config,
                        data: {
                            legendItems: [],
                            result: data,
                            resultScaled: resultScaled,
                            patientIds: mtx.samples.map(v => psMap[v]),
                            sampleIds: mtx.samples,
                            markerIds: mtx.markers
                        }
                    });
                    worker.postMessage('TERMINATE');
                });
            });
    }
};
