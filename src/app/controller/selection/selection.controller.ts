import { EventEmitter } from '@angular/core';
import { AbstractMouseController } from  './../abstract.mouse.controller';
import { Points, Raycaster, Mesh, Geometry } from 'three';
import { VisualizationView } from 'app/model/chart-view.model';
import { ChartEvents } from 'app/component/workspace/chart/chart.events';
import { EntityTypeEnum } from 'app/model/enum.model';

export class SelectionController extends AbstractMouseController {
  public entitiesSelectable: EntityTypeEnum;
  
  // ??? Can this be moved to abstract scatter selection?
  public highlightIndexes:Set<number> = new Set([]);

  public reset(): void {
    this.highlightIndexes.clear();
  }

  public onSelect: EventEmitter<any> = new EventEmitter();
  // was in abstract scatter selection.


  public setSelectionViaCohortDirect(cohort:any) {
    console.warn('NYI setSelectionViaCohortDirect in selectionController.');
  }

  public setSelectionViaCohortViaSource(cohort:any, sourceName:string) {
    console.warn('NYI setSelectionViaCohortViaSource in selectionController.');
  }

  constructor(entity: EntityTypeEnum, public view: VisualizationView, public events: ChartEvents, public debounce: number = 10) {
    super(view, events, debounce);
    this.entitiesSelectable = entity;
  }
}