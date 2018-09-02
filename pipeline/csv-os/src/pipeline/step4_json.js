"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InterfacesAndEnums_1 = require("./InterfacesAndEnums");
const IO_1 = require("./IO");
const fs_1 = __importDefault(require("fs"));
class WriteJson {
    static Run() {
        // Write All Json Files, Then Create Manifest
        return Promise.all([this.writePatientJson('patient.json'), this.writeSampleJson('sample.json'), this.writePatientSampleJson('psmap.json'), this.writeMatriciesJson(), this.writeMutationJson(), this.writeEventsJson()]).then(() => {
            this.writeManifestJson();
        });
    }
    static writeManifestJson() {
        return new Promise((resolve, reject) => {
            console.log('manifest.json');
            const manifest = {};
            manifest.patient = IO_1.IO.ReadJson('./src/output/', 'patient.json').fields;
            manifest.sample = IO_1.IO.ReadJson('./src/output/', 'sample.json').fields;
            const dir = fs_1.default.readdirSync('./src/output');
            manifest.version = '3.1';
            manifest.schema = {
                dataset: 'name',
                patientSampleMap: 's, p',
                patientMeta: 'key',
                sampleMeta: 'key',
                patient: 'p,' +
                    Object.keys(manifest.patient)
                        .map(v => v.replace(/ /gi, '_'))
                        .join(','),
                sample: 's,' +
                    Object.keys(manifest.sample)
                        .map(v => v.replace(/ /gi, '_'))
                        .join(',')
            };
            manifest.files = [
                {
                    name: 'patient',
                    dataType: 'patient',
                    file: 'patient.json'
                },
                {
                    name: 'sample',
                    dataType: 'sample',
                    file: 'sample.json'
                },
                {
                    name: 'psmap',
                    dataType: 'psmap',
                    file: 'psmap.json'
                }
            ];
            if (dir.indexOf('events.json')) {
                manifest.events = IO_1.IO.ReadJson('./src/output/', 'events.json').map;
                manifest.schema.events = '++, p';
                manifest.files.push({
                    name: 'events',
                    dataType: 'events',
                    file: 'events.json'
                });
            }
            if (dir.indexOf('mut.json')) {
                manifest.events = IO_1.IO.ReadJson('./src/output/', 'events.json').map;
                manifest.schema.mut = '++, m, p, t';
                manifest.files.push({ name: 'mutations', dataType: 'mut', file: 'mut.json' });
            }
            dir
                .filter(v => v.indexOf('matrix') === 0)
                .filter(v => v.indexOf('data.json') !== -1)
                .forEach(file => {
                const fname = file.replace('.data.json', '').replace('matrix-', '');
                manifest.schema[fname] = 'm';
                manifest.schema[fname + 'Map'] = 's';
                manifest.files.push({
                    name: fname,
                    dataType: 'matrix',
                    file: file
                });
            });
            const str = JSON.stringify(manifest);
            IO_1.IO.WriteString('manifest.json', str).then(() => {
                console.log('manifest.json');
                resolve();
            });
        });
    }
    static writeMutationJson() {
        return new Promise((resolve, reject) => {
            const files = fs_1.default
                .readdirSync('./src/output')
                .filter(v => v.indexOf('mutation.data.raw.json') === 0)
                .filter(v => v.indexOf('raw.json') !== -1);
            files.forEach(v => {
                const data = IO_1.IO.ReadJson('./src/output/', v).filter((v) => v.error.length === 0);
                // gene-id-mut
                let agg = data.filter(v => v.error.length === 0).map(v => ({ hgnc: v.data.symbol, sid: v.data['sample id'], type: v.data.type }));
                const genes = Array.from(new Set(agg.map(v => v.hgnc)));
                const sids = Array.from(new Set(agg.map(v => v.sid)));
                const muts = Array.from(new Set(agg.map(v => v.type))).reduce((p, c, i) => {
                    p[c] = 1 * Math.pow(2, i);
                    return p;
                }, {});
                const values = agg.reduce((p, c) => {
                    // dont map this pass
                    const gid = genes.indexOf(c.hgnc);
                    const sid = sids.indexOf(c.sid);
                    if (!p.hasOwnProperty(gid)) {
                        p[gid] = {};
                    }
                    if (!p[gid].hasOwnProperty(sid)) {
                        p[gid][sid] = 0;
                    }
                    p[gid][sid] |= muts[c.type];
                    return p;
                }, {});
                const strGenes = '["' + genes.join('","') + '"]';
                const strSids = '["' + sids.join('","') + '"]';
                const strMuts = JSON.stringify(muts);
                const strValues = '["' +
                    Object.keys(values).reduce((p, gid) => {
                        p += Object.keys(values[gid]).reduce((ip, sid) => {
                            ip += gid + '-' + sid + '-' + values[gid][sid] + '","';
                            return ip;
                        }, '');
                        return p;
                    }, '') +
                    '"]';
                const vals = JSON.parse(strValues).filter((v) => v.length !== 3);
                const rv = {
                    genes: JSON.parse(strGenes),
                    ids: JSON.parse(strSids),
                    muts: JSON.parse(strMuts),
                    values: vals
                };
                const str = JSON.stringify(rv);
                IO_1.IO.WriteString('mut.json', str).then(() => {
                    console.log('mut.json');
                    resolve();
                });
            });
        });
    }
    static writeEventsJson() {
        return new Promise((resolve, reject) => {
            const files = fs_1.default
                .readdirSync('./src/output')
                .filter(v => v.indexOf('event-') === 0)
                .filter(v => v.indexOf('data.raw.json') !== -1);
            // for (var )
            // IO.ReadJson(fs)
            const eventMap = {};
            const eventIndex = new Array();
            const allEvents = new Array();
            Promise.all(files.map(file => {
                return new Promise((resolve, reject) => {
                    const events = IO_1.IO.ReadJson('./src/output/', file).filter((v) => v.error.length === 0);
                    const eventType = file.split('.')[0].split('-');
                    // This event has no subcategory
                    if (eventType.length === 2) {
                        eventMap[eventType[1]] = 'Event';
                        eventIndex.push(eventType[1]);
                        // This event has a subcategory
                    }
                    else if (eventType.length === 3) {
                        eventMap[eventType[2]] = eventType[1];
                        eventIndex.push(eventType[2]);
                    }
                    const currentEventIndex = eventIndex.length - 1;
                    allEvents.push(...events.map(event => {
                        const data = Object.keys(event.data)
                            .filter(key => {
                            return key !== 'patient id' && key !== 'start' && key !== 'end';
                        })
                            .reduce((p, c) => {
                            if (event.data[c].toString().trim() !== '') {
                                p[c] = event.data[c];
                            }
                            return p;
                        }, {});
                        return [event.data['patient id'], currentEventIndex, parseFloat(event.data.start), parseFloat(event.data.end), data];
                    }));
                    resolve();
                });
            })).then(() => {
                const str = JSON.stringify({
                    map: eventMap,
                    data: allEvents
                });
                IO_1.IO.WriteString('events.json', str).then(() => {
                    console.log('events.json');
                    resolve();
                });
            });
        });
    }
    static writeMatriciesJson() {
        return new Promise((resolve, reject) => {
            const files = fs_1.default
                .readdirSync('./src/output')
                .filter(v => v.indexOf('matrix-') === 0)
                .filter(v => v.indexOf('raw.json') !== -1);
            const samples = IO_1.IO.ReadJson('./src/output/', 'sample.data.id.json');
            Promise.all(files.map(v => {
                return new Promise((resolve, reject) => {
                    const matrix = IO_1.IO.ReadJson('./src/output/', v).filter((v) => v.error.length === 0);
                    const dataGenes = matrix.reduce((p, c) => {
                        const datum = c.data;
                        p.genes.push(datum.symbol);
                        p.data.push(samples.map((sample) => parseFloat(datum[sample])));
                        return p;
                    }, { data: [], genes: [] });
                    IO_1.IO.WriteString(v.replace('data.raw.json', 'data.json'), JSON.stringify({ ids: samples, genes: dataGenes.genes, data: dataGenes.data })).then(() => {
                        console.log(v.replace('data.raw.json', 'data.json'));
                        resolve();
                    });
                });
            })).then(() => {
                resolve();
            });
        });
    }
    static writeSampleJson(uri) {
        return new Promise((resolve, reject) => {
            const meta = IO_1.IO.ReadJson('./src/output/', 'sample.meta.log.json');
            const fields = meta.filter(v => v.error.length === 0).reduce((p, c) => {
                if (c.data.type === InterfacesAndEnums_1.eDataType.Number) {
                    const numericValues = c.data.values.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
                    const max = Math.max.apply(null, numericValues);
                    const min = Math.min.apply(null, numericValues);
                    p[c.data.label.trim().toLowerCase()] = { min: min, max: max };
                }
                else if (c.data.type === InterfacesAndEnums_1.eDataType.String) {
                    const stringValues = c.data.values.map((v) => v
                        .toString()
                        .trim()
                        .toLowerCase());
                    p[c.data.label.trim().toLowerCase()] = stringValues;
                }
                return p;
            }, {});
            const data = IO_1.IO.ReadJson('./src/output/', 'sample.data.raw.json');
            const ids = data.map(v => v.data['sample id'].toLowerCase().trim());
            const fieldNames = meta.filter(v => v.error.length === 0).map(v => v.data.name.trim().toLowerCase());
            const fieldLabels = meta.filter(v => v.error.length === 0).map(v => v.data.label);
            const values = data.map(datum => {
                return fieldNames.map((fieldName, i) => {
                    const lbl = fieldLabels[i];
                    const value = datum.data[fieldName.trim().toLowerCase()];
                    const f = fields[lbl.trim().toLowerCase()];
                    return f.hasOwnProperty('min') ? parseFloat(value) : f.indexOf(value);
                });
            });
            const output = {
                ids: ids,
                fields: fields,
                values: values
            };
            IO_1.IO.WriteString('sample.json', JSON.stringify(output)).then(() => {
                resolve();
            });
        });
    }
    static writePatientJson(uri) {
        return new Promise((resolve, reject) => {
            const meta = IO_1.IO.ReadJson('./src/output/', 'patient.meta.log.json');
            const fields = meta.filter(v => v.error.length === 0).reduce((p, c) => {
                if (c.data.type === InterfacesAndEnums_1.eDataType.Number) {
                    const numericValues = c.data.values.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
                    const max = Math.max.apply(null, numericValues);
                    const min = Math.min.apply(null, numericValues);
                    p[c.data.label.trim().toLowerCase()] = { min: min, max: max };
                }
                else if (c.data.type === InterfacesAndEnums_1.eDataType.String) {
                    const stringValues = c.data.values.map((v) => v
                        .toString()
                        .trim()
                        .toLowerCase());
                    p[c.data.label.trim().toLowerCase()] = stringValues;
                }
                return p;
            }, {});
            const data = IO_1.IO.ReadJson('./src/output/', 'patient.data.raw.json');
            const ids = data.map(v => v.data['patient id'].toLowerCase().trim());
            const fieldNames = meta.filter(v => v.error.length === 0).map(v => v.data.name.trim().toLowerCase());
            const fieldLabels = meta.filter(v => v.error.length === 0).map(v => v.data.label);
            const values = data.map(datum => {
                return fieldNames.map((fieldName, i) => {
                    const lbl = fieldLabels[i];
                    const value = datum.data[fieldName.trim().toLowerCase()];
                    const f = fields[lbl.trim().toLowerCase()];
                    return f.hasOwnProperty('min') ? parseFloat(value) : f.indexOf(value);
                });
            });
            const output = {
                ids: ids,
                fields: fields,
                values: values
            };
            IO_1.IO.WriteString('patient.json', JSON.stringify(output)).then(() => {
                console.log('patient.json');
                resolve();
            });
        });
    }
    static writePatientSampleJson(uri) {
        return new Promise((resolve, reject) => {
            const data = IO_1.IO.ReadJson('./src/output/', 'sample.data.raw.json');
            const psMap = data.filter(v => v.error.length === 0).reduce((p, c) => {
                const pid = c.data['patient id'].trim().toLowerCase();
                const sid = c.data['sample id'].trim().toLowerCase();
                if (!p.hasOwnProperty(pid)) {
                    p[pid] = [];
                }
                p[pid].push(sid);
                return p;
            }, {});
            IO_1.IO.WriteString('psmap.json', JSON.stringify(psMap)).then(() => {
                console.log('psmap.json');
                resolve();
            });
        });
    }
}
exports.WriteJson = WriteJson;
//# sourceMappingURL=step4_json.js.map