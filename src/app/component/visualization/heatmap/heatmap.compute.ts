import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { interpolateViridis, interpolateRdBu } from 'd3';
import * as d3Scale from 'd3-scale';
import { HeatmapConfigModel } from './heatmap.model';
import { Legend } from './../../../model/legend.model';

export const heatmapCompute = (
  config: HeatmapConfigModel,
  worker: DedicatedWorkerGlobalScope
): void => {
  if(config.reuseLastComputation) {
    worker.postMessage({config: config, data: {cmd:'reuse'}});
    return;
  }
  
  worker.util.getDataMatrix(config).then(matrix => {
    Promise.all([
      worker.util.fetchResult({
        data: matrix.data,
        transpose: 0,
        method: 'cluster_sp_agglomerative',
        n_clusters: -1,
        sp_metric: config.dist,
        sp_method: config.method,
        sp_ordering: config.order ? -1 : 1
      }).then(result => {
        if (result && result['message'] && result['stack']) { // duck typecheck for error
          return worker.util.postCpuError(result, worker);
        }
        return result;
      }),
      worker.util.fetchResult({
        data: matrix.data,
        transpose: 1,
        method: 'cluster_sp_agglomerative',
        n_clusters: -1,
        sp_metric: config.dist,
        sp_method: config.method,
        sp_ordering: config.order ? -1 : 1
      }).then(result => {
        if (result && result['message'] && result['stack']) { // duck typecheck for error
          return worker.util.postCpuError(result, worker);
        }
        return result;
      })
    ]).then(result => {
      //  See if first array in results is error string.
      if(result && result[0].length === 1 && (typeof result[0][0] == 'string')) {
        console.log(`TEMPNOTE: Heatmap compute error in first array... ${result[0][0]}.`);
        return worker.util.postCpuErrorManual(result[0], worker, 'cluster_sp_agglomerative');
      }
      //  See if second array in results is error string.
      if(result && result[1].length === 1 && (typeof result[1][0] == 'string')) {
        let errStr:string = result[1][0];
        if (errStr === 'The number of observations cannot be determined on an empty distance matrix.') {
          errStr = errStr + ' There were probably no matches between the gene set and your data. Try another gene set.';
        }
        console.log(`TEMPNOTE: Heatmap compute error in second array... ${errStr}`);
        return worker.util.postCpuErrorManual(errStr, worker, 'cluster_sp_agglomerative');
      }
      let minMax = matrix.data.reduce(
        (p, c) => {
          p[0] = Math.min(p[0], ...c);
          p[1] = Math.max(p[1], ...c);
          return p;
        },
        [Infinity, -Infinity]
      ); // Min Max

      // We assume we want five levels here, since the most common usage will be
      // for CNA values of -2, -1, 0, 1, 2.
      if (config.table.tbl === 'cna') {
        minMax = [-2, 2];
      }

      let color:any = null; // this will be our scaling function

      color = d3Scale.scaleSequential(interpolateViridis).domain(minMax);
      if (config.table.tbl === 'cna') {
        color = d3Scale.scaleDiverging(t => interpolateRdBu(1-(0.8*t+0.1))).domain([-2,0,2]);
      }

      let colorsInClusteredOrder = matrix.data.map(row => row.map(cell => color(cell)));
      let colors = result[0].order.map(v => result[1].order.map(w => colorsInClusteredOrder[v][w]));

      // const legends: Array<Legend> = [
      //   Legend.create(result, 'Cohorts',
      //       survivalResults.map(v => v.name),
      //       survivalResults.map(v => '#' + (0xffffff + v.color + 1).toString(16).substr(1)),
      //       'COLOR', 'DISCRETE')
      // ];

      const midStep = ((minMax[1] - minMax[0]) / 2) + minMax[0];
      let steps:Array<number> = [
        minMax[0],
        ((midStep - minMax[0]) / 2) + minMax[0],
        midStep,
        ((minMax[1] - midStep) / 2) + midStep,
        minMax[1]
      ]
      console.log(`TEMPNOTE: heatmap steps = ${JSON.stringify(steps)}`);
      let legend = new Legend();
      legend.name = 'Values';
      legend.type = 'COLOR';
      legend.display = 'CONTINUOUS';
      legend.labels = steps.map(val => Math.round(val).toString());
      legend.values = steps.map(val => color(val).toString()); //[0xff0000, 0xff0000];

      worker.postMessage({
        config: config,
        data: {
          legends: [legend],
          matrix: matrix,
          colors: colors,
          range: minMax,
          x: result[0],
          y: result[1]
        }
      });

      worker.postMessage('TERMINATE');
    });
  });
};
