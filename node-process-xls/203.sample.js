// Libs
const util = require('./util');
const fs = require('fs');
const isNumber = require('is-number');
const _ = require('lodash');

// Load Data
let data = util.loadCsv('SAMPLE.csv');
const cols = util.shiftColumns(data);
const indexes = util.extractColumnIndexes(cols, cols);

// Remove Extra Columns and Keep Enough Columns and fill the empty strings with null
data = util.removeExtraCols(data, cols.length);
data = util.fillBlankNull(data);
data = util.removeExtraRows(data, cols.length);

// Format Ids + Remove Rows With Null Ids
data = data.map(v => { 
    v[indexes.SAMPLEID] = util.formatKey(v[indexes.SAMPLEID]);
    return v;
}).filter( v => (v[indexes.SAMPLEID] !== null) );

// Create A Set To Hold All Possible Values Of Fields
let fields = cols.reduce( (p, c) => {
    p[c] = new Set(); return p; }, {} );

data.forEach( row => { 
    cols.forEach( col => { 
        fields[col].add(row[indexes[col]]);
    })
});

const fieldMap = Object.keys(fields).reduce( (p, c) => { 
    p[c] = Array.from(fields[c]);
    return p;
}, {});
// Handling numeric values
var numeric_fields = [];
Object.keys(fieldMap).forEach(key => {
    var arr = fieldMap[key].map(v => v === null ? null : v.replace(' ', ''));
    if (isNumber(arr.sort().filter(s => s!== '')[0])) {
        var arr = arr.map( str => parseFloat(str));
        numeric_fields = numeric_fields.concat(key);
        var obj = {};
        obj.min = _.min(arr);
        obj.max = _.max(arr);
        fieldMap[key] = obj;
    }
});

// Values
const values = data.map( (row) => { 
    return row.filter(v => v !== '').map( ( cell, index ) => {
        const fieldName = cols[index];
        if (!fieldName) { return null; }
        if ('min' in fieldMap[fieldName]) {
            return parseFloat(cell);
        } else {
            return fieldMap[fieldName].indexOf(cell);
        }
    });
}); 

// Remove Patient Id From Field Map + Values
delete fieldMap.PATIENTID
values.forEach( value => { 
    value.splice(indexes.PATIENTID, 1);
});

// Ids
ids = data.map(v => v[indexes.PATIENTID]);

var output = {
    fields: fieldMap,
    ids: ids, 
    values: values
};

// Serialize To Json + Save
fs.writeFileSync(process.cwd()+'/output/manifest-fields-sample.json', JSON.stringify(fieldMap), {'encoding':'UTF-8'});
fs.writeFileSync(process.cwd()+'/output/sample.json', JSON.stringify(output), {'encoding':'UTF-8'});

const indexes_psmap = util.extractColumnIndexes(cols, ['PATIENTID','SAMPLEID']);
const output_psmap = data.reduce( (p, c) => { 
    const pid = util.formatKey(c[indexes_psmap.PATIENTID]);
    const sid = util.formatKey(c[indexes_psmap.SAMPLEID]);
    if (pid === null || sid === null) { return p; }
    if (!p.hasOwnProperty(pid)) { p[pid] = []; }
    p[pid].push(sid);
    return p;
}, {});

// Serialize To Json + Save
fs.writeFileSync(process.cwd()+'/output/psmap.json', JSON.stringify(output_psmap), {'encoding':'UTF-8'});
