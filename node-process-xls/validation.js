const _ = require('lodash');
const fs = require('fs');
const files = fs.readdirSync(process.cwd()+'/data').map(v => v.toLowerCase());
const help = require('./helping.js');
var getFileType = (filename) => filename.replace('.csv','').split('-')[0].split('_')[0];

let evaluation = {};
var uniq_file_types = _.uniq(files.map(file => getFileType(file)));
uniq_file_types.forEach(t => {
    var obj = {};
    obj.pass = false;
    obj.warning = false;
    obj.fail = true;
    var related_files = files.filter(f => getFileType(f) === t);
    var fileobj = {};
    related_files.forEach(f => {
        fileobj[f] = {};
        fileobj[f]['pass'] = false;
        fileobj[f]['warning'] = false;
        fileobj[f]['fail'] = true;
    });
    obj['files'] = fileobj;
    evaluation[t] = obj;
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
    var file_existant = function(evaluation) {
        if (!'patient' in evaluation && !'sample' in evaluation) {
            evaluation['pass'] = false;
            evaluation['fail'] = true;
            evaluation['warning'] = false;
            evaluation['error'] = 'PATIENT or SAMPLE table does not exist.';
        } else if (!'matrix' in evaluation && !'mutation' in evaluation) {
            evaluation['pass'] = true;
            evaluation['fail'] = false;
            evaluation['warning'] = true;
            evaluation['error'] = 'Do not have molecular data to initiate plotting.';
            evaluation['available_tools'] = ['spreadsheet'];
        }
    };

/*
    Sheet level validation
    --- since the serialization doesn't take long, this step of validation can be performed after the serialization ---
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
