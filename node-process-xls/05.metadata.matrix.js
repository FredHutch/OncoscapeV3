const api = require('./api.js');
const mtxTypes = new Set(api.io.readJson('ref', 'matrix.json'));
const files = api.io.readDir('output').filter(v => v.indexOf('matrix-') === 0);
files.forEach(file => {
  const tab = file.substr(0, file.length - 4);
  const mtx = api.io.readCsv('output', file);

  // Determine Matrix Data Type
  let mtxType = mtx[0]
    .shift()
    .toLowerCase()
    .trim();
  if (!mtxTypes.has(mtxType)) {
    api.log.warn('Unknown Matrix Type ' + mtxType + ', classifying as other', tab);
    mtxType = 'other';
  }
  // Extract Samples + Genes
  const samples = mtx.shift();
  const genes = mtx.map(v => v[0]);
  api.io.writeJson('output', '_' + tab + '-metadata.json', {
    name: tab,
    type: mtxType,
    samples: samples,
    genes: genes
  });
});
