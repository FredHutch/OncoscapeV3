import { ChartScene } from './component/workspace/chart/chart.scene';
import { GraphEnum, VisualizationEnum, SelectionTypeEnum } from 'app/model/enum.model';
import { CommonSidePanelComponent } from 'app/component/workspace/common-side-panel/common-side-panel.component';
import { SelectionController } from 'app/controller/selection/selection.controller';
import { DataLoadedAction } from 'app/action/data.action';
import { VariantCheckbox } from 'app/model/data-map.model'

export class LoadedTable {
  public map: Object;
  public data: Object;
}
export class OncoData {
  public inHistoryUndoRedo:boolean = false;

  public currentCommonSidePanel:CommonSidePanelComponent;
  public currentSelectionController:SelectionController; //ScatterSelectionLassoController;
  public dataLoadedAction:DataLoadedAction;
  public mutationRecords:Array<any>;
  public cnaRecords:Array<any>;
  public variantsEdgeArray:Array<any>;
  public variantCountsPerPatient:Map<string, any>
  public lastData = {};
  public visSettings:Array<any>;
  public chartSceneInstance(): ChartScene{
    return ChartScene.instance;
  }
  public edgeMainVariantCheckbox: VariantCheckbox;
  



  
  public static instance: OncoData;

  constructor() {
    OncoData.instance = this;

    window['reachableOncoData'] = this;
  }  
}
