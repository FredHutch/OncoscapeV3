import { SelectionToolConfig } from 'app/model/selection-config.model';
import { ChartSelection } from './chart-selection.model';
import { EventEmitter } from '@angular/core';
import { GraphEnum } from 'app/model/enum.model';
import * as THREE from 'three';
import { ChartEvents } from './../component/workspace/chart/chart.events';
import { VisualizationView } from './chart-view.model';
import { DataDecorator } from './data-map.model';
import { EntityTypeEnum, WorkspaceLayoutEnum } from './enum.model';
import { GraphConfig } from './graph-config.model';
import { EdgeConfigModel } from './../component/visualization/edges/edges.model';
import { TooltipOverride } from 'app/model/dataset-table-info.model';

export interface ChartObjectInterface {
  entity: EntityTypeEnum;
  meshes: Array<THREE.Object3D>;
  decorators: Array<DataDecorator>;
  onRequestRender: EventEmitter<GraphEnum>;
  onSelect: EventEmitter<ChartSelection>;
  onConfigEmit: EventEmitter<{ type: GraphConfig }>;
  canRegenLinks: boolean;

  tooltipColorFromDecorator(id:any, color:any);

  tooltipSnippetFromColorDecorator(id:any, tooltipOverride:TooltipOverride):string;

  getTargets(): Array<{
    point: THREE.Vector3;
    id: string;
    idType: EntityTypeEnum;
  }>;
  getTargetsFromMeshes(entityType: EntityTypeEnum): Array<{
    point: THREE.Vector3;
    id: string;
    idType: EntityTypeEnum;
  }>;
  filterGenesForEdges(
    entityA: EntityTypeEnum,
    entityB: EntityTypeEnum,
    key: string
  ): Array<any>;
  enable(truthy: Boolean);
  regenLinks();
  updatedEdgeConfig(edgeConfig: EdgeConfigModel);
  updateDecorator(config: GraphConfig, decorators: Array<DataDecorator>);
  updateData(config: GraphConfig, data: any);
  notifiedOfVariantChanges(reason: string); // Gives Genome.Graph a chance to update itself after data is read in. Unlike updateData, this happens only once, after loading dataset.
  create(entity:EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface;
  destroy();

  preRender(views: Array<VisualizationView>, layout: WorkspaceLayoutEnum, renderer: THREE.Renderer): void;
}
