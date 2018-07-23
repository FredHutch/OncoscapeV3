const _ = require('lodash');
const fs = require('fs');
const files = fs.readdirSync(process.cwd()+'/data').map(v => v.toLowerCase());
const util = require('./util.js');
const help = require('./helping.js');
var requirement = require('./DatasetRequirements.json');
var getFileType = (filename) => filename.replace('.csv','').split('-')[0].split('_')[0];

let evaluation = {};
var uniq_file_types = _.uniq(files.map(file => getFileType(file)));
uniq_file_types.forEach(t => {
    var obj = {};
    obj.pass = false;
    obj.warning = false;
    var related_files = files.filter(f => getFileType(f) === t);
    var fileobj = {};
    related_files.forEach(f => {
        fileobj[f] = {};
        fileobj[f]['pass'] = false;
        fileobj[f]['warning'] = false;
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

/* 
   check if all the types are validated 
   return the files that do not fit into current data model, or there is typo in the first token
   valid types : ['patient', 'sample', 'event', 'geneset', 'matrix', 'mutation']
*/
var file_types_validation = function(uniq_file_types, requirement, evaluation) {
    valid_types = Object.keys(requirement);
    return uniq_file_types.filter(t => {
        valid_types.indexOf(t) === -1
    }).map(t => {
        evaluation[t]['files'];
    });
};

var file_types_validation_res = file_types_validation(uniq_file_types, requirement, evaluation);
if (file_types_validation_res.length > 0 ){
    evaluation['warning'] = true;
    evaluation['error'] = evaluation['error'] + '| The following files cannot be incorporated into Oncoscape V3.' + file_types_validation_res;
} else {
    evaluation['file_types_validation'] = 'All file types can be accomodated by current Oncoscape V3 data';
}

var file_existant = function(evaluation) {
    if (!'patient' in evaluation && !'sample' in evaluation) {
        evaluation['pass'] = false;
        evaluation['warning'] = false;
        evaluation['error'] = 'PATIENT or SAMPLE table does not exist.';
    } else if (!'matrix' in evaluation && !'mutation' in evaluation) {
        evaluation['pass'] = true;
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

files.forEach(f =>{
    console.log(f);
    var data = util.loadCsv(f);
    var cols = util.shiftColumns(data);
    var cols_upper = cols.map(k => k.toUpperCase());
    data = util.removeExtraCols(data, cols.length);
    // data = util.fillBlankNull(data);
    // data = util.removeExtraRows(data, cols.length);
    var rows = util.shiftColumns(data);
    console.log('size of', f, ':', data.length, 'x', data[0].length);

    // Generic column names unique checking:
    if(!help.check_uniqueness(cols)) {
        evaluation[type]['files'][f]['warning'] = true;
        evaluation[type]['files'][f]['error'] = 'There is duplicated columns';
    };

    // Checking aginst Requirement config
    var type = getFileType(f);
    var r = requirement[type];
    if('required_fields' in r) {
        var notExistingCols = r['required_fields'].filter(k => cols_upper.indexOf(k) === -1);
        if(notExistingCols.length > 0) {
            evaluation[type]['files'][f]['warning'] = false;
            evaluation[type]['files'][f]['pass'] = false;
            evaluation[type]['files'][f]['required_fields'] = notExistingCols;
            evaluation[type]['files'][f]['error'] = evaluation[type]['files'][f]['error'] + '|' + f + 'does not container required fields';
        } else {
            evaluation[type]['files'][f]['warning'] = false;
            evaluation[type]['files'][f]['pass'] = true;
            evaluation[type]['files'][f]['required_fields'] = notExistingCols;
        }
    }
    if('unique_fields' in r) {
        var obj = {};
        var notUniq = [];
        r['unique_fields'].forEach(k => {
            var index = cols_upper.indexOf(k);
            var col_values = data.map(d=>d[index]);
            obj[k] = help.check_uniqueness(col_values);
            if(!obj[k]) notUniq = notUniq.concat(k);
        });
        evaluation[type]['files'][f]['unique_fields'] = obj;
        if(notUniq.length > 0) {
            evaluation[type]['files'][f]['warning'] = false;
            evaluation[type]['files'][f]['pass'] = false;
            evaluation[type]['files'][f]['unique_fields'] = notUniq;
            evaluation[type]['files'][f]['error'] = evaluation[type]['files'][f]['error'] + '|' + f + 'field(s) with replicated values';
        } else {
            evaluation[type]['files'][f]['warning'] = false;
            evaluation[type]['files'][f]['pass'] = true;
            evaluation[type]['files'][f]['unique_fields'] = notUniq;
        }
    }
    if('sheet_specific_checking' in r){

    }

});