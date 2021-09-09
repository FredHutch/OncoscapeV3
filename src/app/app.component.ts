import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { OncoData } from 'app/oncoData';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ContentDialog } from './component/content-dialog/content-dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  private _oncoData:OncoData;
  static myApp;
  constructor(private store: Store<any>, public dialog: MatDialog) {
    console.log('Create OncoData instance.');
    this._oncoData = new OncoData();
  }

  ngOnInit() {
    AppComponent.myApp = this;
  }  

  public showContentDialog(title:string, guts:string){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      title: title,
      guts: guts
    };

    const dialogRef = AppComponent.myApp.dialog.open(ContentDialog, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  
  }
}
