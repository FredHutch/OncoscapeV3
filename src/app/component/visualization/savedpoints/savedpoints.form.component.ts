import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AbstractScatterForm } from './../visualization.abstract.scatter.form';
import { SavedPointsConfigModel, SavedPointsDataModel, SavedPoints, SavedPointsWrapper } from './savedpoints.model';
import { CommonSidePanelComponent } from '../../workspace/common-side-panel/common-side-panel.component';
import { SavedPointsGraph } from './savedpoints.graph';
import { Sprite } from 'three';
import { OncoData } from 'app/oncoData';

@Component({
  selector: 'app-savedpoints-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<form [formGroup]="form" novalidate> 

<button style="color:rgb(30, 136, 229)" (click)="onUpload3DPoints()">Paste in 3D Points</button>

<mat-form-field class='form-field'>
<mat-select placeholder='Saved Points Name' formControlName='savedPointsName'>
  <mat-option *ngFor='let option of savedPointsNameList' [value]='option'>
      {{ option }}
  </mat-option>
</mat-select>
</mat-form-field>


</form>
  `
})
export class SavedPointsFormComponent extends AbstractScatterForm {

  @Input() set config(v: SavedPointsConfigModel) {
    let self = this;
    console.log('in set config for savedpoints');
    if (v === null) { return; }

    if(OncoData.instance.currentCommonSidePanel) {
      Promise.all([OncoData.instance.currentCommonSidePanel.getSavedPointsList(v.database)]).then(x => {
        let list =  x[0];
        self.savedPointsNameList = list.map(sp => sp.name);

        console.log('gg inside config set SavedPointsConfigModel...')
        console.dir(self.savedPointsNameList);

        if (self.form.value.visualization === null) {
          self.form.patchValue(v, { emitEvent: false });
        }
      });
    }

  }

  savedPointsNameList = [];

  // SavedPointsWrapperFromUpdatePoints
  // ==================================
  //
  // The updates.txt form is:
  /*
            "points": [{
                    "i": "c9c70d33-c09b-4f7e-8f12-fde51817038a",
                    "c": [1.264898, 5.112197, 3.813409]
                }, {
                    "i": "5f350242-0cf6-43ac-ab06-2c130d85c5cc",
                    "c": [-0.6077, 7.15593, 0.085697]
                }, {
                    "i": "228c2042-804c-47fa-b565-1993e1015d40",
                    "c": [-0.75715, 6.899708, -0.35193]
                }, {
                    "i": "d5e8379b-621c-4551-9b13-e63b1b068488",
                    "c": [3.109638, 4.427423, 2.243077]
                }
  */
 // We want to turn it into:
 /*
                pid: [array of pids],
                sid: [array of sids],
                result: [
                  [x,y,z],
                  [x,y,z] ...
                ]
 */
  static SavedPointsFromUpdatePoints(updatePoints, sampleMap){
    let rowData = [];
    let errorStr=null;
    console.warn('SavedPointsFromUpdatePoints');

    updatePoints.map(function(r){
      let sid = r.i.toLowerCase(); // Look it up to validate
      if(sampleMap[sid]){
        let x = r.c[0];
        let y = r.c[1];
        let z = r.c[2];
        let pid:string = sampleMap[sid].toLowerCase();
        if(pid) {
          let newPoint = {sid:sid, pid:pid , x:x, y:y, z:z};
          rowData.push(newPoint);
        } else {
          errorStr = `Cannot find patientID for sampleID [${sid}]`;
        }
      }
    });

    if(errorStr) {
      alert('Error: ' + errorStr)
    } else {
      let sp:SavedPoints = {
        result: [],
        sid: [],
        pid: []
      };

      rowData.map(function(row) {
        sp.sid.push(row.sid);
        sp.pid.push(row.pid);
        sp.result.push([row.x, row.y, row.z]);
      });
  
      return sp;
    }
  }

  onUpload3DPoints(){
    let self = this;
    let inputText = prompt("Paste in comma- or whitespace-separated data. Each row: sampleID, X, Y, Z.").trim();
    if (inputText != "") {
      inputText = inputText.replace(/[, \t]+/g, ",");
      let rows:Array<string> = inputText.split('\n').map(v => v.trim());
      console.log('rows...'   );
      console.dir(rows);

      let errorStr = null;
      let rowData = [];
      let sampleMap:any = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.sampleMap;
      rows.map(function(r){
        let cols:Array<string> = r.split(',').map(v => v.trim());
        if(cols.length != 4) {
          console.log('Error in num columns. ' + cols.length);
          errorStr = 'Wrong number of columns. Saw ' + cols.length + ' but expected four (id, x, y, z).';
        } else {
          console.log('sampleID='+cols[0]);
          let sid = cols[0].toLowerCase(); // Look it up to validate

          let x = parseFloat(cols[1]);
          let y = parseFloat(cols[2]);
          let z = parseFloat(cols[3]);
          if (isNaN(x) || isNaN(y) || isNaN(z)) {
            console.log('error, not a number');
            errorStr = 'Text was not in the form of a number.'
          } else {
            if(sampleMap[sid]){
              let pid:string = sampleMap[sid].toLowerCase();
              if(pid) {
                let newPoint = {sid:sid, pid:pid , x:x, y:y, z:z};
                rowData.push(newPoint);
              } else {
                errorStr = `Cannot find patientID for sampleID [${sid}]`;
              }
            }
          }
        }
      });
      console.log('rowData...' );
      console.dir(rowData);
      if(errorStr) {
        alert('Error: ' + errorStr)
      } else {
        let nameForSavedPoints = prompt(`What NAME will you give to these ${rowData.length} saved points?`, 'Untitled');
        // Build savedpoints structure.
        if(nameForSavedPoints) {
          let sp:SavedPoints = {
            result: [],
            sid: [],
            pid: []
          };

          rowData.map(function(row) {
            sp.sid.push(row.sid);
            sp.pid.push(row.pid);
            sp.result.push([row.x, row.y, row.z]);
          });

          let spw:SavedPointsWrapper = {
            name: nameForSavedPoints,
            savedPoints: sp,
            created: Date.now()
          };
          // Finally ready to save points.
          console.log('TBD - write to indexedDB');
          if(OncoData.instance.currentCommonSidePanel) {
            Promise.all([OncoData.instance.currentCommonSidePanel.putSavedPointsWrapper(
              OncoData.instance.currentCommonSidePanel.config.database, spw)]).then(x => {
              console.log('now need to set config for this component');
              self.form.patchValue({savedPointsName: spw.name});
            });
          }


        }
      }
    }
  }


  constructor(private fb: FormBuilder) {

    super();

    this.form = this.fb.group({
      dirtyFlag: [0],
      visualization: [],
      graph: [],
      database: [],
      entity: [],
      table: [],

      savedPointsName: [],
      pcx: [],
      pcy: [],
      pcz: [],
      n_components: [],
      metric: [],
      eps: [],
      dimension: [],
      dissimilarity: []
    });

    this.registerFormChange();
  }
}
