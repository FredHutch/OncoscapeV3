import { EdgeConfigModel } from './../component/visualization/edges/edges.model';
import { interpolateRdBu, interpolateSpectral } from 'd3-scale-chromatic';
import { DedicatedWorkerGlobalScope } from 'compute';
import { scaleLinear, InterpolatorFactory, scaleSequential, scaleQuantize, scaleQuantile } from 'd3-scale';
import { interpolateRgb, interpolateHcl } from 'd3-interpolate';
import { rgb } from 'd3-color';
import { GraphConfig } from './../model/graph-config.model';
import { Legend } from './../model/legend.model';
import { DataTypeEnum, ShapeEnum, EntityTypeEnum, CollectionTypeEnum, DirtyEnum } from './../model/enum.model';
import { DataField } from './../model/data-field.model';
import * as _ from 'lodash';
import * as PouchDB from 'pouchdb-browser';
import Dexie from 'dexie';
import * as uuids from 'uuid-by-string';
import * as cbor from 'cbor-js';

export class ComputeWorkerUtil {

    private dbData: Dexie;
    private dbLookup: Dexie;

    private sizes = [1, 2, 3, 4];
    private shapes = [ShapeEnum.CIRCLE, ShapeEnum.SQUARE, ShapeEnum.TRIANGLE, ShapeEnum.CONE];
    private colors = [0x039BE5, 0x4A148C, 0x880E4F, 0x0D47A1, 0x00B8D4,
        0xAA00FF, 0x6200EA, 0x304FFE, 0x2196F3, 0x0091EA,
        0x00B8D4, 0x00BFA5, 0x64DD17, 0xAEEA00, 0xFFD600, 0xFFAB00, 0xFF6D00, 0xDD2C00,
        0x5D4037, 0x455A64];

    constructor() {
        console.log("OPTIMIZE - LATE OPEN");
        this.dbData = new Dexie('notitia-dataset');
        this.dbLookup = new Dexie('notitia');
    }
    generateCacheKey(config: Object): string {
        
        const keys = Object.keys(config).filter( v => {
            switch (v) {
                case 'dirtyFlag':
                case 'visualization':
                case 'graph':
                case 'sampleSelect':
                case 'markerSelect':
                case 'pointColor':
                case 'pointShape':
                case 'pointSize':
                case 'pointIntersect':
                    return false;
            }
            return true;
        });
        const str = keys.reduce( (p, c) => {
            p += JSON.stringify(config[c]);
            return p;
        }, '');
        const uuid = uuids(str);
        return uuid;
    }

    processShapeColorSizeIntersect(config: GraphConfig, worker: DedicatedWorkerGlobalScope) {

        if ((config.dirtyFlag & DirtyEnum.COLOR) > 0) {
            worker.util.getColorMap([], [], config.pointColor).then(
                result => {
                    worker.postMessage({
                        config: config,
                        data: {
                            legendColor: result.legend,
                            pointColor: result.map
                        }
                    });
                    worker.postMessage('TERMINATE');
                }
            );
        }

        if ((config.dirtyFlag & DirtyEnum.SIZE) > 0) {
            worker.util.getSizeMap([], [], config.pointSize).then(
                result => {
                    worker.postMessage({
                        config: config,
                        data: {
                            legendSize: result.legend,
                            pointSize: result.map
                        }
                    });
                    worker.postMessage('TERMINATE');
                }
            );
        }

        if ((config.dirtyFlag & DirtyEnum.SHAPE) > 0) {
            worker.util.getShapeMap([], [], config.pointShape).then(
                result => {
                    worker.postMessage({
                        config: config,
                        data: {
                            legendShape: result.legend,
                            pointShape: result.map
                        }
                    });
                    worker.postMessage('TERMINATE');
                }
            );
        }

        if ((config.dirtyFlag & DirtyEnum.INTERSECT) > 0) {
            worker.util.getIntersectMap([], [], config.pointIntersect).then(
                result => {
                    worker.postMessage({
                        config: config,
                        data: {
                            legendIntersect: result.legend,
                            pointIntersect: result.map
                        }
                    });
                }
            );
        }
    }

    getChromosomeInfo(genes: Array<string>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseLookup().then(v => {
                Promise.all([
                    this.dbLookup.table('bandcoords').toArray(),
                    this.dbLookup.table('genecoords').where('gene').anyOf(genes).toArray()
                ]).then(result => {
                    resolve(result);
                });
            });
        });
    }
    openDatabaseLookup(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.dbLookup.isOpen()) {
                resolve();
            } else {
                this.dbLookup.open().then(resolve);
            }
        });
    }
    openDatabaseData(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.dbData.isOpen()) {
                resolve();
            } else {
                this.dbData.open().then(resolve);
            }
        });
    }

    // Call IDB
    getMatrix(markers: Array<string>, samples: Array<string>, map: string, tbl: string, entity: EntityTypeEnum): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                this.dbData.table(map).toArray().then(_samples => {
                    const query = (markers.length === 0) ?
                        this.dbData.table(tbl).limit(100) :
                        this.dbData.table(tbl).where('m').anyOfIgnoreCase(markers);
                        query.toArray().then(_markers => {
                        resolve({
                            markers: _markers.map(m => m.m),
                            samples: _samples.map(s => s.s),
                            data: (entity === EntityTypeEnum.GENE) ?
                                _markers.map(marker => _samples.map(sample => marker.d[sample.i])) :
                                _samples.map(sample => _markers.map(marker => marker.d[sample.i]))
                        });
                    });
                });
            });
        });
    }

    getEdgesSampleSample(config: EdgeConfigModel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                Promise.all([
                    this.dbData.table('patient').toArray(),
                    this.dbData.table('patientSampleMap').toArray()
                ]).then(result => {
                    const patientMap = result[0].reduce((p, c) => { p[c.p] = c; return p; }, {});
                    const colorField = config.pointColor.key;
                    const intersectField = config.pointIntersect.key;
                    const edges = result[1].map(ps => {
                        const rv = { a: ps.s, b: ps.s, c: null, i: null };
                        if (patientMap.hasOwnProperty(ps.p)) {
                            const patient = patientMap[ps.p];
                            if (patient.hasOwnProperty(colorField) && colorField !== 'None') {
                                rv.c = patient[colorField];
                            }
                            if (patient.hasOwnProperty(intersectField) && intersectField !== 'None') {
                                rv.i = patient[intersectField];
                            }
                        }
                        return rv;
                    });
                    if (colorField !== 'None') {
                        const colorValues = edges.map<number>((value) => value.c);
                        const colorScale = scaleSequential<number>(interpolateSpectral)
                            .domain([Math.min(...colorValues), Math.max(...colorValues)]);
                        edges.forEach(edge => edge.c = colorScale(edge.c));
                    }
                    if (intersectField !== 'None') {
                        let bins = 0;
                        let intersectScale: any;
                        const colorValues = edges.map<number>((value) => value.i);
                        switch (config.pointIntersect.type) {
                            case DataTypeEnum.STRING:
                                bins = config.pointIntersect.values.length;
                                intersectScale = (value) => config.pointIntersect.values.indexOf(value) + 1;
                                break;
                            case DataTypeEnum.NUMBER:
                                bins = 6;
                                intersectScale = scaleQuantile<number>()
                                    .domain([Math.min(...colorValues), Math.max(...colorValues)])
                                    .range([1, 2, 3, 4, 5, 6]);
                                break;
                        }
                        edges.forEach(edge => edge.i = intersectScale(edge.i));
                    }
                    resolve(edges);
                });
            });
        });
    }

    getEdgesGeneGene(config: EdgeConfigModel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                Promise.all([
                    this.dbData.table('patient').toArray(),
                    this.dbData.table('patientSampleMap').toArray()
                ]).then(result => {
                    const patientMap = result[0].reduce((p, c) => { p[c.p] = c; return p; }, {});
                    const colorField = config.pointColor.key;
                    const intersectField = config.pointIntersect.key;
                    const edges = result[1].map(ps => {
                        const rv = { a: ps.s, b: ps.s, c: null, i: null };
                        if (patientMap.hasOwnProperty(ps.p)) {
                            const patient = patientMap[ps.p];
                            if (patient.hasOwnProperty(colorField) && colorField !== 'None') {
                                rv.c = patient[colorField];
                            }
                            if (patient.hasOwnProperty(intersectField) && intersectField !== 'None') {
                                rv.i = patient[intersectField];
                            }
                        }
                        return rv;
                    });

                    if (colorField !== 'None') {
                        const colorValues = edges.map<number>((value) => value.c);
                        const colorScale = scaleSequential<number>(interpolateSpectral)
                            .domain([Math.min(...colorValues), Math.max(...colorValues)]);
                        edges.forEach(edge => edge.c = colorScale(edge.c));
                    }
                    if (intersectField !== 'None') {
                        let bins = 0;
                        let intersectScale: any;
                        const colorValues = edges.map<number>((value) => value.i);
                        switch (config.pointIntersect.type) {
                            case DataTypeEnum.STRING:
                                bins = config.pointIntersect.values.length;
                                intersectScale = (value) => config.pointIntersect.values.indexOf(value) + 1;
                                break;
                            case DataTypeEnum.NUMBER:
                                bins = 6;
                                intersectScale = scaleQuantile<number>()
                                    .domain([Math.min(...colorValues), Math.max(...colorValues)])
                                    .range([1, 2, 3, 4, 5, 6]);
                                break;
                        }
                        edges.forEach(edge => edge.i = intersectScale(edge.i));
                    }
                    resolve(edges);
                });
            });
        });
    }

    getEdgesGeneSample(config: EdgeConfigModel): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getMatrix([], [], 'gismutMap', 'gisticT', EntityTypeEnum.GENE)
                .then((result: any) => {
                    const edges: Array<any> = [];
                    const aIsGene = (config.entityA === EntityTypeEnum.GENE);
                    const colorField = (config.pointColor.key !== 'None');
                    const intersectField = (config.pointIntersect.key !== 'None');
                    result.data.forEach((gene, geneIndex) => gene.forEach((sample, sampleIndex) => {
                        if (sample !== 0) {
                            const rv = { a: null, b: null, c: 0x333333, i: null };
                            rv.a = aIsGene ? result['markers'][geneIndex] : result['samples'][sampleIndex];
                            rv.b = !aIsGene ? result['markers'][geneIndex] : result['samples'][sampleIndex];
                            if (intersectField) {
                                rv.i = (sample === -2) ? 1 :
                                    (sample === -1) ? 2 :
                                        (sample === 1) ? 3 :
                                            4;
                            }
                            if (colorField) {
                                rv.c = (sample === -2) ? this.colors[0] :
                                    (sample === -1) ? this.colors[1] :
                                        (sample === 1) ? this.colors[2] :
                                            this.colors[3];
                            }
                            edges.push(rv);
                        }
                    }));
                    resolve(edges);
                });
        });
    }

    getSamplePatientMap(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                this.dbData.table('patientSampleMap').toArray().then(result => {
                    resolve(result);
                });
            });
        });
    }

    getColorMap(markers: Array<string>, samples: Array<string>, field: DataField): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {

                if (field.ctype & CollectionTypeEnum.MOLECULAR) {
                    this.dbData.table('dataset').where('name').equals('gbm').first().then(dataset => {
                        // Extract Name Of Map
                        const map = dataset.tables.filter(tbl => tbl.tbl === field.tbl)[0].map;
                        // Get Samples
                        this.dbData.table(map).toArray().then(_samples => {
                            // Get Molecular Data
                            this.dbData.table(field.tbl).toArray().then(_markers => {
                                // Calc Average By Sample
                                const numMarkers = _markers.length;
                                const values = _samples
                                    .map(sample => _markers.reduce((p, c) => { p += c.d[sample.i]; return p; }, 0))
                                    .map(total => (total / numMarkers));
                                // Color Scale
                                const minMax = values.reduce((p, c) => {
                                    p.min = Math.min(p.min, c);
                                    p.max = Math.max(p.max, c);
                                    return p;
                                }, { min: Infinity, max: -Infinity });


                                const scale = scaleLinear<number, number>()
                                    .domain([minMax.min, minMax.max])
                                    .range([0, 1]);

                                // Build Map
                                const colorMap = values.reduce((p, c, i) => {
                                    p[_samples[i].s] = interpolateSpectral(scale(c));
                                    return p;
                                }, {});

                                // Build Legend
                                const legend: Legend = new Legend();
                                legend.name = field.label;
                                legend.type = 'COLOR';
                                legend.display = 'CONTINUOUS';
                                legend.labels = [minMax.min, minMax.max].map(val => val.toString());
                                legend.values = [0xFF0000, 0xFF0000];

                                // Resolve
                                resolve({ map: colorMap, legend: legend });
                            });
                        });
                    });

                } else {

                    const fieldKey = field.key;
                    if (field.type === 'STRING') {

                        const cm = field.values.reduce((p, c, i) => {
                            p[c] = this.colors[i];
                            return p;
                        }, {});

                        this.dbData.table(field.tbl).toArray().then(row => {
                            const colorMap = row.reduce((p, c) => {
                                p[c.p] = cm[c[fieldKey]];
                                return p;
                            }, {});

                            const legend: Legend = new Legend();
                            legend.name = field.label;
                            legend.type = 'COLOR';
                            legend.display = 'DISCRETE';
                            legend.labels = Object.keys(cm);
                            legend.values = Object.keys(cm).map(key => cm[key]);

                            resolve({ map: colorMap, legend: legend });
                        });

                    } else if (field.type === 'NUMBER') {

                        const scale = scaleLinear<number, number>()
                            .domain([field.values.min, field.values.max])
                            .range([0, 1]);

                        this.dbData.table(field.tbl).toArray().then(row => {
                            const colorMap = row.reduce(function (p, c) {
                                p[c.p] = interpolateSpectral(scale(c[fieldKey]));
                                return p;
                            }, {});

                            // Build Legend
                            const legend: Legend = new Legend();
                            legend.name = field.label;
                            legend.type = 'COLOR';
                            legend.display = 'CONTINUOUS';
                            legend.labels = [field.values.min, field.values.max].map(val => val.toString());
                            legend.values = [0xFF0000, 0xFF0000];

                            // Resolve
                            resolve({ map: colorMap, legend: legend });
                        });
                    }
                }
            });
        });
    }

    getSizeMap(markers: Array<string>, samples: Array<string>, field: DataField): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {

                const fieldKey = field.key;

                if (field.type === 'STRING') {
                    const cm = field.values.reduce((p, c, i) => {
                        p[c] = this.sizes[i];
                        return p;
                    }, {});
                    this.dbData.table(field.tbl).toArray().then(row => {

                        const sizeMap = row.reduce((p, c) => {
                            p[c.p] = cm[c[fieldKey]];
                            return p;
                        }, {});

                        const legend: Legend = new Legend();
                        legend.name = field.label;
                        legend.type = 'SIZE';
                        legend.display = 'DISCRETE';
                        legend.labels = Object.keys(cm);
                        legend.values = Object.keys(cm).map(key => cm[key]);

                        resolve({ map: sizeMap, legend: legend });
                    }
                    );
                } else if (field.type === 'NUMBER') {
                    const scale = scaleLinear()
                        .domain([field.values.min, field.values.max])
                        .range([1, 3]);

                    this.dbData.table(field.tbl).toArray().then(row => {
                        const sizeMap = row.reduce(function (p, c) {
                            p[c.p] = Math.round(scale(c[fieldKey]));
                            return p;
                        }, {});

                        // Build Legend
                        const legend: Legend = new Legend();
                        legend.name = field.label;
                        legend.type = 'SIZE';
                        legend.display = 'CONTINUOUS';
                        legend.labels = [field.values.min, field.values.max].map(val => val.toString());
                        legend.values = [1, 3];

                        resolve({ map: sizeMap, legend: legend });
                    });
                }
            });
        });
    }

    getIntersectMap(markers: Array<string>, samples: Array<string>, field: DataField): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                const fieldKey = field.key;
                if (field.type === 'STRING') {

                    this.dbData.table(field.tbl).toArray().then(row => {

                        const intersectMap = row.reduce((p, c) => { p[c.p] = c[fieldKey]; return p; }, {});

                        const legend: Legend = new Legend();
                        legend.name = field.label;
                        legend.type = 'INTERSECT';
                        legend.display = 'DISCRETE';
                        legend.labels = legend.values = Object
                            .keys(Object.keys(intersectMap)
                                .reduce((p, c) => {
                                    p[intersectMap[c]] = 1; return p;
                                }, {}));

                        resolve({ map: intersectMap, legend: legend });
                    }
                    );
                }
            });
        });
    }

    getShapeMap(markers: Array<string>, samples: Array<string>, field: DataField): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openDatabaseData().then(v => {
                const fieldKey = field.key;
                if (field.type === 'STRING') {
                    const cm = field.values.reduce((p, c, i) => {
                        p[c] = this.shapes[i];
                        return p;
                    }, {});
                    this.dbData.table(field.tbl).toArray().then(row => {
                        const shapeMap = row.reduce((p, c) => {
                            p[c.p] = cm[c[fieldKey]];
                            return p;
                        }, {});

                        const legend: Legend = new Legend();
                        legend.name = field.label;
                        legend.type = 'SHAPE';
                        legend.display = 'DISCRETE';
                        legend.labels = Object.keys(cm);
                        legend.values = Object.keys(cm).map(key => cm[key]);

                        resolve({ map: shapeMap, legend: legend });
                    }
                    );
                }
            });
        });
    }


    // Call Lambda
    // cbor.encode(config)
    fetchResult(config: any, cache: boolean = false): Promise<any> {
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
       // if (cache) {
            headers = Object.assign(headers, {ckey: this.generateCacheKey(config)});
        //}
        return fetch('https://0x8okrpyl3.execute-api.us-west-2.amazonaws.com/dev', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(config)
        })
        .then(res => {
            return res.json();
        });
    }

    // OLD //

    // pouchDB: any = null;
    // dataKey = '';
    // data: any = {};

    loadData = (dataKey): any => {
        return new Promise((resolve, reject) => {
            // // Only connect once
            // if (this.pouchDB === null) {
            //     this.pouchDB = new PouchDB['default']('Notitia', { adapter: 'idb' });
            // }
            // // If data key already in memory, return it...
            // if (this.dataKey === dataKey) {
            //     resolve(this.data);
            //     return;
            // }
            // this.pouchDB.get(dataKey).then(v => {
            //     this.dataKey = dataKey;
            //     this.data = v;
            //     resolve(v);
            // });
        });
    }
    processMolecularData(molecularData: any, config: GraphConfig): any {
        let matrix = molecularData.data;
        if (config.markerFilter.length > 0) {
            const genesOfInterest = molecularData.markers
                .map((v, i) => (config.markerFilter.indexOf(v) >= 0) ? { gene: v, i: i } : -1)
                .filter(v => v !== -1);
            matrix = genesOfInterest.map(v => molecularData.data[v.i]);
        }

        if (config.entity === EntityTypeEnum.SAMPLE) {
            // Transpose Array
            matrix = _.zip.apply(_, matrix);
        }
        return matrix;
    }
    createScale = (range, domain) => {
        const domainMin = domain[0];
        const domainMax = domain[1];
        const rangeMin = range[0];
        const rangeMax = range[1];
        return function scale(value) {
            return rangeMin + (rangeMax - rangeMin) * ((value - domainMin) / (domainMax - domainMin));
        };
    }

    scale3d = (data) => {
        const scale = this.createScale(
            [-300, 300],
            data.reduce((p, c) => {
                p[0] = Math.min(p[0], c[0]);
                p[0] = Math.min(p[0], c[1]);
                p[0] = Math.min(p[0], c[2]);
                p[1] = Math.max(p[1], c[0]);
                p[1] = Math.max(p[1], c[1]);
                p[1] = Math.max(p[1], c[2]);
                return p;
            }, [Infinity, -Infinity])
        );
        // Only Scale First 3 Elements Needed For Rendering
        return data.map(v => [scale(v[0]), scale(v[1]), scale(v[2])]);
    }

}



