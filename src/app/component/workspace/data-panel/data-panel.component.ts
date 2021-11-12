import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { ChartScene } from '../chart/chart.scene';
import { CollectionTypeEnum } from 'app/model/enum.model';
import { GraphConfig } from 'app/model/graph-config.model';
import Dexie from 'dexie';
import { CommonSidePanelComponent } from  '../common-side-panel/common-side-panel.component';
import { DataTable } from './../../../model/data-field.model';
import { HotTableRegisterer } from '@handsontable/angular';
import { ScatterSelectionLassoController } from 'app/controller/scatter/scatter.selection.lasso.controller';
import { OncoData } from 'app/oncoData';

declare var $: any;

@Component({
  selector: 'app-workspace-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DataPanelComponent implements AfterViewInit {
  // @ViewChild('dataTable') dataTable;
  // @ViewChild('tabs') tabs: ElementRef;

  public spreadsheetHotTable:string = "spreadsheetHotTable";
  
  @Input()
  configA: GraphConfig;
  @Input()
  configB: GraphConfig;
  @Output()
  hide: EventEmitter<any> = new EventEmitter();

  public _tables: Array<DataTable> = [];
  public _table: DataTable;
  public columns: Array<any> = [];
  public columnsToDisplay: Array<string> = [];
  public dataSource: Array<any> = [];
  public db: Dexie = null;
  public rowHeaders = [];
  public colHeaders = [];
  public settings = {
    width: window.innerWidth,
    height: window.innerHeight - 180,
    colWidths: 150,
    rowHeights: 23,
    autoRowSize: false,
    autoColSize: true,
    columnSorting: true,
    contextMenu: true,
    stretchH: 'all',
    manualRowResize: true,
    manualColumnResize: true,
    rowHeaders: true,
    manualRowMove: true,
    manualColumnMove: true,
    sortIndicator: true
  };

  closeClick() {
    this.setSelectionViaCommonSidebar();
    this.hide.emit();
  }

  @Input()
  set tables(v: Array<DataTable>) {
    //   { tbl: 'configA', label: 'Chart A', map: '', ctype: CollectionTypeEnum.UNDEFINED },
    //   { tbl: 'configB', label: 'Chart B', map: '', ctype: CollectionTypeEnum.UNDEFINED }
    // ]);
    // this._tables.push(...this._tables.splice(0, 2));
    // TODO: Add mutations, events, cohorts in list
    this._tables = v.filter(
      tbl => tbl.tbl !== 'mut'  // MJ -- && tbl.tbl !== 'events'
    );
  }

   private JSONToCSVConverter(JSONData, colHeaders) {
    var 
    arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
    CSV = '',   
    row = "",
    fileName = "spreadsheet.csv";

    // Put the header (based on the colHeaders of my table in my example)
    for (var index in colHeaders) {
        row += colHeaders[index] + ',';
    }
    row = row.slice(0, -1);
    CSV += row + '\r\n';

    // Adding each rows of the table
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            row += arrData[i][index] + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }        

    // Downloading the new generated csv.
    // For IE >= 9
    if(window.navigator.msSaveOrOpenBlob) {
        var fileData = [CSV];
        let blobObject = new Blob(fileData);
        window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    } else { 
    // For Chome/Firefox/Opera
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        var link = document.createElement("a");    
        link.href = uri;

        // link['style'] = "visibility:hidden";
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

  onSaveFile(): void {
    let self = this;
    let hotRegisterer = new HotTableRegisterer();
    let thisHotTable = hotRegisterer.getInstance('spreadsheetHotTable');

    let sheetDataCopy = thisHotTable.getData().slice();
    let sheetDataSelectedRows = sheetDataCopy.filter(r => r[0] == true);
    let numSelectedRows = sheetDataSelectedRows.length;
    let allColHeaders:any  = thisHotTable.getSettings().colHeaders ;
    let theseColheaders = allColHeaders.slice(1,-1); // remove first header, "Selected"
    let sheetDataToUse = numSelectedRows > 0 ? sheetDataSelectedRows : sheetDataCopy;
    // Now remove "Selected" values, the first value in each row.
    let sheetDataToUseWithoutCheckbox = sheetDataToUse.map(r => r.slice(1,-1));
    this.JSONToCSVConverter(sheetDataToUseWithoutCheckbox, theseColheaders);
    let rowsUsedText = numSelectedRows == 0 ? 'all' : numSelectedRows + ' selected';
    alert(`A CSV file with ${rowsUsedText} rows has been downloaded.`);
  }

  onCreateCohort(): void {
    console.log('onCreateCohort in datapanel======');
    let ids = this.getPseudoCohortFromSelection().pids;
    CommonSidePanelComponent.instance.createCohortFromPids(ids);
  }

  onSelectedToTop(){
    //self.dataSource.sort((a, b) => a[0].toString() < b[0].toString() ? -1 : (a[0].toString() > b[0].toString() ? 1 : 0));
    let hotRegisterer = new HotTableRegisterer();
    let thisHotTable = hotRegisterer.getInstance('spreadsheetHotTable');
    let sheetData = thisHotTable.getData();
    // Build list of all row IDs with true for Selected colummn.
    let rowsForTop:any[] = [];
    let rowsForBottom:any[] = [];
    sheetData.forEach((row, i) => {
      if (row[0] == true) {
        rowsForTop.push(row);
      } else {
        rowsForBottom.push(row);
      }
    });
    sheetData = rowsForTop.concat(rowsForBottom);
    thisHotTable.loadData(sheetData);
    thisHotTable.render();
  }

  getPseudoCohortFromSelection(){
    let pseudoCohort = {pids:[], sids:[]};

    let hotRegisterer = new HotTableRegisterer();
    let thisHotTable = hotRegisterer.getInstance('spreadsheetHotTable');
    if(this.colHeaders[1]=='Patient'){
      let sheetData = thisHotTable.getData();
      // Build list of all row IDs with true for Selected colummn.
      let patientMap = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.patientMap;
      console.warn('NOTE: setSelectionInCommonSidebar assumes 1-to-1 patient and sample mapping.');
      sheetData.forEach((row) => {
        if (row[0] == true) {
          let pid = row[1];
          pseudoCohort.pids.push(pid);
          let sid = patientMap[pid]; // setSelectionInCommonSidebar assumes 1-to-1 patient and sample mapping
          pseudoCohort.sids.push(sid);
        }
      });
      if (OncoData.instance.currentSelectionController) {
        OncoData.instance.currentSelectionController.setSelectionViaCohortViaSource(pseudoCohort, 'Spreadsheet');
      }        
    }
    return pseudoCohort;
  }

  setSelectionViaCommonSidebar(){
    if(this.colHeaders[1]=='Patient'){
      let pseudoCohort = this.getPseudoCohortFromSelection();
      if (OncoData.instance.currentSelectionController) {
        OncoData.instance.currentSelectionController.setSelectionViaCohortViaSource(pseudoCohort, 'Spreadsheet');
      }        
    }
  }

  openDatabase(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.db === null) {
        this.db = new Dexie('notitia-' + this.configA.database);
      }
      if (this.db.isOpen()) {
        resolve();
      } else {
        this.db.open().then(resolve);
      }
    });
  }

  tableChange(e: MatSelectChange): void {
    this.loadTable(e.value);
  }

  loadTable(table: DataTable): void {
    this._table = table;
    if (table.ctype === CollectionTypeEnum.UNDEFINED) {
      const data = [];
      this.dataSource = data;
      return;
    }

    console.log('data-panel loadTable');
    let self = this;
    this.openDatabase().then(() => {
      switch (table.ctype) {
        case CollectionTypeEnum.MUTATION:
        // MJ had it as  break;
        case CollectionTypeEnum.EVENT:
        case CollectionTypeEnum.SAMPLE:
        case CollectionTypeEnum.PATIENT:
          self.db
            .table(table.tbl)
            .toArray()
            .then(originalResult => {
              let result:Array<any> = originalResult;
              if(table.ctype === CollectionTypeEnum.EVENT) {
                result = result.map(e => {
                  let newEvent= {  };
                  Object.keys(e).map (k => newEvent[k] = e[k]);
                  delete newEvent['data'];
                  return newEvent;
                });
              }
              const keys = Object.keys(result[0]);
              self.colHeaders = Object.keys(result[0]).map(v =>
                v.replace(/\_/gi, ' ')
              );
              // console.log('MJ about to create column 0 for spreadsheet');
              self.colHeaders[0] =
                table.ctype === CollectionTypeEnum.EVENT
                  ? 'Patient'
                  : table.ctype === CollectionTypeEnum.SAMPLE
                    ? 'Sample'
                    : 'Patient';
              let currentSelectionPids = OncoData.instance.currentCommonSidePanel.commonSidePanelModel.selectionIds;                  
              self.dataSource = result.map(function(v) {
                let mapped = keys.map(w => v[w]);
                let rowIsSelected:boolean = false;
                if (self.colHeaders[0] == 'Patient') {
                  rowIsSelected = currentSelectionPids.includes(mapped[0]); // Is patientId in the selection list?
                }
                mapped.unshift(rowIsSelected) // prepend the selection checkbox as false
                return mapped;
              });
              self.colHeaders.unshift('Selected')

              this.columns = [];
              for (let num = 0; num < self.colHeaders.length; num++) {
                this.columns.push({ title: self.colHeaders[num] }); //data: self.colHeaders[num], 
              };
              this.columns[0]['type'] = 'checkbox';
              this.columns[0]['width'] = 90;
              self.cd.detectChanges();
            });
          break;
        default:
          if (table.tbl === 'mutations') {
            table.tbl = 'mut';
          }
          Promise.all([
            self.db.table(table.tbl.replace(/\s/gi, '')).toArray(),
            self.db.table(table.map.replace(/\s/gi, '')).toArray()
          ]).then(result => {
            self.colHeaders = result[1].map(v => v.s);
            self.colHeaders.unshift('Markers');
            self.dataSource = result[0].map(v => [v.m, ...v.d]);

            self.cd.detectChanges();
          });
          break;
      }
    });
  }

  ngAfterViewInit() {
    const patientTable = this._tables.filter(
      t => t.ctype === CollectionTypeEnum.PATIENT
    );
    const tbl: DataTable =
      patientTable.length > 0 ? patientTable[0] : this._tables[0];
    this.loadTable(tbl);

  }

  constructor(private cd: ChangeDetectorRef) {}
}
