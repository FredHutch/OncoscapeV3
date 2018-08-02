const api = require('./api.js');
const mutationData = api.io.readCsv('output', 'mutation.csv');
const columns = mutationData.shift().map(v => v.toLowerCase().trim());
const values = columns.reduce((p, c) => {
  p[c.toLowerCase()] = new Set();
  return p;
}, {});

mutationData.forEach(datum => {
  datum.forEach((col, i) => {
    const key = columns[i];
    let val = col;
    if (typeof val === 'string') {
      val = val.trim().toLowerCase();
    }
    values[key].add(val);
  });
});

const metadata = Object.keys(values)
  .filter(v => v !== 'mutation id')
  .reduce((prev, value) => {
    const vals = Array.from(values[value]);
    var numberRawValues = vals.length;
    var numberNumericValues = vals.reduce((p, c) => {
      p += isNaN(c) ? 0 : 1;
      return p;
    }, 0);

    if (numberRawValues === 1) {
      api.log.warn('Omiting Column [' + value + '] Contains Only 1 Value: ' + vals[0], 'mutation');

      // Deal With Lots Of Values
    } else if (numberRawValues > 12) {
      // These are Discrete Values
      if (numberRawValues - numberNumericValues > 3) {
        api.log.warn(
          'Omiting Column ' +
            value +
            ' Contains ' +
            numberRawValues +
            ' Discrete Values, limit to 12',
          'mutation'
        );
      } else if (numberRawValues - numberNumericValues <= 1) {
        // Is Numeric
        const sorted = vals.filter(v => !isNaN(v) && v !== '').sort();
        prev[value] = { min: sorted[0], max: sorted[sorted.length - 1] };
      } else {
        api.log.warn(
          'Omiting Column ' +
            value +
            ' Contains ' +
            Math.round((numberNumericValues / numberRawValues) * 100) +
            '% Numeric Values - If This is a numeric column, leave non-numeric cells empty empty',
          'mutation'
        );
      }
    } else {
      // Is Discrete
      prev[value] = Array.from(
        new Set(
          vals.map(v => v.toString()).map(v => {
            if (v === '') {
              v = 'unknown';
            }
            return v;
          })
        )
      );
    }
    return prev;
  }, {});

// Write Meta Data
api.io.writeJson('output', '_mutation-metadata.json', metadata);
