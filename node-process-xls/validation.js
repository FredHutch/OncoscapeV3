const _ = require('lodash');
const fs = require('fs');
const files = fs.readdirSync(process.cwd()+'/data').map(v => v.toLowerCase());

var getFileType = (filename) => filename.replace('.csv','').split('-')[0].split('_')[0];

let evaluation = {};
var uniq_file_types = _.uniq(files.map(file => getFileType(file)));
uniq_file_types.forEach(t => {
    
});
/*
    generate validation result in json format
    Error will end the validatioan
    Warning will not
*/




/* After spliting the excel file into multiple csv files
    Check the existance of file types
    required: patient, psmap, at least one matrix | mutation
*/




/*
    Sheet level validation

    Targets:
    - patient
    - sample
    - events
    - matrix
    - mutation
    - genesets

    Items to check: 
    - required fields
    - column uniqueless
    - matrix.genes uniqueless
    - overlapping: 
        - patient <-> sample
        - patient <-> events
        - sample <-> matrix/mutation
        - gene symbols from [matrix, mutations] <-> HGNC list
        - genesets <-> HGNC list
*/ 