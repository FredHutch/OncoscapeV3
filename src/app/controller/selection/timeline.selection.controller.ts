import { ChartFactory } from 'app/component/workspace/chart/chart.factory';
import { InfoPanelComponent } from '../../component/workspace/info-panel/info-panel.component';
import { SelectionController } from './selection.controller';
import { ChartScene } from '../../component/workspace/chart/chart.scene';
import { ChartEvents, ChartEvent } from '../../component/workspace/chart/chart.events';
import { VisualizationView } from '../../model/chart-view.model';
import * as TWEEN from '@tweenjs/tween.js';
import { OncoData } from 'app/oncoData';
import { SelectionModifiers } from 'app/component/visualization/visualization.abstract.scatter.component';
import { SvgTimelinesGraph } from 'app/component/visualization/timelines/svgtimelines.graph';

import { EntityTypeEnum } from 'app/model/enum.model';
import { AbstractVisualization } from 'app/component/visualization/visualization.abstract.component';
declare var $: any;

declare var THREE;
export class TimelineSelectionController extends SelectionController {
  // State
  public enabled = false;

  constructor(public entity: EntityTypeEnum, public view: VisualizationView, public events: ChartEvents, public debounce: number = 10) {
    super(entity, view, events, debounce);
    OncoData.instance.currentSelectionController = this;
    console.log('timeline set currentSelectionController. ');
  }

  public setSelectionViaCohortDirect(cohort:any) {
    this.setSelectionViaCohortViaSource(cohort, 'Cohort');
  }

  public setSelectionViaCohortViaSource(cohort:any, sourceName:string) {
    if (this.entitiesSelectable != EntityTypeEnum.PATIENT ){
      alert(`Timeline selection controller expected Patients, but saw [${this.entitiesSelectable.toString()}].`);
      return;
    }

    console.log('TIMELINE should deselect all.');
    let svgGraph = this.view.chart as SvgTimelinesGraph;
    console.log(`before externally fixing selection.`);

    if(cohort.pids.length==0 ) {
      svgGraph.externallyDeselectAllRows();
      return;
    } else {
      svgGraph.externallySelectArrayOfIDs(cohort.pids);
    }
    console.log(`after externally fixing selection.`);

    // // // cohort.pids.forEach(pid => {
    // // //   // let foundIndex = sidList.findIndex(pointId => pointId == sid);
    // // //   // if (foundIndex >= 0) {
    // // //   //   newHighlightIndexes.add(foundIndex * 3);
    // // //   // }
    // // //   console.log(`before hilite ${pid}.`);
    // // //   console.log(`after hilite ${pid}.`);
    // // // });    

    // this.highlightIndexes = newHighlightIndexes;
    // let selectionDetails = {ids:Array.from(this.highlightIndexes), source: sourceName};
    // this.onSelect.emit(selectionDetails);
    console.log("TBD: emit selection from timeline. But as str not index*3.");
  }

}
