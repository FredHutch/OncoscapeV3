import { DatasetDescription } from 'app/model/dataset-description.model';
import { DataService } from 'app/service/data.service';
import { ChartScene } from 'app/component/workspace/chart/chart.scene';
import { OncoData } from 'app/oncoData';
import { GraphConfig } from './../../../model/graph-config.model';

export class CommonSidePanelModel {
  public static instance: CommonSidePanelModel;

  //wire up to parent panel
  datasetDescription: DatasetDescription;
  dataService: DataService;

  public genesData:Array<Array<any>> = null;
  public cnaData:Array<any> = null;
  public cnaSampleMapData = null;
  public patientMap = null;
  public sampleMap = null;
  public patientData = null;
  // These are things in config which trigger reloading or reoptimizing data for copynumber widget.
  public lastCopynumberProcessedMarkerFilterAsString:string = null;
  public lastCopynumberProcessedDatabase:string = null;
  public width = 268; //was 262. full sidebar width is 275.
  public tableNameUsedForCopynumber:string = null;
  public selectionIds = [];
  public definedCohorts = [];
  public lastSelectedDefinedCohort = null; // if null, selected points are a manualselection.
  public graphConfig:GraphConfig;
  
  public cohortColors = [
    "#039CE5",
    "#E91E63",
    "#673AB7",
    "#4CAF50",
    "#CDDC39",
    "#FFC107",
    "orange"
    ];

  public notifyGraphsOfVariantChanges(reason:string){
    console.log(`notifyGraphsOfVariantChanges because ${reason}.`);
    OncoData.instance.variantsEdgeArray = null;
    // TODO: check each view, send update.
    ChartScene.instance.views.map( v=> {
      if(v.chart){
        v.chart.notifiedOfVariantChanges(reason);
      }
    });
  }

  constructor() {
    CommonSidePanelModel.instance = this;
  }
}
