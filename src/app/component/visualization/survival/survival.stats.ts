import { SurvivalConfigModel } from './survival.model';
//import * as JStat from 'jStat';
//import {pluck, transpose, last} from 'jStat';

export class SurvivalStats {

    private jStat = require('jstat');

    multiply(a, b) {
      let r = this.jStat.multiply(a, b.length ? (b[0].length ? b[0][0] : b[0]  ) : b);
      return r.length ? r : [
          [r]
      ];
    }

    transpose(a) {
      let r = this.jStat.transpose(a);
      return r[0].length ? r : [r];
    }

    // Create our own pluck, since jStat.pluck seems unavailable. MJ
    // e.g. myPluck.pluck(groups, 'tte')
    myPluck(array:Array<any>, key:string){
      return array.map(o => o[key]);
    }
    myLast(a:Array<any>) {
      return a.slice(-1)[0] ;
    }

    timeTable(tte, ev) {
      let self = this;
      let exits = tte.map(function(x, i) { return { tte: x, ev: ev[i] }; });
      exits.sort((a, b) => a.tte - b.tte);// sort by tte and collate
      let uexits = self.jStat.unique(this.myPluck(exits, 'tte'), true); // unique tte
      
      let gexits = exits.reduce(function (obj, entry) {
        var tteVal = entry.tte
        if (!obj.hasOwnProperty(tteVal)) {
          obj[tteVal] = [];
        }
        obj[tteVal].push(entry);
        return obj;
      
      }, {});
      return uexits.reduce(function(a, tte) { // compute d_i, n_i for times t_i (including censor times)
        let group = gexits[tte],
              l = self.myLast(a) || { n: exits.length, e: 0 },
              events = group.filter(function(x) { return x.ev; });

          a.push({
              n: l.n - l.e, // at risk
              e: group.length, // number exiting
              d: events.length, // number events (death)
              t: group[0].tte // time
          });
          return a;
      }, []);
    }

    compute(tte, ev) {
      let self = this;
        let dini = self.timeTable(tte, ev);
        return dini.reduce(function(a, dn) { // survival at each t_i (including censor times)
            let l = self.myLast(a) || { s: 1 };
            if (dn.d) { // there were events at this t_i
                a.push({ t: dn.t, e: true, s: l.s * (1 - dn.d / dn.n), n: dn.n, d: dn.d, rate: dn.d / dn.n });
            } else { // only censors
                a.push({ t: dn.t, e: false, s: l.s, n: dn.n, d: dn.d, rate: null });
            }
            return a;
        }, []);
    }

    expectedObservedEventNumber(si, tte, ev) {
        let data = this.timeTable(tte, ev),
            expectedNumber,
            observedNumber,
            dataByTimeTable = [];

        si = si.filter(function(item) { return item.e; });

        expectedNumber = si.reduce(function(memo, item) {
          // TEMPNOTE: This uses the deprecated jStat.find: let pointerInData = jStat.find(data, function(x) { return (x.t >= item.t); });
          let pointerInData = data.find(function(x) { return (x.t >= item.t); });

            if (pointerInData) {
                let expected = pointerInData.n * item.rate;
                dataByTimeTable.push(pointerInData);
                return memo + expected;
            } else {
                return memo;
            }

        }, 0);

        observedNumber = ev.filter(function(x) { return x; }).length;

        return {
            expected: expectedNumber,
            observed: observedNumber,
            dataByTimeTable: dataByTimeTable,
            timeNumber: dataByTimeTable.length
        };
    }

    covariance(allGroupsRes, OETable) {
        let vv = this.jStat.zeros(OETable.length),
            i, j, //groups
            t, //timeIndex
            N, //total number of samples
            Ki, Kj, // at risk number from each group
            n; //total observed

        for (i = 0; i < OETable.length; i++) {
            for (j = i; j < OETable.length; j++) {
                for (t = 0; t < allGroupsRes.length; t++) {
                    N = allGroupsRes[t].n;
                    n = allGroupsRes[t].d;
                    if (t < OETable[i].timeNumber && t < OETable[j].timeNumber) {
                        Ki = OETable[i].dataByTimeTable[t].n;
                        Kj = OETable[j].dataByTimeTable[t].n;
                        // when N==1: only 1 subject, no variance
                        if (i !== j && N !== 1) {
                            vv[i][j] -= n * Ki * Kj * (N - n) / (N * N * (N - 1));
                            vv[j][i] = vv[i][j];
                        } else if (N !== 1) { // i==j
                            vv[i][i] += n * Ki * (N - Ki) * (N - n) / (N * N * (N - 1));
                        }
                    }
                }
            }
        }
        return vv;
    }

    // This might be the mis-named. 
    solve(a, b) {
      let bT = this.transpose(b);
      let aInv = this.jStat.inv(a);
      let bMultaInv = this.multiply(b, aInv);
      let result = this.multiply(bMultaInv, bT);
      if(result == null) {
        console.error('null result in logrank solve.');
        return [[0]];
      }
      return [[result]];  // MJ was just return result
    }

    allGroupsKm(groups) {
        let tte = [].concat.apply([], this.myPluck(groups, 'tte')),
            ev = [].concat.apply([], this.myPluck(groups, 'ev'));
        return this.compute(tte, ev).filter(function(t) { return t.e; });
    }

    // allGroupsRes: km of all groups combined?
    // groupedDataTable: [{tte, ev}, ...]
    logranktest(groupedDataTable) {
        let self = this;
        if(groupedDataTable == null) {
          // console.log('MJ logranktest null check');
          return;
        }
        let allGroupsRes = this.allGroupsKm(groupedDataTable),
            pValue = 1,
            KMStats,
            dof, // degree of freedom
            OETable,
            OMinusEVector, // O-E
            vv; //covariant matrix

        // Table of observed and expected events, for each group.
        OETable = groupedDataTable
            .map(function(v) { return self.expectedObservedEventNumber(allGroupsRes, v.tte, v.ev); })
            .filter(function(r) { return r.expected; });

        // Find O-E and covariance, and drop one dimension from each
        OMinusEVector = OETable.map(function(r) { return r.observed - r.expected; }).slice(1);
        let theCovariance = this.covariance(allGroupsRes, OETable);
        vv = theCovariance.slice(1).map(function(r) { return r.slice(1); }); // drop 1st row & 1st column

        dof = OETable.length - 1;

        if (dof > 0) {
            KMStats = this.solve(vv, OMinusEVector)[0][0];   //MJ i used to wrap minusvecotr in []
            pValue = 1 - self.jStat.chisquare.cdf(KMStats, dof);
        }

        return {
            originalCohorts: groupedDataTable.map(g => g.name),
            dof: dof,
            KMStats: KMStats,
            pValue: pValue
        };
    }


}
