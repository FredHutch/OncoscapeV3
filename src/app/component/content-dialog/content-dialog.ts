import {Component, Inject, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

/**
 * @title Dialog with header, scrollable content and actions
 */
//  title: 'Angular For Beginners',
//  guts: event.detail.report

@Component({
  selector: 'content-dialog',
  //templateUrl: 'content-dialog.html',
  template: `
  <h1 mat-dialog-title>{{ data.title}}</h1>
  <mat-dialog-content [innerHtml]="data.guts" class="shmoo">
  <!-- (( this.trimLeadingTrailingQuotes(data.guts) )) -->
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
  </mat-dialog-actions>    
  `  
})
export class ContentDialog  {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, guts: string}) { 

  }


}