
// Libs
const util = require('./util');
const fs = require('fs');

// Load Data
let data = util.loadCsv('Patient.csv');
const cols = util.shiftColumns(data);
const indexes = util.extractColumnIndexes(cols, cols);

// Format Ids + Remove Rows With Null Ids
data = data.map(v => { 
    v[indexes.PATIENTID] = util.formatKey(v[indexes.PATIENTID]);
    return v;
}).filter( v => (v[indexes.PATIENTID] !== null) );


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


// Values
const values = data.map( (row) => { 
    return row.filter(v => v !== '').map( ( cell, index ) => {
        const fieldName = cols[index];
        if (!fieldName) { return null; }
        return fieldMap[fieldName].indexOf(cell);
    });
});

// Remove Patient Id From Field Map + Values
delete fieldMap.PATIENTID
values.forEach( value => { 
    value.splice(indexes.PATIENTID, 1);
})

// Ids
ids = data.map(v => v[indexes.PATIENTID]);

var output = {
    fields: fieldMap,
    ids: ids, 
    values: values
};

// Serialize To Json + Save
fs.writeFileSync(process.cwd()+'/output/manifest-fields.json', JSON.stringify(fieldMap), {'encoding':'UTF-8'});
fs.writeFileSync(process.cwd()+'/output/clinical.json', JSON.stringify(output), {'encoding':'UTF-8'});