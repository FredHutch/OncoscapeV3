import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { EntityTypeEnum, SpriteMaterialEnum } from './../../../model/enum.model';
import { Legend } from './../../../model/legend.model';
import { LinearDiscriminantAnalysisConfigModel } from './lineardiscriminantanalysis.model';

// tslint:disable-next-line:max-line-length
export const linearDiscriminantAnalysisCompute = (
  config: LinearDiscriminantAnalysisConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  

  const classifier = new Set(config.sampleFilter);
  config.sampleFilter = [];
  worker.util.getDataMatrix(config).then(matrix => {
    const classes = matrix.sid.map(v => {
      return classifier.has(v) ? 0 : 1;
    });

    worker.util
      .fetchResult({
        method: 'manifold_sk_lineardiscriminantanalysis',
        data: matrix.data,
        n_components: config.n_components,
        dimension: config.dimension,
        solver: config.solver,
        shrinkage: config.shrinkage,
        // priors =
        store_covariance: config.store_covariance,
        tol: config.tol,
        classes: classes
      })
      .then(result => {
        if (result && result['message'] && result['stack']) { // duck typecheck for error
          return worker.util.postCpuError(result, worker);
        }
        // See if we have an error, instead of an array of results.
        if(result.result == null && result.length == 1 && (typeof result[0] == 'string')) {
          console.log(`TEMPNOTE: LDA compute error... ${result[0]}.`);
          //throw new Error(result[0]);
          return worker.util.postCpuErrorManual(result[0], worker, 'manifold_sk_lineardiscriminantanalysis');
        } else {
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
            )
          ];
          worker.postMessage({ config: config, data: result });
          worker.postMessage('TERMINATE');
        }
      })
      .catch(err => {
        console.log(`TEMPNOTE: CAUGHT LDA compute error... ${err}.`);
        worker.postMessage({
          config: config,
          error: err
        });
        worker.postMessage('TERMINATE');
      });

  });
};
