import { DedicatedWorkerGlobalScope } from 'app/service/dedicated-worker-global-scope';
import { Legend } from './../../../model/legend.model';
import { SurvivalConfigModel } from './survival.model';
export const survivalCompute = (config: SurvivalConfigModel, worker: DedicatedWorkerGlobalScope): void => {
    if(config.reuseLastComputation) {
        worker.postMessage({config: config, data: {cmd:'reuse'}});
        return;
    }
      
    worker.util.TryLogging('MJ At start of survival.compute.ts.', worker);

    const colors = [0x42a5f5, 0x66bb6a, 0xff9800, 0x795548, 0x673ab7, 0xe91e63];
    const getRange = (pointCollections: Array<any>): Array<any> => {
        const dx = [Infinity, -Infinity];
        const dy = [Infinity, -Infinity];
        pointCollections.forEach(pointCollection => {
            pointCollection.forEach(point => {
                dx[0] = Math.min(dx[0], point[0]);
                dx[1] = Math.max(dx[1], point[0]);
                dy[0] = Math.min(dy[0], point[1]);
                dy[1] = Math.max(dy[1], point[1]);
            });
        });
        return [dx, dy];
    };

    const formatResult = (data: any, property: string): Array<any> => {
        return Object.keys(data[property])
            .map(v => [parseFloat(v), data[property][v]])
            .sort((a, b) => a[0] - b[0]);
    };

    const processSurvival = (result: any): any => {
        const line = formatResult(result.result, 'KM_estimate');
        const upper = formatResult(result.confidence, 'KM_estimate_upper_0.95');
        const lower = formatResult(result.confidence, 'KM_estimate_lower_0.95');
        const range = getRange([line, upper, lower]);
        return {
            line: line,
            upper: upper,
            lower: lower,
            range: range
        };
    };


    const cohortNames = Array.from(new Set([...config.cohortsToCompare, config.cohortName]));

    Promise.all([
        worker.util.getCohorts(config.database, cohortNames),
        worker.util.getPatients([], config.database, 'patient')
    ]).then(results => {

        // TODO: Fix Setting Time To 1 When null
        const cohorts = results[0];
        const allPatients = results[1];

        const isPatientDead = (v) => {
            return v.vital_status ==='dead'
            || v.vital_status === '1'
            || v.os_status ==='DECEASED'
            || v.os_status ==='deceased';
        };

        // Clinical data harmonization: Support GDC/TCGA  and cBioPortal fields.
        // See https://wiki.fhcrc.org/display/ON/Clinical+Data+Harmonization -MJ

        const patientHasSurvivalData = (v) => {
            let hasTcgaSurvival:boolean =
            v['vital_status'] &&
            (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup']);
            

            let hasCbioportalSurvival:boolean =
            v['os_status'] &&
            v['os_months'];

            return hasTcgaSurvival || hasCbioportalSurvival;
        }

        const patients = allPatients.filter(p => patientHasSurvivalData(p));

        const survivalTime = (v) => {
            if (
                v['vital_status'] &&
                (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup'])) {
                // Use GDC/TCGA fields
                if (isPatientDead(v)) {
                    return v['days_to_death'];  
                } else {
                    return (v['days_to_last_follow_up'] === undefined
                    ? v['days_to_last_followup']
                    : v['days_to_last_follow_up']);

                }
            } else {
                if (
                v['os_status'] &&
                v['os_months']) {
                    // Use cBioPortal fields
                    return v['os_months'];
                } else {
                    // Neither GDC/TCGA nor cBioPOrtal fields are valid, treat as missing.
                    return -1;
                }
            }


        }

        // Extract Events And Times From Patient Data
        const e = patients.map(v => isPatientDead(v) ? 1 : 0);
        // const t = patients.map(v => isPatientDead(v) ?
        //     v.days_to_death : (v.days_to_last_follow_up === undefined) ? 1234 : v.days_to_last_follow_up) // MJ !!!!! 1234 is placeholder. It was "v.days_to_last_followup" but that makes no sense. if it's not defined ,we use it anyway?? Ask Michael
        //     .map(v => (v === null) ? 1 : Math.max(1, v));
        const t = patients.map(v => survivalTime(v))
         .map(v => (v === null) ? 1 : Math.max(1, v));
        const p = patients.map((v, i) => ({ p: v.p, e: e[i], t: t[i] }));

        const promises = [];
        const cohortPatientData = [];
        if (cohortNames.indexOf('All Patients') !== -1) {
            promises.push(
                worker.util.fetchResult({
                    method: 'survival_ll_kaplan_meier',
                    times: t,
                    events: e
                })
            );
            cohortPatientData.push({
                name: 'All',
                patients: p
            });
        }

        cohorts.forEach(cohort => {
            const cohortSet = new Set(cohort.pids);
            const cohortPatients = p.filter(v => cohortSet.has(v.p));
            const cohortEvents = cohortPatients.map(v => v.e);
            const cohortTimes = cohortPatients.map(v => v.t);
            cohortPatientData.push({
                name: cohort.n,
                patients: cohortPatients
            });
            promises.push(
                worker.util.fetchResult({
                    method: 'survival_ll_kaplan_meier',
                    times: cohortTimes,
                    events: cohortEvents
                })
            );
        });
        Promise.all(promises).then(survivalData => {
        // See if we have an error, instead of an array of results.
        if(survivalData.length == 1 && (typeof survivalData[0] == 'string')) {
            console.log(`TEMPNOTE: survival compute error... ${survivalData[0]}.`);
            //throw new Error(survivalData[0]);
            return worker.util.postCpuErrorManual(`Survival compute error - ${survivalData[0]}`, worker, 'survival_ll_kaplan_meier');            
        } else {
                const survivalResults = [];
                survivalData.forEach((result, i) => {
                    survivalResults.push(
                        Object.assign(
                            processSurvival(survivalData[i]),
                            cohortPatientData[i],
                            { color: colors[i] }
                        )
                    );
                });

                const legends: Array<Legend> = [
                    Legend.create( null,
                        'Cohorts',
                        survivalResults.map(v => v.name),
                        survivalResults.map(v => '#' + (0xffffff + v.color + 1).toString(16).substr(1)),
                        'COLOR', 'DISCRETE')
                ];

                worker.postMessage({
                    config: config,
                    data: {
                        legends: legends,
                        result: {
                            survival: survivalResults,
                            cohorts: cohortPatientData
                        }
                    }
                });
                worker.postMessage('TERMINATE');
            }
        })
        .catch(err => {
          console.log(`TEMPNOTE: CAUGHT survival compute error... ${err}.`);
          worker.postMessage({
            config: config,
            error: err
          });
          worker.postMessage('TERMINATE');
        });
    });
};
