import { SpriteMaterialEnum } from './../../../model/enum.model';
import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { ChromosomeConfigModel } from './chromosome.model';
import { Legend } from './../../../model/legend.model';

export const chromosomeCompute = (config: ChromosomeConfigModel, worker: DedicatedWorkerGlobalScope): void => {
  try {
    if(config.reuseLastComputation) {
      worker.postMessage({config: config, data: {cmd:'reuse'}});
      return;
    }
    
    worker.util.fetchUri('https://oncoscape.v3.sttrcancer.org/data/genomes/grch38.json.gz').then(result => {
    let resultStr:string = result.toString();  
    const legends = [Legend.create(result, 'Data Points', ['Samples'], [SpriteMaterialEnum.CIRCLE], 'SHAPE', 'DISCRETE')];
    if (resultStr.startsWith('<')) {
        // We see HTML < because we've redirected to mouse genome or some such page. Should be seeing "{" for JSON.
        let err = new Error('Could not access the genome file grch38.json.gz.');
        worker.postMessage({
          config: config,
          error: err
        });
        worker.postMessage('TERMINATE');      
      } else {
        worker.postMessage({ config: config, data: { legends: legends, result: result } });
      }
    });
  } catch (err) {
    worker.postMessage({
      config: config,
      error: err
    });
    worker.postMessage('TERMINATE');
  }

  // const sendResult = (result, chromo, chords) => {
  //   worker.postMessage({
  //     config: config,
  //     data: {
  //       result: {
  //         genes: result,
  //         chromosome: chromo,
  //         chords: chords
  //       },
  //       genes: [],
  //       links: [],
  //       legendItems: [],
  //       patientIds: [],
  //       sampleIds: [],
  //       markerIds: []
  //     }
  //   });
  //   worker.postMessage('TERMINATE');
  // };

  // worker.util.getChromosomeInfo(config.chromosome, []).then(result => {
  //   const chromo = ct.find(v => v.chr === config.chromosome);
  //   const genes = result.map(v => v.gene);
  //   worker.util
  //     .getMolecularGeneValues(genes, { tbl: config.table.tbl.replace(/\s/g, '') }, config.database)
  //     .then(values => {
  //       worker.postMessage({
  //         config: config,
  //         data: {
  //           values: values,
  //           chromo: chromo,
  //           genes: result
  //         }
  //       });
  //     });

  // if (config.geneOption.key !== 'all') {
  //     const gType = config.geneOption.key;
  //     result = result.filter(v => v.type === gType);
  // }
  // const genes = result.map(v => v.gene);
  // if (config.chordOption.key === 'none') {
  //     sendResult(result, chromo, null);
  // } else {
  //     worker.util.getGeneLinkInfoByGenes(config.markerFilter).then(chords => {
  //         chords.map(chord => ({ source: chord.source, target: chord.target, tension: chord.tension }));
  //         sendResult(result, chromo, chords);
  //     });
  // }
  // Promise.all([
  //     // worker.util.getMolecularGeneValues(genes, {tbl: 'gistic'}),
  //     // worker.util.getMolecularGeneValues(genes, {tbl: 'mut'}),
  //     worker.util.getMolecularGeneValues(genes, {tbl: 'rna'})
  // ]).then(v => {
  // });
};
