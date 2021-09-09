import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { scaleSequential } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as _ from 'lodash';
import { Legend } from './../../../model/legend.model';
import { TimelinesConfigModel } from './timelines.model';



export const timelinesCompute = (config: TimelinesConfigModel, worker: DedicatedWorkerGlobalScope): void => {
    if(config.reuseLastComputation) {
        worker.postMessage({config: config, data: {cmd:'reuse'}});
        return;
      }
      
    
    const colorToHex = function (col): number {
        if (col.substr(0, 1) === '#') {
            return col;
        }
        const digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(col);
        const red = parseInt(digits[2], 10);
        const green = parseInt(digits[3], 10);
        const blue = parseInt(digits[4], 10);
        const rgb = blue | (green << 8) | (red << 16);
        return rgb;
    };

    // From https://stackoverflow.com/users/1765658/f-hauri , 
    // in https://stackoverflow.com/questions/11068240/what-is-the-most-efficient-way-to-parse-a-css-color-in-javascript.
    // MJ
    const parseColor = function (input) {
        if (input.substr(0,1)=="#") {
            var collen=(input.length-1)/3;
            var fact=[17,1,0.062272][collen-1];
            let rgb = [
                Math.round(parseInt(input.substr(1,collen),16)*fact),
                Math.round(parseInt(input.substr(1+collen,collen),16)*fact),
                Math.round(parseInt(input.substr(1+2*collen,collen),16)*fact)
            ];
            let rgbInt:number = ( rgb[0] <<16)|( rgb[1] <<8)|( rgb[2] );

            return rgbInt;
        }
        else {
            let rgb = input.split("(")[1].split(")")[0].split(",").map(Math.round);
            let rgbInt:number = ( rgb[0] <<16)|( rgb[1] <<8)|( rgb[2] );
            return rgbInt;
        }
    }

    const eventColorWithOverride = function(eventName:string, barLayout: any, defaultColor:any)  {
      if (eventName == null || eventName.trim() == '') { return defaultColor;}
      if (barLayout['subtypeColors'] && barLayout['subtypeColors'][eventName]) {
        let colorText = barLayout['subtypeColors'][eventName];
        let color = parseColor(colorText);
        return color;
      } else {
        return defaultColor;
      }
    }

    const colors = [
        [   // Blues
            0x1A237E,
            0x27358B,
            0x344899,
            0x415AA7,
            0x4E6DB4,
            0x5B7FC2,
            0x6892D0,
            0x75A4DD,
            0x82B7EB,
            0x90CAF9
        ],  // Start Stop Restart
        [   // Greens
            0x1B5E20,
            0x2B6B2A,
            0x3B7835,
            0x4C8540,
            0x5C924B,
            0x6CA055,
            0x7DAD60,
            0x8DBA6B,
            0x9DC776
        ],
        [   // Oranges
            0xE65100,
            0xE85D00,
            0xEB6901,
            0xEE7602,
            0xF18203,
            0xF38F03,
            0xF69B04,
            0xF9A805,
            0xFCB406,
            0xFFC107,
        ],  // Death Stuff
        [
            0xB71C1C,
            0xB7242F,
            0xB72C42,
            0xB83555,
            0xB83D68,
            0xB8467B,
            0xB94E8E,
            0xB957A1,
            0xB95FB4,
            0xBA68C8
        ]
    ];

    const getPatientInfo = function (db: string, tbl: string): Promise<any> {
        return worker.util.getPatients([], db, tbl);
    };

    // if (config.dirtyFlag & DirtyEnum.OPTIONS) {
    //     worker.postMessage({
    //         config: config,
    //         data: {}
    //     });
    // }

    let listOfSetAliases = {};
    let setAliasesDoExist:boolean = false;
    config.bars.map(function(b){
        if(b['setAliases']) {
            Object.assign(listOfSetAliases, b['setAliases']);
            setAliasesDoExist = true;
        }
    })
    console.log(`*** listOfSetAliases = ${JSON.stringify(listOfSetAliases)}`);
    
    // if (config.dirtyFlag & DirtyEnum.LAYOUT) {
    Promise.all([
        worker.util.getEvents(config.database, config.patientFilter),
        worker.util.getPatients([], config.database, 'patient')
    ]).then(result => {

        let eventData = result[0];
        const patientData = result[1];

        eventData.forEach((v, i) => {
            v.originalStart = v.start;
            v.originalEnd = v.end;
            v.originalIndex = i;
        });

        // Align
        if (config.align !== 'None') {
            const align = eventData.filter(v => {
                    let match = v.subtype && (v.subtype.toUpperCase() === config.align.label.toUpperCase());
                    let thisSetAlias:string = listOfSetAliases[config.align.label];
                    if (match == false && setAliasesDoExist && thisSetAlias) {
                        let pipeWrappedSet:string = `|${thisSetAlias}|`;
                        match = pipeWrappedSet.toUpperCase().includes(`|${v.subtype.toUpperCase()}|`);
                    }
                    return match;
                })
                .reduce((p, c) => {
                    if (p.hasOwnProperty(c.p)) {
                        if (p[c.p] > c.start) { p[c.p] = c.start; }
                    } else {
                        p[c.p] = c.start;
                    }
                    return p;
                }, {});
            eventData = eventData.filter(v => align.hasOwnProperty(v.p));
            eventData.forEach(v => {
                v.start -= align[v.p];
                v.end -= align[v.p];
            });
        }

        // Filter Events
        const events = Array.from(config.bars
            .reduce((p, c) => { if (c.events !== null) { c.events.forEach(v => p.add(v.toString())); } return p; }, new Set()))
            .map(v => v.toString().toLowerCase());
        eventData = eventData.filter(v => v.subtype && (events.indexOf(v.subtype.toLowerCase()) !== -1));


        const colorRanges = [
            ['rgb(233,30,99)', 'rgb(74,20,140)'],
            ['rgb(255,213,79)', 'rgb(230,81,0)'],
            ['rgb(165,214,167)', 'rgb(27,94,32)'],
            ['rgb(51,153,255)', 'rgb(0,0,204)'],
            ['rgb(214,183,0)', 'rgb(143,92,51)']
        ];

        // Created with colorbrewer2.org, using Qualitative, 8-classes.
        const brewerColorsQualitative:Array<Array<number>> = [
          [0x7fc97f,0xbeaed4,0xfdc086,0x386cb0,0xf0027f,0xbf5b17,0x666666], // 0xffff99 taken out of the fourth spot; the yellow is too pale.
          [0x1b9e77,0xd95f02,0x7570b3,0xe7298a,0x66a61e,0xe6ab02,0xa6761d,0x666666],
          [0xa6cee3,0x1f78b4,0xb2df8a,0x33a02c,0xfb9a99,0xe31a1c,0xfdbf6f,0xff7f00],
          [0xfbb4ae,0xb3cde3,0xccebc5,0xdecbe4,0xfed9a6,0xffffcc,0xe5d8bd,0xfddaec]
        ]

        const allBrewerQual:Array<number> = [].concat(...brewerColorsQualitative);
        const copiedAllBrewerQual = allBrewerQual; // TEMPNOTE: could make copies, like [].concat(allBrewerQual, allBrewerQual, allBrewerQual);
        let allBrewerIndex = 0;
        if (config.firmColors == null) {
            config.firmColors = {};
        }

        const colorMap = config.bars.map((configBar, i) => {
            let result = {};
            if(configBar.events){
                let rangeIndexToUse = i >= colorRanges.length ? 0 : i; // Hack to avoid running out of color ranges. Really we could create new ranges. MJ
                let cols = Array(configBar.events.length).fill(0); // Get us enough blacks, to start with.
                let useQualitative:boolean = true;
                if (useQualitative) {
                let brewersToCopy = Math.min(cols.length, copiedAllBrewerQual.length - (1+allBrewerIndex));
                if (brewersToCopy > 0) {
                    let brewersToUse = copiedAllBrewerQual.slice(allBrewerIndex, allBrewerIndex + brewersToCopy);
                    cols.splice(0, brewersToCopy, ...brewersToUse); // replacement
                    allBrewerIndex = allBrewerIndex + brewersToCopy;
                }
                } else {
                cols = worker.util.interpolateColors(colorRanges[rangeIndexToUse][0], colorRanges[rangeIndexToUse][1], configBar.events.length, true);
                }

                result=  configBar.events.reduce((colorMap, eventName, j) => {
                    // p[c] = colors[i][j];
                    let eventnameLowercase:string = eventName.toLowerCase();
                    let defaultColorForThisEvent = cols[j];
                    // Process any color overrides, from the meta files.
                    let colorToUse = eventColorWithOverride(eventnameLowercase, configBar, defaultColorForThisEvent);
                    if (config.firmColors[eventnameLowercase] == null) {
                        config.firmColors[eventnameLowercase] = colorToUse;
                    }
                    colorMap[eventnameLowercase] = config.firmColors[eventnameLowercase];
                    return colorMap;
                }, {});
            }
            return result;
        }).reduce((p, c) => Object.assign(p, c), {});

        // Associate Bar + Color To Event
        eventData = eventData.map((v) => {
            return Object.assign(v, { 'color': colorMap[v.subtype.toLowerCase()] });
        });

        // Build Legend
        let legends = config.bars.filter(v => v.style !== 'None' && v.events != null).map(v => {
            const rv = new Legend();
            rv.name = 'ROW // ' + (v.label ? v.label.toUpperCase() : "");
            rv.type = 'COLOR';
            rv.display = 'DISCRETE';
            rv.labels = v.events;
            rv.values = rv.labels.map(w => colorMap[w.toLowerCase()]);
            return rv;
        });

        // Group And Execute Sort
        let patients: any;
        patients = _.groupBy(eventData, 'p');
        if (config.group.label !== 'None') {
            patientData.forEach(patient => {
                if (patients.hasOwnProperty(patient.p)) {
                    patients[patient.p]['group'] = patient[config.group.label];
                }
            });
        }

        if (config.sort.label !== 'None') {
            if (config.sort && config.sort['type'] === 'patient') {
                patientData.forEach(patient => {
                    if (patients.hasOwnProperty(patient.p)) {
                        patients[patient.p].sort = patient[config.sort['key']];
                    }
                });
            } else {
                // sort by "event" type
//                let eventLabel:string = config.sort.label ? config.sort.label : config.sort;// latter case is 'Any Event'
                Object.keys(patients).forEach(pid => {
                    const patient:Array<any> = patients[pid]; // patient is array of (some) events for that patient.
                    const matchingEvents = patient.filter(v => config.sort.label == 'Any Event' || (v.subtype && v.subtype.toLowerCase() === config.sort.label));
                    if(matchingEvents.length > 0){
                        // Find the 
                        switch (config.sortComparison) {
                            case 'First StartDate':
                              matchingEvents.sort((a,b)=> a.start < b.start ? -1 : (a.start > b.start ? 1 : 0));
                              patient.sort = matchingEvents[0].start;
                              break;
                            case 'First EndDate':
                              matchingEvents.sort((a,b)=> a.end < b.end ? -1 : (a.end > b.end ? 1 : 0));
                              patient.sort = matchingEvents[0].end;
                              break;
                            default:
                                // use a custom sortField from event tables, like "bestresponsevalue".
                                // It will either be "First bestresponsevalue", "Last bestresponsevalue", or "Largest bestresponsevalue".
                                let firstLastLargestCode:string = config.sortComparison.substr(0, config.sortComparison.indexOf(' ')); // "First"
                                let justComparisonName:string = config.sortComparison.substr(config.sortComparison.indexOf(' ')+1); // "bestresponsevalue", or "two words"
                                switch (firstLastLargestCode){
                                    case 'First':
                                        matchingEvents.sort((a,b)=> a.start < b.start ? -1 : (a.start > b.start ? 1 : 0));
                                        patient.sort = matchingEvents[0].data[config.sortComparison];
                                        break;
                                    case 'Last':
                                        matchingEvents.sort((a,b)=> a.start < b.start ? -1 : (a.start > b.start ? 1 : 0));
                                        patient.sort = matchingEvents[matchingEvents.length-1].data[config.sortComparison];
                                        break;
                                    case 'Largest':
                                        matchingEvents.sort((a,b)=> {
                                            let aVal = a.data[justComparisonName];
                                            let bVal = b.data[justComparisonName];
                                            if(aVal && bVal) {
                                                // bigger values should come first (comparison returns -1).
                                                return aVal > bVal ? -1 : (aVal < bVal ? 1 : 0);
                                            } else {
                                                return 0;
                                            }
                                        });
                                        patient.sort = matchingEvents[0].data[justComparisonName];
                                        break;
                                }
                                break;
                        }
                    }

                });
            }
        }

        patients = Object.keys(patients).map(key => ({
            sort: patients[key].hasOwnProperty('sort') ? patients[key].sort : null,
            group: patients[key].hasOwnProperty('group') ? patients[key]['group'] : null,
            events: patients[key]
        }));
        if (config.sort.label !== 'None') {
            // patients = patients.filter(p => p.sort !== null);

            patients.sort((a,b)=> a.sort < b.sort ? -1 : (a.sort > b.sort ? 1 : 0));
            // why does sorting need to be reversed here?
            patients = patients.reverse();
        }
        if (config.group.label !== 'None') {
            // patients = patients.filter(p => p.group !== null);
            patients = _.groupBy(patients, 'group');
            patients = Object.keys(patients).reduce((p, c) => p.concat(patients[c]), []);
        }
        patients = patients.map(patient => patient.events);

        // Determine Min + Max "Dates"
        const minMax = eventData.reduce((p, c) => {
            p.min = Math.min(p.min, c.start);
            p.max = Math.max(p.max, c.end);
            return p;
        }, { min: Infinity, max: -Infinity });

        // Get Heatmap Stuff
        if (config.attrs !== undefined) {

            const pas = worker.util.getPatientAttributeSummary(config.patientFilter, config.attrs, config.database);
            pas.then(attrs => {

                legends = legends.concat(attrs.attrs.map(attr => {
                    if (attr.hasOwnProperty('min')) {
                        const scale = scaleSequential<string>(interpolateSpectral).domain([attr.min, attr.max]);
                        const legend: Legend = new Legend();
                        legend.name = 'HEATMAP // ' + attr.prop.replace(/_/gi, ' ');
                        legend.type = 'COLOR';
                        legend.display = 'CONTINUOUS';
                        const attr50th:number = ((attr.max-attr.min)/2)+attr.min;
                        const attr25th:number = ((attr50th-attr.min)/2)+attr.min;
                        const attr75th:number = ((attr.max-attr50th)/2)+attr50th;
                        
                        legend.labels = [attr.min, attr25th, attr50th, attr75th, attr.max].map(val => Math.round(val).toString());
                        legend.values = [
                            colorToHex(scale(attr.min)),
                            colorToHex(scale(attr25th)),
                            colorToHex(scale(attr50th)),
                            colorToHex(scale(attr75th)),
                            colorToHex(scale(attr.max))
                        ];  // [0xFF0000, 0xFF0000];
                        attr.values = attr.values.map(v => {
                            return { label: v, color: colorToHex(scale(v)) };
                        });
                        return legend;
                    } else {
                        const cm = attr.set.reduce((p, c, i) => {
                            p[c] = worker.util.colors[i];
                            return p;
                        }, {});
                        const legend: Legend = new Legend();
                        legend.name = 'HEATMAP // ' + attr.prop.replace(/_/gi, ' ').toUpperCase();
                        legend.type = 'COLOR';
                        legend.display = 'DISCRETE';
                        legend.labels = Object.keys(cm);
                        legend.values = Object.keys(cm).map(key => cm[key]);
                        attr.values = attr.values.map(v => ({ label: v, color: cm[v] }));
                        return legend;
                    }
                }));
                worker.postMessage({
                    config: config,
                    data: {
                        computedFeedbackForForm: {
                            firmColors: config.firmColors
                        },
                        legends: legends,
                        result: {
                            minMax: minMax,
                            patients: patients,
                            attrs: attrs
                        }
                    }
                });
                worker.postMessage('TERMINATE');
            });
        } else {
            console.log(`TEMPNOTE: sending config back from timeline compute ==> ${JSON.stringify(config)}`);
            worker.postMessage({
                config: config,
                data: {
                    computedFeedbackForForm: {
                        firmColors: config.firmColors
                    },
                    legends: legends,
                    result: {
                        minMax: minMax,
                        patients: patients,
                        attrs: null
                    }
                }
            });
            worker.postMessage('TERMINATE');
        }
    });
    // }
};
