"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IO_1 = require("./IO");
const InterfacesAndEnums_1 = require("./InterfacesAndEnums");
class Validate {
    static Run() {
        return new Promise((resolve, reject) => {
            const genes = IO_1.IO.ReadGenes();
            const mutations = IO_1.IO.ReadMutations();
            this.processPatient('./src/output/patient.csv').then((patientIds) => {
                this.processSample('./src/output/sample.csv', patientIds).then((sampleIds) => {
                    IO_1.IO.ReadEventFiles('./src/output').then(files => {
                        console.log('events');
                        Promise.all(files.map(file => {
                            return this.Event('./src/output/', file, patientIds, sampleIds);
                        })).then(v => {
                            console.log('muts');
                            IO_1.IO.ReadMutationFiles('./src/output').then(files => {
                                Promise.all(files.map(file => {
                                    return this.Mutation('./src/output/', file, sampleIds, genes, mutations);
                                })).then(v => {
                                    console.log('mtx');
                                    IO_1.IO.ReadMatrixFiles('./src/output').then(files => {
                                        Promise.all(files.map(file => {
                                            return this.Matrix('./src/output/', file, sampleIds, genes);
                                        })).then(v => {
                                            resolve();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    static ExtractPropertyValues(inputStream, prop) {
        return new Promise((resolve, reject) => {
            prop = prop.toLowerCase().trim();
            inputStream
                .filter(v => v.error.length === 0)
                .reduce(new Array(), (p, c) => {
                p.push(c.data[prop]);
                return p;
            })
                .toArray(v => {
                resolve(v[0]);
            });
        });
    }
    static Mutation(path, file, sampleIds, genes, mutations) {
        return new Promise((resolve, reject) => {
            // Base Files Name
            const baseFileName = file.replace('.csv', '');
            // Load & Preform Inital Tests
            const results = IO_1.IO.loadCsv(path + file)
                .map(Test.requireProperties(['sample id', 'hgnc', 'variant']))
                .map(Test.propertyValuesInSet('sample id', sampleIds))
                .map(Test.propertyValuesInSet('type', mutations))
                .map(Test.resolveGenes());
            // Write Initial Data
            IO_1.IO.WriteLog(baseFileName + '.data.log.json', results.observe());
            IO_1.IO.WriteMutation(baseFileName + '.data.raw.json', results.observe());
            console.log(baseFileName + '.data.log.json');
            console.log(baseFileName + '.data.raw.json');
            // Load Meta Data
            IO_1.IO.loadMetadata(results, ['sample id', 'hgnc', 'variant']).then(metadata => {
                const results = metadata
                    .map(Test.metaFieldsWithOneValue())
                    .map(Test.metaFieldLabels())
                    .map(Test.metaDataType());
                // Write Meta Data
                console.log(baseFileName + '.meta.log.json');
                console.log(baseFileName + '.meta.raw.json');
                Promise.all([IO_1.IO.WriteLog(baseFileName + '.meta.log.json', results.observe()), IO_1.IO.WriteJson(baseFileName + '.meta.raw.json', results)]).then(() => resolve());
            });
        });
    }
    static Event(path, file, patientIds, sampleIds) {
        return new Promise((resolve, reject) => {
            // Base Files Name
            const baseFileName = file.replace('.csv', '');
            // Load & Preform Inital Tests
            const results = IO_1.IO.loadCsv(path + file)
                .map(Test.requireProperties(['patient id', 'start', 'end']))
                .map(Test.propertyValuesInSet('patient id', patientIds));
            // Write Initial Data
            IO_1.IO.WriteLog(baseFileName + '.data.log.json', results.observe());
            IO_1.IO.WriteEvent(baseFileName + '.data.raw.json', results.observe());
            console.log(baseFileName + '.data.log.json');
            console.log(baseFileName + '.data.raw.json');
            // Load Meta Data
            IO_1.IO.loadMetadata(results, ['patient id', 'start', 'end']).then(metadata => {
                const results = metadata
                    .map(Test.metaFieldsWithOneValue())
                    .map(Test.metaFieldLabels())
                    .map(Test.metaDataType());
                // Write Meta Data
                console.log(baseFileName + '.meta.log.json');
                console.log(baseFileName + '.meta.raw.json');
                Promise.all([IO_1.IO.WriteLog(baseFileName + '.meta.log.json', results.observe()), IO_1.IO.WriteJson(baseFileName + '.meta.raw.json', results)]).then(() => resolve());
            });
        });
    }
    static Matrix(path, file, sampleIds, genes) {
        return new Promise((resolve, reject) => {
            // Base Files Name
            const baseFileName = file.replace('.csv', '');
            // Load & Preform Initial Tests
            const results = IO_1.IO.loadCsv(path + file)
                .map(Test.requireProperties(['hgnc']))
                .map(Test.uniqueProperties(['hgnc']))
                .map(Test.resolveGenes());
            // Write Data
            Promise.all([
                IO_1.IO.WriteLog(baseFileName + '.data.log.json', results.observe().map(v => {
                    v.data = { hgnc: v.data.hgnc, symbol: v.data.symbol };
                    return v;
                })),
                IO_1.IO.WriteMatrix(baseFileName + '.data.raw.json', results)
            ]).then(() => resolve()); // Write Molecular Data
        });
    }
    static processSample(uri, patientIds) {
        return new Promise((resolve, reject) => {
            // Test Inital Data
            const results = IO_1.IO.loadCsv(uri)
                .map(Test.requireProperties(['patient id', 'sample id']))
                .map(Test.uniqueProperties(['sample id']))
                .map(Test.propertyValuesInSet('patient id', patientIds));
            // Write Inital Data
            IO_1.IO.WriteLog('sample.data.log.json', results.fork());
            IO_1.IO.WriteJson('sample.data.raw.json', results.fork());
            IO_1.IO.WriteProperty('sample.data.id.json', results.fork(), 'sample id');
            console.log('sample.data.log.json');
            console.log('sample.data.raw.json');
            console.log('sample.data.id.json');
            // Load Meta Data
            IO_1.IO.loadMetadata(results.fork(), ['patient id', 'sample id']).then(metadata => {
                const results = metadata
                    .map(Test.metaFieldsWithOneValue())
                    .map(Test.metaFieldLabels())
                    .map(Test.metaDataType());
                // Write Meta Data
                IO_1.IO.WriteLog('sample.meta.log.json', results.observe());
                IO_1.IO.WriteJson('sample.meta.raw.json', results);
                console.log('sample.meta.log.json');
                console.log('sample.meta.raw.json');
            });
            // Extract Ids + Resolve Promise
            this.ExtractPropertyValues(results.fork(), 'sample id').then(results => {
                resolve(results);
            });
        });
    }
    static processPatient(uri) {
        return new Promise((resolve, reject) => {
            // Load Data + Preform Tests
            const results = IO_1.IO.loadCsv(uri)
                .map(Test.requireProperties(['patient id']))
                .map(Test.uniqueProperties(['patient id']));
            // Write Data
            IO_1.IO.WriteLog('patient.data.log.json', results.fork());
            IO_1.IO.WriteJson('patient.data.raw.json', results.fork());
            IO_1.IO.WriteProperty('patient.id.json', results.fork(), 'patient id');
            console.log('patient.data.log.json');
            console.log('patient.data.raw.json');
            console.log('patient.data.id.json');
            // Load Meta Data
            IO_1.IO.loadMetadata(results.fork(), ['patient id']).then(metadata => {
                const results = metadata
                    .map(Test.metaFieldsWithOneValue())
                    .map(Test.metaFieldLabels())
                    .map(Test.metaDataType());
                // Write Meta Data
                IO_1.IO.WriteLog('patient.meta.log.json', results.observe());
                IO_1.IO.WriteJson('patient.meta.raw.json', results);
                console.log('patient.meta.log.json');
                console.log('patient.meta.raw.json');
            });
            // Extract Ids + Resolve Promise
            this.ExtractPropertyValues(results.fork(), 'patient id').then(results => {
                resolve(results);
            });
        });
    }
}
exports.Validate = Validate;
class Test {
    /**
     * Map Function For Highland Stream
     * @param props Array of Required Object Property Names
     */
    static requireProperties(props) {
        props = props.map(v => v.trim().toLowerCase());
        return (obj) => {
            props.forEach(prop => {
                if (!obj.data.hasOwnProperty(prop)) {
                    obj.error.push({
                        action: InterfacesAndEnums_1.eAction.REM,
                        element: InterfacesAndEnums_1.eElement.SHEET,
                        constraint: InterfacesAndEnums_1.eConstraint.REQUIRED,
                        prop: prop,
                        value: prop
                    });
                }
            });
            return obj;
        };
    }
    /**
     * Map Function For Highland Stream
     * @param props names of column headers
     */
    static uniqueProperties(props) {
        props = props.map(v => v.trim().toLowerCase());
        const sets = props.reduce((p, c) => {
            p[c] = new Set();
            return p;
        }, {});
        return (obj) => {
            props.forEach(prop => {
                const value = obj.data[prop];
                if (sets[prop].has(value)) {
                    obj.error.push({
                        action: InterfacesAndEnums_1.eAction.REM,
                        element: InterfacesAndEnums_1.eElement.ROW,
                        constraint: InterfacesAndEnums_1.eConstraint.UNIQUE,
                        prop: prop,
                        value: value
                    });
                }
                else {
                    sets[prop].add(value);
                }
            });
            return obj;
        };
    }
    /**
     * Map Function For Highland Stream
     * @param props name of column header
     * @param values valid values for the column
     */
    static propertyValuesInSet(prop, values) {
        prop = prop.trim().toLowerCase();
        const vals = new Set(values.map(v => v.trim().toLowerCase()));
        return (obj) => {
            const value = obj.data[prop];
            if (!vals.has(value)) {
                obj.error.push({
                    action: InterfacesAndEnums_1.eAction.REM,
                    element: InterfacesAndEnums_1.eElement.ROW,
                    constraint: InterfacesAndEnums_1.eConstraint.INVALID_VALUE,
                    prop: prop,
                    value: value
                });
            }
            return obj;
        };
    }
    static metaFieldLabels() {
        return (obj) => {
            obj.data.label = obj.data.name.replace(/[\W_]+/g, ' ');
            if (obj.data.label !== obj.data.name) {
                obj.info.push({
                    action: InterfacesAndEnums_1.eAction.MOD,
                    element: InterfacesAndEnums_1.eElement.COLUMN,
                    constraint: InterfacesAndEnums_1.eConstraint.INVALID_VALUE,
                    prop: obj.data.name,
                    value: obj.data.label
                });
            }
            return obj;
        };
    }
    static propertyValues(inputStream, prop) {
        return new Promise((resolve, reject) => {
            prop = prop.toLowerCase().trim();
            inputStream
                .filter(v => v.error.length === 0)
                .reduce(new Array(), (p, c) => {
                p.push(c.data[prop]);
                return p;
            })
                .toArray(v => {
                resolve(v[0]);
            });
        });
    }
    static metaFieldsWithOneValue() {
        return (obj) => {
            if (obj.data.values.length === 1) {
                obj.error.push({
                    action: InterfacesAndEnums_1.eAction.REM,
                    element: InterfacesAndEnums_1.eElement.COLUMN,
                    constraint: InterfacesAndEnums_1.eConstraint.SINGLE_VALUE,
                    prop: obj.data.name,
                    value: obj.data.values[0]
                });
            }
            return obj;
        };
    }
    static metaDataType() {
        return (obj) => {
            // Aggregate Numeric and String Values in Each Property
            const distribution = obj.data.values.reduce((p, c) => {
                const sValue = c.trim().toLowerCase();
                if (!isNaN(parseFloat(sValue)) && isFinite(parseFloat(sValue))) {
                    p.numbers.push(parseFloat(sValue));
                }
                else {
                    p.strings.push(sValue);
                }
                return p;
            }, { numbers: new Array(), strings: new Array() });
            const numberValues = distribution.numbers.length;
            const stringValues = distribution.strings.length;
            const totalValues = numberValues + stringValues;
            if (stringValues > 0 && numberValues > 0) {
                // Few Values That will likely work well as descrete strings
                if (totalValues < 12) {
                    // Only treat as numbers if there are no strings
                    obj.data.type = stringValues === 0 ? InterfacesAndEnums_1.eDataType.Number : InterfacesAndEnums_1.eDataType.String;
                }
                else {
                    // Here we have to start guessing... Lots of values
                    const percentNumeric = numberValues / totalValues;
                    const percentStric = stringValues / totalValues;
                    if (stringValues <= 3) {
                        obj.info.push({
                            action: InterfacesAndEnums_1.eAction.MOD,
                            element: InterfacesAndEnums_1.eElement.COLUMN,
                            constraint: InterfacesAndEnums_1.eConstraint.NON_NUMERIC,
                            prop: obj.data.name,
                            value: distribution.strings.join(',')
                        });
                        obj.data.type = InterfacesAndEnums_1.eDataType.Number;
                    }
                    else if (percentNumeric >= 0.9) {
                        obj.info.push({
                            action: InterfacesAndEnums_1.eAction.MOD,
                            element: InterfacesAndEnums_1.eElement.COLUMN,
                            constraint: InterfacesAndEnums_1.eConstraint.NON_NUMERIC,
                            prop: obj.data.name,
                            value: distribution.strings.join(',')
                        });
                        obj.data.type = InterfacesAndEnums_1.eDataType.Number;
                    }
                    else {
                        obj.error.push({
                            action: InterfacesAndEnums_1.eAction.REM,
                            element: InterfacesAndEnums_1.eElement.COLUMN,
                            constraint: InterfacesAndEnums_1.eConstraint.UNKNOWN_TYPE,
                            prop: obj.data.name,
                            value: totalValues.toString() + 'values, of which ' + Math.round(100 * percentNumeric).toString() + '% are numeric'
                        });
                        obj.data.type = InterfacesAndEnums_1.eDataType.NA;
                    }
                }
            }
            else if (stringValues === 0) {
                obj.data.type = InterfacesAndEnums_1.eDataType.Number;
            }
            else {
                if (totalValues > 12) {
                    obj.error.push({
                        action: InterfacesAndEnums_1.eAction.REM,
                        element: InterfacesAndEnums_1.eElement.COLUMN,
                        constraint: InterfacesAndEnums_1.eConstraint.UNINFORMATIVE,
                        prop: obj.data.name,
                        value: totalValues + ' string values'
                    });
                    obj.data.type = InterfacesAndEnums_1.eDataType.NA;
                }
                else {
                    obj.data.type = InterfacesAndEnums_1.eDataType.String;
                }
            }
            return obj;
        };
    }
    static resolveGenes() {
        return (obj) => {
            const gene = obj.data.hgnc.toLowerCase().trim();
            if (this.geneMap[gene]) {
                const geneInfo = this.geneMap[gene];
                const symbol = geneInfo[0];
                const lookup = geneInfo[1];
                obj.data.symbol = geneInfo[0];
                if (lookup !== 'symbol') {
                    obj.info.push({
                        action: InterfacesAndEnums_1.eAction.MOD,
                        element: InterfacesAndEnums_1.eElement.GENE,
                        constraint: InterfacesAndEnums_1.eConstraint.INVALID_VALUE,
                        prop: gene,
                        value: symbol + ' using ' + lookup
                    });
                }
            }
            else {
                obj.error.push({
                    action: InterfacesAndEnums_1.eAction.REM,
                    element: InterfacesAndEnums_1.eElement.GENE,
                    constraint: InterfacesAndEnums_1.eConstraint.INVALID_VALUE,
                    prop: gene,
                    value: ''
                });
            }
            return obj;
        };
    }
}
// Resolve Gene Names
Test.geneMap = IO_1.IO.ReadGenes();
exports.Test = Test;
//# sourceMappingURL=step2_validate.js.map