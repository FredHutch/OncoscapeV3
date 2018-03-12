import { EntityTypeEnum, DirtyEnum } from './../../../model/enum.model';
import { Legend } from 'app/model/legend.model';
import { PcaConfigModel, PcaDataModel } from './pca.model';
import { DedicatedWorkerGlobalScope } from 'compute';
import * as _ from 'lodash';
import { DataDecoratorTypeEnum } from '../../../model/data-map.model';
declare var ML: any;


export const pcaCompute = (config: PcaConfigModel, worker: DedicatedWorkerGlobalScope): void => {

    worker.util.getDataMatrix(config).then(matrix => {

        worker.util
            .fetchResult({
                method: 'cluster_sk_pca',
                data: matrix.data,
                n_components: config.n_components,
                dimension: config.dimension,
                random_state: config.random_state,
                tol: config.tol,
                svd_solver: config.svd_solver,
                whiten: config.whiten,
                copy: config.copy,
                iterated_power: config.iterated_power
            }).then(result => {
                result.resultScaled = worker.util.scale3d(result.result, config.pcx - 1, config.pcy - 1, config.pcz - 1);
                result.sid = matrix.sid;
                result.mid = matrix.mid;
                result.pid = matrix.pid
                worker.postMessage({
                    config: config,
                    data: result
                });
                worker.postMessage('TERMINATE');
            });
    })


    //     Promise.all([
    //         worker.util.getMatrix(config.markerFilter, config.sampleFilter, config.table.map, config.database,config.table.tbl, config.entity),
    //         worker.util.getColorMap(config.entity, config.markerFilter, config.sampleFilter, config.database, config.pointColor),
    //         worker.util.getSizeMap(config.entity, config.markerFilter, config.sampleFilter, config.database, config.pointSize),
    //         worker.util.getShapeMap(config.entity, config.markerFilter, config.sampleFilter, config.database, config.pointShape)
    //     ]).then(results => { 
    // debugger;
    //     })




    // worker.util.processShapeColorSizeIntersect(config, worker);

    // if (config.dirtyFlag & DirtyEnum.LAYOUT) {

    //     worker.util
    //         .getMatrix(config.markerFilter, config.sampleFilter, config.table.map, config.database,config.table.tbl, config.entity)
    //         .then(mtx => {
    //             Promise.all([
    //                 worker.util.getSamplePatientMap(config.database),
    //                 worker.util
    //                     .fetchResult({
    //                         // added more than server is calling
    //                         method: 'cluster_sk_pca',
    //                         data: mtx.data,
    //                         n_components: config.n_components,
    //                         dimension: config.dimension,
    //                         random_state: config.random_state,
    //                         tol: config.tol,
    //                         svd_solver: config.svd_solver,
    //                         whiten: config.whiten,
    //                         copy: config.copy,
    //                         iterated_power: config.iterated_power
    //                     })
    //             ]).then(result => {
    //                 const psMap = result[0].reduce((p, c) => { p[c.s] = c.p; return p; }, {});
    //                 const data = result[1];
    // const resultScaled = worker.util.scale3d(data.result, config.pcx-1, config.pcy-1, config.pcz-1);
    //                 worker.postMessage({
    //                     config: config,
    //                     data: {
    //                         legendItems: [],
    //                         result: data,
    //                         resultScaled: resultScaled,
    //                         patientIds: mtx.samples.map(v => psMap[v]),
    //                         sampleIds: mtx.samples,
    //                         markerIds: mtx.markers
    //                     }
    //                 });
    //                 worker.postMessage('TERMINATE');
    //             });
    //         });
    // }
};
