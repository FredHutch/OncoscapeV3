"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IO_1 = require("./IO");
const InterfacesAndEnums_1 = require("./InterfacesAndEnums");
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
class WriteLog {
    static Run() {
        return new Promise((resolve, reject) => {
            const files = fs_1.default.readdirSync('./src/output'); // Jenny, Please Move This Into IO
            const log = new Array();
            // Patients
            files.filter(v => v.startsWith('patient') && v.endsWith('log.json')).forEach(fileName => {
                let file = IO_1.IO.ReadJson('./src/output/', fileName);
                let sheet = { sheet: InterfacesAndEnums_1.eSheet.PATIENT, file: fileName, error: [], info: [] };
                file.forEach((record) => {
                    sheet.error.push(...record.error);
                    sheet.info.push(...record.info);
                });
                log.push(sheet);
            });
            // Samples
            files.filter(v => v.startsWith('sample') && v.endsWith('log.json')).forEach(fileName => {
                let file = IO_1.IO.ReadJson('./src/output/', fileName);
                let sheet = { sheet: InterfacesAndEnums_1.eSheet.SAMPLE, file: fileName, error: [], info: [] };
                file.forEach((record) => {
                    sheet.error.push(...record.error);
                    sheet.info.push(...record.info);
                });
                log.push(sheet);
            });
            // Events
            files.filter(v => v.startsWith('event') && v.endsWith('log.json')).forEach(fileName => {
                let file = IO_1.IO.ReadJson('./src/output/', fileName);
                let sheet = { sheet: InterfacesAndEnums_1.eSheet.EVENT, file: fileName, error: [], info: [] };
                file.forEach((record) => {
                    sheet.error.push(...record.error);
                    sheet.info.push(...record.info);
                });
                log.push(sheet);
            });
            // Mutations
            files.filter(v => v.startsWith('mutation') && v.endsWith('log.json')).forEach(fileName => {
                let file = IO_1.IO.ReadJson('./src/output/', fileName);
                let sheet = { sheet: InterfacesAndEnums_1.eSheet.MUTATION, file: fileName, error: [], info: [] };
                file.forEach((record) => {
                    sheet.error.push(...record.error);
                    sheet.info.push(...record.info);
                });
                log.push(sheet);
            });
            // Matrix
            files.filter(v => v.startsWith('matrix-') && v.endsWith('log.json')).forEach(fileName => {
                let file = IO_1.IO.ReadJson('./src/output/', fileName);
                let sheet = { sheet: InterfacesAndEnums_1.eSheet.MATRIX, file: fileName, error: [], info: [] };
                file.forEach((record) => {
                    sheet.error.push(...record.error);
                    sheet.info.push(...record.info);
                });
                log.push(sheet);
            });
            this.Report(log);
            IO_1.IO.WriteString('log.json', JSON.stringify(log)).then(() => {
                console.log('log.json');
                resolve();
            });
        });
    }
    static writeDataLog(sheet) {
        let report = '## ' + sheet.file.substr(0, sheet.file.indexOf('.')) + '\n';
        const unidentifiedGenes = new Array();
        const invalidValues = new Object();
        if (sheet.error.length > 0) {
            report += '### Records Removed \n';
            sheet.error.forEach((v, i) => {
                if (v.constraint === InterfacesAndEnums_1.eConstraint.UNIQUE) {
                    report += '* Column ' + v.prop + " : contains duplicate values, removing subsequent instances of '" + v.value + "'\n";
                }
                else if (v.constraint === InterfacesAndEnums_1.eConstraint.INVALID_VALUE) {
                    if (v.element === InterfacesAndEnums_1.eElement.GENE) {
                        unidentifiedGenes.push(v.prop);
                    }
                    else {
                        if (!invalidValues.hasOwnProperty(v.prop)) {
                            invalidValues[v.prop] = new Array();
                        }
                        invalidValues[v.prop].push(v.value);
                    }
                }
            });
        }
        Object.keys(invalidValues).forEach(key => {
            report += '* Column ' + key + ' contains invalid values: ' + lodash_1.default.uniq(invalidValues[key]).join(', ') + ' \n';
        });
        if (unidentifiedGenes.length > 0) {
            report += '### Removed Data Associate With Unidentified Genes: \n';
            report += lodash_1.default.uniq(unidentifiedGenes).join(', ') + ' \n';
        }
        if (sheet.info.length > 0) {
            // sheet.info.filter(v => v.element === 16).forEach)
        }
        return report;
    }
    static Meta(sheet) {
        let report = '## ' + sheet.file.substr(0, sheet.file.indexOf('.')) + '\n';
        if (sheet.error.length > 0) {
            report += '### Columns Removed\n';
            sheet.error.forEach(v => {
                if (v.constraint === InterfacesAndEnums_1.eConstraint.REQUIRED) {
                    report += '* ' + v.prop + ' : is required \n';
                }
                if (v.constraint === InterfacesAndEnums_1.eConstraint.SINGLE_VALUE) {
                    report += '* ' + v.prop + " : contains only one value '" + v.value + "' \n";
                }
                if (v.constraint === InterfacesAndEnums_1.eConstraint.UNINFORMATIVE) {
                    report += '* ' + v.prop + ' : contains ' + v.value + ', not suitable for visualization \n';
                }
            });
        }
        if (sheet.info.length > 0) {
            sheet.info.filter(v => v.constraint === InterfacesAndEnums_1.eConstraint.INVALID_VALUE).forEach((v, i) => {
                if (i === 0)
                    report += '### Columns Renamed \n';
                report += '* ' + v.prop + ' : is now ' + v.value + ' \n';
            });
            sheet.info.filter(v => v.constraint === InterfacesAndEnums_1.eConstraint.INVALID_VALUE).forEach((v, i) => {
                if (i === 0)
                    report += '### Column Data Type \n';
                report += '* ' + v.prop + ' : appears to be numeric, nullifying alpha-numeric values \n';
            });
        }
        return report;
    }
    static Report(sheets) {
        let report = '';
        let tmp = sheets.filter(v => v.file.endsWith('data.log.json'));
        report += '# ' + tmp.length + ' files processed on ';
        var currentdate = new Date();
        report += currentdate.getDate() + '/' + (currentdate.getMonth() + 1) + '/' + currentdate.getFullYear() + ' @ ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '\n';
        // const meta = sheets.filter(v => v.file.endsWith("meta.log.json"));
        // meta.forEach(sheet => {
        //   report += this.writeMetaLog(sheet);
        // });
        const data = sheets.filter(v => v.file.endsWith('data.log.json'));
        data.forEach(sheet => {
            report += this.writeDataLog(sheet);
        });
        console.log('log.md');
        fs_1.default.writeFileSync('./src/output/log.md', report);
    }
}
exports.WriteLog = WriteLog;
//# sourceMappingURL=step3_log.js.map