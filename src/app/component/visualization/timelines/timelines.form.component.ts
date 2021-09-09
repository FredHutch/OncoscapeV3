import { combineLatest as observableCombineLatest, Subject, Subscription } from 'rxjs';

import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
import { DataField } from './../../../model/data-field.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { TimelinesConfigModel, TimelinesStyle } from './timelines.model';
import { OncoData } from 'app/oncoData';
import { DataService } from 'app/service/data.service';
import {
  Cohort,
  CohortCondition,
  CohortField
} from './../../../model/cohort.model';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';

@Component({
  selector: 'app-timelines-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timelines.form.component.html'
})

export class TimelinesFormComponent implements OnDestroy {

  private baseSortComparisonOptions = [
    'First StartDate',
    'Last StartDate'
  ];
  public rv = [0, 100];
  public styleOptions = [TimelinesStyle.NONE, TimelinesStyle.ARCS, TimelinesStyle.TICKS, TimelinesStyle.SYMBOLS];
  public eventGroups = [];
  public eventTypes = {};
  public patientAttributes: Array<DataField> = [];
  public ctrls = [];
  public alignOptions = [];
  public sortOptions = [];
  public sortComparisonOptions = this.baseSortComparisonOptions.slice();
  public groupOptions = [];
  public $fields: Subject<Array<DataField>> = new Subject();
  public $events: Subject<Array<{ type: string; subtype: string }>> = new Subject();
  public $options: Subscription;
  public shmoo: string = 'foo';

  @Input()
  set fields(fields: Array<DataField>) {
    if (fields === null) {
      return;
    }
    if (fields.length === 0) {
      return;
    }
    this.patientAttributes = fields;
    this.$fields.next(fields);
  }

  lastConfig:TimelinesConfigModel = null;

  @Input()
  set events(events: Array<{ type: string; subtype: string }>) {
    // console.log('MJ - In set events...');
    console.log(`MJ - events = ${JSON.stringify(events)}`);

    if (events === null) {
      return;
    }
    if (events.length === 0) {
      return;
    }
    const groups = _.groupBy(events, 'type');

    const control = <FormArray>this.form.controls['bars'];
    Object.keys(groups).forEach(group => {
      const fg = this.fb.group({
        label: [group],
        style: [TimelinesStyle.TICKS],
        events: [],
        row: [],
        track: [],
        z: [],
        setAliases: [],
        bandHeight: [],
        sortFields: [],
        subtypeColors: []
      });
      control.push(fg);
    });
    this.ctrls = control.controls;
    this.eventTypes = groups;
    this.eventGroups = Object.keys(groups).map(lbl => ({
      label: lbl,
      events: groups[lbl].map(evt => ({ label: evt.subtype }))
    }));
    this.alignOptions = Object.keys(groups).map(lbl => ({
      label: lbl,
      items: groups[lbl].map(evt => ({ label: evt.subtype }))
    }));

    this.sortComparisonOptions = this.baseSortComparisonOptions.slice();

    if(OncoData.instance.dataLoadedAction.visSettings == null) {
      console.error('EXPECTED VISSETTINGS in DataLoadedAction.');
    } else {
      let timelineVisSettingsExist = OncoData.instance.dataLoadedAction.visSettings.find(v=>v.visEnum==128);
      if(timelineVisSettingsExist){
        let visSettings = JSON.parse( timelineVisSettingsExist.settings );
        if(visSettings && visSettings.bars) {
          let unflattenedSortFields:Array<any> = (visSettings.bars as Array<any>)
            .filter(v => v.sortFields).map(v => v.sortFields);
            let flattened = unflattenedSortFields.reduce((acc, val) => acc.concat(val), [])
            let sortedUniqueSortFields = flattened.sort().filter(function(el,i,a){return i===a.indexOf(el)});
            if (sortedUniqueSortFields.length > 0){
              let firstlastLargestUniqueSortFields:Array<string> = [];
              sortedUniqueSortFields.map(v => {
                firstlastLargestUniqueSortFields.push ('First ' + v);
                firstlastLargestUniqueSortFields.push ('Last ' + v);
                firstlastLargestUniqueSortFields.push ('Largest ' + v);
              });
              this.sortComparisonOptions = this.baseSortComparisonOptions.slice()
                .concat(firstlastLargestUniqueSortFields);
              console.log('====sortComparisonOptions===');
              console.dir(this.sortComparisonOptions);
            }
        }
      }
    }
    this.$events.next(this.eventGroups);
  }


  public createCohortFromButton(e: any): void {
    let self = this;

    let firstRow = prompt("CREATE A RANGE COHORT\n\nWhat is the row number of the FIRST patient you want in the cohort?", "");

    if (firstRow == null || firstRow == "") {
      // canceled
    } else {
      if(isNaN(parseInt(firstRow))) {
        alert("Sorry, that is not a number.");
        return;
      }
      let lastRow = prompt("What is the row number of the LAST patient you want in the cohort?", "");
      if (lastRow == null || lastRow == "") {
        // canceled
      } else {
        if(isNaN(parseInt(lastRow))) {
          alert("Sorry, that is not a number.");
          return;
        }

        let cohortName = prompt("What should the cohort's name be?", "Cohort_"+ Date().toString().slice(16,24));
        if (cohortName == null || cohortName == "") {
          // cohortName
        } else {
          let min = Math.min(parseInt(firstRow), parseInt(lastRow));
          let max = Math.max(parseInt(firstRow), parseInt(lastRow));
          let patients = OncoData.instance.lastData['TIMELINES'].results.data.result.patients;
          let pids = [];
          for(var i=min; i<=max; i++) {
            console.log(`i=${i}, ${patients[i-1][0].p}.`);
            pids.push(patients[i-1][0].p);
          }

          let commonSide = OncoData.instance.currentCommonSidePanel;

          
          
          let newCohort:any = commonSide.createCohortFromPatientSelectionIds(pids);
          newCohort.n = cohortName;

          
          let cohortWrapper = {
            cohort: newCohort,
            database: commonSide.config.database
          };
//          this.addCohort.emit(cohortWrapper);
          
          WorkspaceComponent.instance.addCohort(cohortWrapper);



        }
      }
    }
    /*
    if (this.cohortSelectComponent.panelOpen) {
      this.cohortSelectComponent.toggle();
    }
    this.showPanel.emit(PanelEnum.COHORT);
    */
  }

  @Input()
  set config(v: TimelinesConfigModel) {
    this.lastConfig = v;

    if (v === null) {
      return;
    }

    let self = this;
    // For each bar, check if setAliases exist. If so, put the keys for them as extra options.
    v.bars.map(function(b){
      if(b.setAliases) {
        let alignOptionGroups = self.alignOptions.filter(ao => ao.label == b.label);
        if(alignOptionGroups.length==1){
          Object.keys(b.setAliases).forEach(function(key){
            // Only add the option if it isn't already in the list.
            if (alignOptionGroups[0]['items'].map(i => i.label).indexOf(key) == -1){
              let alias = {label: key};
              alignOptionGroups[0]['items'].unshift(alias);
            }
          });
        } 
      }
    });

    let feedbackData:any = window['computedFeedbackForForm'][v.graph.toString() +'_128'];
    if (feedbackData) {
      v.firmColors = feedbackData.firmColors;
    }
    this.form.patchValue(v, { emitEvent: false });
  }

  @Output()
  configChange = new EventEmitter<GraphConfig>();

  form: FormGroup;

  rangeChange(): void {
    this.form.patchValue({ range: this.rv }, { onlySelf: true, emitEvent: true });
  }

  setOptions(options: any): void {
    options[0].filter(w => w.type === 'NUMBER');// TEMPNOTE: ??
    options[0].map(w => {
      if(w.typeComingIn){
        // already have it, skip.
      } else {
        Object.assign(w, { typeComingIn: w.type });
      }
    }); // TEMPNOTE: store this so existing code can replace type==NUMBER with type=patient. IDK why there are two meanings of type here.

    // Add 'type: "event"' to all event options, so we can distinguish them
    // from patient-based options.
    const sort = options[1].map(v => ({
      label: v.label,
      items: v.events.map(w => ({ label: w.label, type: 'event' }))
    }));

    // Stick patient options ahead of event options.
    sort.unshift({
      label: 'Patient',
      items: [{ label: 'None' }].concat(
        options[0].filter(w => w.typeComingIn === 'NUMBER').map(w => Object.assign(w, { type: 'patient' }))
        //options[0].filter(w => w.values.min != null).map(w => Object.assign(w, { type: 'patient' }))
      )
    });

    const group = [
      {
        label: 'Patient',
        items: [{ label: 'None' }].concat(
          options[0].filter(w => w.typeComingIn === 'STRING').map(w => Object.assign(w, { type: 'patient' }))
        )
      }
    ];

    // already set this.alignOptions above. Previously was = this.eventGroups;
    this.sortOptions = sort;
    this.groupOptions = group;
  }
  byKey(p1: DataField, p2: DataField) {
    if (p2 === null) {
      return false;
    }
    return p1.key === p2.key;
  }
  byLabel(p1: any, p2: any) {
    if (p2 === null) {
      return false;
    }
    return p1.label === p2.label;
  }

  ngOnDestroy(): void {
    this.$options.unsubscribe();
  }

  constructor(private fb: FormBuilder) {
    // Init Form
    this.form = this.fb.group({
      dirtyFlag: [0],
      visualization: [],
      graph: [],
      database: [],
      entity: [],
      table: [],

      sort: [],
      sortComparison: ['1st Date'],
      group: [],
      align: [],
      attrs: [],
      range: [],

      bars: this.fb.array([])
    });

    // // Update When Form Changes
    // this.form.valueChanges
    //   .debounceTime(800)
    //   .distinctUntilChanged()
    //   .subscribe(data => {
    //     let dirty = 0;
    //     const form = this.form;

    //     // if (form.get('timescale').dirty) { dirty |= DirtyEnum.OPTIONS; }
    //     // if (form.get('pointColor').dirty) { dirty |= DirtyEnum.COLOR; }
    //     if (dirty === 0) { dirty |= DirtyEnum.LAYOUT; }
    //     form.markAsPristine();
    //     data.dirtyFlag = dirty;
    //     this.configChange.emit(data);
    //   });

    // Update When Form Changes
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(data => {
        const form = this.form;
        if (form.dirty) {
          form.markAsPristine();
          let myFeedbackData = window['computedFeedbackForForm'][data.graph.toString() + '_' + data.visualization];
          if (myFeedbackData) {
            data.firmColors = myFeedbackData.firmColors;
          }
          this.configChange.emit(data);
        }
      });

    this.$options = observableCombineLatest(this.$fields, this.$events).subscribe(this.setOptions.bind(this));
  }
}
