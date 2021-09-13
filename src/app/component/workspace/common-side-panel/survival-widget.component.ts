import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  Renderer2
} from '@angular/core';
import * as d3 from 'd3';
 
import { WidgetComponent } from "./widget.component";
import * as _ from 'lodash';
import { GraphConfig } from '../../../model/graph-config.model';
import { DataDecorator } from '../../../model/data-map.model';
import { Legend } from '../../../model/legend.model';
import { DatasetDescription } from 'app/model/dataset-description.model';
import { SavedPointsWrapper } from '../../visualization/savedpoints/savedpoints.model';
import { ChartFactory } from '../chart/chart.factory';
import { DataService } from 'app/service/data.service';
import { ComputeWorkerUtil } from 'app/service/compute.worker.util';
import { ScatterSelectionLassoController } from 'app/controller/scatter/scatter.selection.lasso.controller';
import { WorkspaceComponent } from '../workspace.component';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { genomeConstants, genomeCompute } from 'app/component/visualization/genome/genome.compute';
import { CollectionTypeEnum } from 'app/model/enum.model';
import { DataTable } from '../../../model/data-field.model';
import { VisualizationView } from '../../../model/chart-view.model';
import { sample } from 'rxjs/operators';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';

@Component({
  selector: 'survival-widget',
  templateUrl: './widget.html',
  styleUrls: ['./common-side-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class SurvivalWidgetComponent extends WidgetComponent {
  constructor(
    renderer: Renderer2
  ) 
  { 
    super(renderer);
    this.model.name = "Survival";
  }

  
  data =[];
  survivalSvgMargin = ({top: 4, right: 4, bottom: 24, left: 24});
  survivalSvgHeight = 155;

  public selectedCurveWidth = "2.2";
  public unSelectedCurveWidth = "0.9";

  drawSurvivalWidget():void {
    let self = this;

    this.clearSvg();
    // //let el =   this.survivalSvgContainer.nativeElement;
    let el = document.querySelector('#svgContainer_Survival');
    let svg = d3.select(el.getElementsByTagName('svg')[0]);
    // // first remove contents
    // svg.selectAll("*").remove();


    if(this.commonSidePanelModel.datasetDescription && this.commonSidePanelModel.datasetDescription.hasSurvival) {
      this.commonSidePanelModel.dataService.getCustomCohorts(this.commonSidePanelModel.graphConfig.database).then(retrievedCustomCohorts => {
        this.commonSidePanelModel.definedCohorts =  retrievedCustomCohorts;

        Promise.all([
          //this.wutil.getCohorts(this.config.database, customCohortNames),
          this.wutil.getPatients([], this.commonSidePanelModel.graphConfig.database, 'patient')
        ]).then(results => {
          //const customcohorts = results[0];
          const allPatients = results[0];  // was 1 when we wanted to getCohorts first
          let prepInputs = self.prepareSurvivalInputs(allPatients);
          
          // p, e, t.  patientId, eventType, time.
          let allPatientTimes = prepInputs.p.map(pi => [ pi.t, pi.e]);

          self.data =    [
            // We do have to create All specially, because the getCustomCohorts call  does not return pids in "All" cohort.
            {name: "All", values: this.getBufferedEvents(allPatientTimes)}, //  this.rawEventsAll)},
          ];


          let indexOfSelectedCohort:number = null;
          // Loop throughdefinedcohorts, for each one, build set 
          // using just with patients in cohort.
          for(let thisCohort=1; thisCohort<this.commonSidePanelModel.definedCohorts.length; thisCohort++) {
            let c  = this.commonSidePanelModel.definedCohorts[thisCohort];
            if(this.commonSidePanelModel.lastSelectedDefinedCohort && c.n == this.commonSidePanelModel.lastSelectedDefinedCohort.n) {
              indexOfSelectedCohort = thisCohort;
            }
            let definedCohortDataCurveInput =   this.curveInputsFromUnsortedPids(prepInputs, c.pids);
            // that contains date, event, and pid. [0,1,2]

            // loop through all items in cohort. We know they exist in prepInputs.
            let cohortTimeEvents = [];
            for(let pidIndex =0; pidIndex < definedCohortDataCurveInput.length; pidIndex++) {
              const foundPrepValue = prepInputs.p.find(element => element.p == definedCohortDataCurveInput[pidIndex][2]);
              cohortTimeEvents.push( [foundPrepValue.t, foundPrepValue.e]);
            }
            let cohortData = {
              name: c.n,
              sourceCohort: c,
              values: this.getBufferedEvents(cohortTimeEvents)
            };
            self.data.push(cohortData);
          }

          if(self.commonSidePanelModel.selectionIds.length == 0){
            // console.log('MJ No items selected, do not add anything to data array.');
          } else {
            if(this.commonSidePanelModel.lastSelectedDefinedCohort == null) {
              let selectionDataCurveInput =   this.curveInputsFromUnsortedPids(prepInputs, self.commonSidePanelModel.selectionIds);
              let selectionDataCurve = {
                name: 'Selection',
                sourceCohort: null, 
                values: this.getBufferedEvents(selectionDataCurveInput)
              };
              self.data = self.data.concat(selectionDataCurve);
            } else {
              console.log('redraw but lastselected is defined, so do not create curve.');
            }
          }

          const line = d3.line()
          .defined(d => !isNaN(d["value"])) 
          .x(d => x(d["date"]/dateDivisor))
          .y(d => y(d["value"]));
      
          console.log('date division');
          let dateDivisor = 365;
          if(allPatients[0]['os_status']) { // Possible bug, if for some reason [0] has null here.
            dateDivisor = 12; // use months, not days
          }

          let maxDate = this.maxDateAcrossCohorts([
            self.data[0].values.map(dv => [dv.date, 1])  // turns {date, value} into [date, dummyVal]
          ]);
      
          const x = d3.scaleLinear()
          .domain([0, maxDate/dateDivisor])
          .range([this.survivalSvgMargin.left, this.commonSidePanelModel.width - this.survivalSvgMargin.right]);
      
          const y = d3.scaleLinear()
          .domain([0, 100]).nice()
          .range([this.survivalSvgHeight - this.survivalSvgMargin.bottom, this.survivalSvgMargin.top]);
      
          const xAxis = g => g
          .attr("transform", `translate(0,${this.survivalSvgHeight - this.survivalSvgMargin.bottom})`)
          .call(d3.axisBottom(x).tickFormat(xq =>  xq + " Yrs")
          .ticks(4).tickSizeOuter(0));
      
          const yAxis = g => g
          .attr("transform", `translate(${this.survivalSvgMargin.left},0)`)
          .call(d3.axisRight(y).ticks(5, "")
              .tickFormat(d =>  "")
              .tickSize(this.commonSidePanelModel.width  )
              )
          .call(g => g.selectAll(".tick:not(:first-of-type) line")
              .attr("stroke-opacity", 0.5)
              .attr("stroke-dasharray", "2,2"))
          .call(g => g.select(".domain").remove())
          .call(g => g.select(".tick:last-of-type text").clone()
              .attr("x", 3)
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text(this.data["y"]));


          const addCurve = (item, index) =>{
            // item.name holds the cohort name, FWIW
            let self = this;
            let curveIsSelected:boolean = (index == indexOfSelectedCohort);
            if(item.name == 'Selection' && indexOfSelectedCohort == null) {
              curveIsSelected = true;
            }
            if(item.name == 'All' && index == 0 && indexOfSelectedCohort == null) {
              // If none is selected AND Selection doesn't exist, then highlight All Patients.
              if(self.commonSidePanelModel.selectionIds.length == 0) {
                curveIsSelected = true;
              }
            }

            // let itemValuesScaledtoYears = item.values.map( v => {
            //   return { date: v.date/dateDivisor, value: v.value}
            // });

            this.svgD3Selection.append("path")
                .datum(item.values)
                .attr("fill", "none")
                .attr("stroke", this.commonSidePanelModel.cohortColors[index])
                .attr("sourceCohort", item.sourceCohort)
                .attr("curveIndex", index)
                .attr("class", "km-curve")
                .attr("stroke-width", curveIsSelected ? this.selectedCurveWidth : this.unSelectedCurveWidth)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line);
          }

        
          let hidingRect = svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("id", "hidingRect"  )
            .on("click", function(){
              console.log('hiding rect clicked.');
              d3.select('#hidingRect').style("opacity", 0);
            });
          
          svg.append("g")
              .call(xAxis);
    
          svg.append("g")
              .call(yAxis);
    
          for(let i=0; i< this.data.length; i++) {
            addCurve(this.data[i], i);
          }


          
        });
        
      });
      
    }
    return null;
  }


  public prepareSurvivalInputs   = (allPatients) => {
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
        (v['vital_status'].toString().toLowerCase != "unknown") &&
        (v['vital_status'].toString().toLowerCase != "") &&
        (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup']);
        

        let hasCbioportalSurvival:boolean =
        v['os_status'] &&
        (v['os_status'].toString().toLowerCase != "unknown") &&
        (v['os_status'].toString().toLowerCase != "") &&
        v['os_months'];

        return hasTcgaSurvival || hasCbioportalSurvival;
    }

    const patients = allPatients.filter(p => patientHasSurvivalData(p));

    const survivalTime = (v) => {
        if (
            v['vital_status'] &&
            (v['days_to_death'] || v['days_to_last_follow_up'] || v['days_to_last_followup'])) {
            // Use GDC/TCGA fields
            let lastFollowUp = v['days_to_last_follow_up'] === undefined
            ? v['days_to_last_followup']
            : v['days_to_last_follow_up']

            let survivalTime = Math.max(v['days_to_death'], lastFollowUp);
            if(survivalTime == null) {
              console.error('Error, survivalTime should not be null');
            }
            return survivalTime;
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
    let e = patients.map(v => isPatientDead(v) ? 1 : 2);  // was 1 : 0
    // const t = patients.map(v => isPatientDead(v) ?
    //     v.days_to_death : (v.days_to_last_follow_up === undefined) ? 1234 : v.days_to_last_follow_up) // MJ !!!!! 1234 is placeholder. It was "v.days_to_last_followup" but that makes no sense. if it's not defined ,we use it anyway?? Ask Michael
    //     .map(v => (v === null) ? 1 : Math.max(1, v));
    let t = patients.map(v => survivalTime(v))
     .map(v => (v === null) ? 1 : Math.max(1, v));
    const p = patients.map((v, i) => ({ p: v.p, e: e[i], t: t[i] }));


    // Now sort by time, then arrange all arrays to match.
    let pSortedByTime =  [...p];
    pSortedByTime.sort((a,b) => (a.t > b.t) ? 1 : ((b.t > a.t) ? -1 : 0));
    e =pSortedByTime.map(x => x.e);
    t =pSortedByTime.map(x => x.t);
    const rawSurvivalInputs = {
      p: pSortedByTime,
      e: e,
      t: t    
    };

    return rawSurvivalInputs;
}


    // Compute at-risk, exiting, and deaths for each time t_i, from
  // a list of events. 
  // tte: [number, ...]
  // ev:  [boolean, ...]
  // returns: [{n, e, d, t}, ...]
  timeTable = function(tte, ev) {
    function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
    } 
    
    var exits = _.sortBy(tte.map((x, i) => ({tte: x, ev: ev[i]})), 'tte'); //, // sort and collate
    var uexits = exits.map(el =>el.tte).filter(onlyUnique).map(el => { return {tte: el}});
    var gexits = _.groupBy(exits, x => x.tte);                     // group by common time of exit
    var reducedUExits = uexits.reduce(function (a, tte) { // compute d_i, n_i for times t_i (including censor times)
      var group = gexits[tte.tte]; // MJ added .tte at end
      var l = _.last(a) || {n: exits.length, e: 0};
      var events = group.filter(x => x.ev);
    
      a.push({
        n: l.n - l.e,     // at risk
        e: group.length,  // number exiting
        d: events.length, // number events (death)
        t: group[0].tte   // time
      });
      return a;
    }, [{n: exits.length, e: 0, d: 0, t: 0}]);
    return reducedUExits;
  }

  // kaplan-meier
  // tte  time to exit (event or censor)
  // ev   is truthy if there is an event.
  compute = function(tte, ev) {
    //return "Disabled..."
    var dini = this.timeTable(tte, ev);
    // s : the survival probability from t=0 to the particular time (i.e. the
    //     end of the time interval)
    // rate : the chance of an event happened within the time interval (as in t
    //     and the previous t with an event)
    return dini.reduce(function (a, dn) { // survival at each t_i (including censor times)
      let lastInA = null;
      lastInA = a[a.length - 1];
      var l = lastInA || { s: 1 };
      if (dn.d) {                      // there were events at this t_i
        a.push({t: dn.t, e: true, s: l.s * (1 - dn.d / dn.n), n: dn.n, d: dn.d, rate: dn.d / dn.n});
      } else {                         // only censors
        a.push({t: dn.t, e: false, s: l.s, n: dn.n, d: dn.d, rate: null});
      }
      return a;
    }, []);
  }

  calcTrueKMFromDaysEventType = function(events) {
    //events are of type [days, eventtype] where eventtype = 1 for death, 2 for censored
    var times = events.map(e => e[0]);
    var eventTypesAsBool = events.map(e => e[1]==1);
    var computeResults = this.compute(times, eventTypesAsBool);
    var sortedComputeResults = computeResults;
    var justTimeAndSurvivalPercentages = sortedComputeResults.map(result => [result.t, 1, result.s *100]);
     
    return justTimeAndSurvivalPercentages;
  }

  getBufferedEvents = function(events){
    let bEvents = [];
    let eventsWithPercent = this.calcTrueKMFromDaysEventType(events); //this.calcEventsWithPercent(events);
    let previousPoint = [0, 'dummy', eventsWithPercent[0][2]   ]; //eventsWithPercent[0];
    bEvents.push({date: previousPoint[0], value: previousPoint[2]});
    eventsWithPercent.forEach(function(item){
      let dateToUse = Math.max(0, item[0]);
      bEvents.push({date: dateToUse, value: previousPoint[2]});
      bEvents.push({date: dateToUse, value:item[2]});
      previousPoint = item; 
    })
    return bEvents;
  }

  maxDateAcrossCohorts = function(cohorts) {
    let cohortsData = cohorts.map(c => this.getBufferedEvents(c));
    let flattened = [].concat(...cohortsData);
    let flattenedDates = flattened.map(f => f.date); 
    return Math.max(...flattenedDates)
  }

  curveInputsFromUnsortedPids(prepInputs, pids){
    let selectedPatientsData = pids.map(function(s) {
      let patient = prepInputs.p.find(element => element.p == s);
      if(patient) {
        return {p:patient.p, t:patient.t, e:patient.e};
      } else {
        // console.log('Selection patient lookup failed for ' + s);
        return "error";
      }
    }).filter(el => el != "error");

    if(selectedPatientsData.length > 0) {
      // Now sort by time.
      selectedPatientsData.sort((a,b) => (a["t"] > b["t"]) ? 1 : ((b["t"] > a["t"]) ? -1 : 0));
      let selectionDataCurveInput = selectedPatientsData.map(el => [el['t'], el['e'], el['p']]);
      return selectionDataCurveInput;
    } else {
      return []
    }

  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {}

}