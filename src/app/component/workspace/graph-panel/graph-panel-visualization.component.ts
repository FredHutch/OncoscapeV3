import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material';
import { DataTable } from 'app/model/data-field.model';
import { GraphConfig } from 'app/model/graph-config.model';
import { DataField, DataFieldFactory } from './../../../model/data-field.model';
import { DataDecorator, DataDecoratorTypeEnum, LegendFilter } from './../../../model/data-map.model';
import { EntityTypeEnum, PanelEnum, DataTypeEnum, CollectionTypeEnum, GraphEnum } from './../../../model/enum.model';
import { MatSliderChange } from '@angular/material/slider';
import { WorkspaceComponent } from 'app/component/workspace/workspace.component';
import { CommonSidePanelComponent } from '../common-side-panel/common-side-panel.component';
import { ChartScene } from '../chart/chart.scene';
import { GeneSet } from './../../../model/gene-set.model';

@Component({
  selector: 'app-graph-panel-visualization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `

    <mat-form-field class="form-field" *ngIf="config.enableLabel">
      <mat-select
        placeholder="Label Options"
        (selectionChange)="setLabelOption($event)"
        [(value)]="labelSelected"
        [compareWith]="byKey"
      >
        <mat-option *ngFor="let option of labelOptions" [value]="option"> {{ option.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field class="form-field" *ngIf="config.enableColor">
      <mat-select
        placeholder="Color Options"
        (selectionChange)="setColorOption($event)"
        [(value)]="colorSelected"
        [compareWith]="byKey"
      >
        <button mat-button style="color:#1e88e5;width:100%;" (click)="customizeColorOptions()">
          <mat-icon class="material-icons md-18" style="transform:translate(0px, 2px);margin-right:0px;"
            >settings</mat-icon
          >Modify List
        </button>
        <mat-option *ngFor="let option of colorOptions" [value]="option"> {{ option.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field class="form-field" *ngIf="config.enableShape">
      <mat-select
        placeholder="Shape Options"
        (selectionChange)="setShapeOption($event)"
        [(value)]="shapeSelected"
        [compareWith]="byKey"
      >
        <mat-option *ngFor="let option of shapeOptions" [value]="option"> {{ option.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field class="form-field" *ngIf="config.enableSize">
      <mat-select
        placeholder="Size Options"
        (selectionChange)="setSizeOption($event)"
        [(value)]="sizeSelected"
        [compareWith]="byKey"
      >
        <mat-option *ngFor="let option of sizeOptions" [value]="option"> {{ option.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-label *ngIf="shouldShowMarkerBaseSizeSlider(config)">Marker Base Size</mat-label>
    <br  *ngIf="shouldShowMarkerBaseSizeSlider(config)"/>
    <mat-slider  *ngIf="shouldShowMarkerBaseSizeSlider(config)" min='1' max='25' value="{{ defaultMarkerBaseSize() }}"  (input)="onMarkerScaleChange($event)" thumbLabel='true'></mat-slider>
    <br  *ngIf="shouldShowMarkerBaseSizeSlider(config)"/>


    <mat-form-field class="form-field" *ngIf="config.enableGenesetOverlay">
      <mat-select
        #firstGenesetOverlaySelectComponent
        placeholder="First Geneset Overlay"
        (selectionChange)="setGenesetOverlay(1,$event)"
        [(value)]="firstGenesetOverlaySelected"
        [compareWith]="byN"
      >
        <button mat-button style="color:#1e88e5;width:100%;" (click)="customizeGenesets(1)">
          <mat-icon class="material-icons md-18" style="transform:translate(0px, 2px);margin-right:0px;"
            >settings</mat-icon
          >Modify List
        </button>
        <mat-option *ngFor="let option of genesetOptions" [value]="option"> {{ formatGenesetOverlayForDropdown(option) }} </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field class="form-field" *ngIf="config.enableGenesetOverlay">
      <mat-select
        #secondGenesetOverlaySelectComponent
        placeholder="Second Geneset Overlay"
        (selectionChange)="setGenesetOverlay(2,$event)"
        [(value)]="secondGenesetOverlaySelected"
        [compareWith]="byN"
      >
        <button mat-button style="color:#1e88e5;width:100%;" (click)="customizeGenesets(2)">
          <mat-icon class="material-icons md-18" style="transform:translate(0px, 2px);margin-right:0px;"
            >settings</mat-icon
          >Modify List
        </button>
        <mat-option *ngFor="let option of genesetOptions" [value]="option"> {{ formatGenesetOverlayForDropdown(option) }} </mat-option>
      </mat-select>
    </mat-form-field>
    `
})
export class GraphPanelVisualizationComponent {
  @ViewChild('firstGenesetOverlaySelectComponent')
  firstGenesetOverlaySelectComponent: MatSelect;

  @ViewChild('secondGenesetOverlaySelectComponent')
  secondGenesetOverlaySelectComponent: MatSelect;

  @Output()
  showPanel: EventEmitter<PanelEnum> = new EventEmitter();

  @Output()
  threeDOption: EventEmitter<{
    config: GraphConfig,
    option: string;
    value: any;
  }> = new EventEmitter();

  @Output()
  decoratorAdd: EventEmitter<{
    config: GraphConfig;
    decorator: DataDecorator;
  }> = new EventEmitter();

  @Output()
  decoratorDel: EventEmitter<{
    config: GraphConfig;
    decorator: DataDecorator;
  }> = new EventEmitter();

  @Output()
  legendFilterAdd: EventEmitter<{
    config: GraphConfig;
    legendFilter: LegendFilter;
  }> = new EventEmitter();

  @Output()
  legendFilterDel: EventEmitter<{
    config: GraphConfig;
    legendFilter: LegendFilter;
  }> = new EventEmitter();

  public genesetOptions = [];

  public customizeGenesets(overlayNum:number): void {
    if(overlayNum == 1){
      if (this.firstGenesetOverlaySelectComponent.panelOpen) {
        this.firstGenesetOverlaySelectComponent.toggle();
      }
    } else {
      if (this.secondGenesetOverlaySelectComponent.panelOpen) {
        this.secondGenesetOverlaySelectComponent.toggle();
      }
    }
    this.showPanel.emit(PanelEnum.GENESET);
  }

  public formatGenesetOverlayForDropdown(gs:GeneSet) {
    if(gs.n == 'None') {
      return 'None'
    } else {
      return `${gs.n} (${gs.g.length} genes)`;
    }
  }
  
  setGenesetOverlay(position:number, event: any) {
    console.log(`setGenesetOverlay for pos ${position}.`);
    if(position==1) {
      this._config.firstGenesetOverlay = event.value;
    } else {
      this._config.secondGenesetOverlay = event.value;
    }
    console.log('TBD: ==== Take this view and recreate the objects (genes, w/ colors)');;
    let viewIndex = 0; // GRAPH_A 
    if(this.config.graph == GraphEnum.GRAPH_B){
      viewIndex = 1;
    }
    if(this.config.graph == GraphEnum.EDGES){
      viewIndex = 2;
    }
    let chart = ChartScene.instance.views[viewIndex].chart;
    if(chart['recreate']){
      let c:any = chart;
      c.recreate();
    }
    ChartScene.instance.render();
  }

  @Input()
  set genesets(v: Array<GeneSet>) {
    this.genesetOptions = [{ n: 'None', g: [] }, ...v];
  }

  public nClusters = 3;
  public clinicalColorOptions: Array<DataField>;
  public clinicalShapeOptions: Array<DataField>;
  public clinicalSizeOptions: Array<DataField>;
  public clinicalLabelOptions: Array<DataField>;
  public molecularColorOptions: Array<DataField>;
  public molecularShapeOptions: Array<DataField>;
  public molecularSizeOptions: Array<DataField>;
  public molecularLabelOptions: Array<DataField>;
  public firstGenesetOverlaySelected: GeneSet;
  public secondGenesetOverlaySelected: GeneSet;
  public colorSelected: DataField;
  public labelSelected: DataField;
  public shapeSelected: DataField;
  public sizeSelected: DataField;
  public colorOptions: Array<DataField>;
  public shapeOptions: Array<DataField>;
  public sizeOptions: Array<DataField>;
  public labelOptions: Array<DataField>;

  private _decorators: Array<DataDecorator> = [];
  @Input()
  set decorators(value: Array<DataDecorator>) {
    if (value === null) {
      return;
    }
    this._decorators = value;
  }
  
  public shouldShowMarkerBaseSizeSlider(config): boolean {
    let shouldShow:boolean = (config['enableMarkerBaseSize'] && config['enableMarkerBaseSize'] == true);
    return shouldShow;
  }

  public getGenesetOptions() {

  }

  public defaultMarkerBaseSize(): number {
    return 9;
  }

  private _config: GraphConfig;
  public get config(): GraphConfig {
    return this._config;
  }

  @Input()
  public set config(config: GraphConfig) {
    if (!this._config) {
      this._config = config;
      this.updateFields();
    } else if (this._config.entity !== config.entity || this._config.visualization != config.visualization) {
      this._config = config;
      this.updateFields();
    }

    if (config.enableGenesetOverlay){ //(config.enableGenesetOverlay) {
      if(this.genesetOptions.length > 1) { 
        if(this._config.firstGenesetOverlay.n != 'None') {
          this.firstGenesetOverlaySelected = this.genesetOptions.find(
            e => e.n == this._config.firstGenesetOverlay)
          if(this.firstGenesetOverlaySelected == null) {
            console.error(`ERROR:1 Could not find overlay geneset ${this._config.firstGenesetOverlay} in graph panel data.`);
            this.firstGenesetOverlaySelected = this.genesetOptions[0]; // 'None'
          }
        }

        if(this._config.secondGenesetOverlay.n != 'None') {
          this.secondGenesetOverlaySelected = this.genesetOptions.find(
            e => e.n == this._config.secondGenesetOverlay)
          if(this.secondGenesetOverlaySelected == null) {
            console.error(`ERROR: 2 Could not find overlay geneset ${this._config.secondGenesetOverlay} in graph panel data.`);
            this.secondGenesetOverlaySelected = this.genesetOptions[0]; // 'None'
          }
        }

      } else {
        // No genesets passed, so we are forced to use None.
        this.firstGenesetOverlaySelected = this.genesetOptions[0];
        this.secondGenesetOverlaySelected = this.genesetOptions[0];
      }
    }

  }

  @Input()
  set tables(tables: Array<DataTable>) {
    this.molecularColorOptions = DataFieldFactory.getMolecularColorFields(tables);
    this.molecularShapeOptions = DataFieldFactory.getMolecularShapeFields(tables);
    this.molecularSizeOptions = DataFieldFactory.getMolecularSizeFields(tables);
    this.molecularLabelOptions = DataFieldFactory.getMolecularLabelOptions(tables);
    this.updateFields();
  }
  @Input()
  set fields(fields: Array<DataField>) {
    this.clinicalColorOptions = DataFieldFactory.getSampleColorFields(fields);
    this.clinicalShapeOptions = DataFieldFactory.getSampleShapeFields(fields);
    this.clinicalSizeOptions = DataFieldFactory.getSampleSizeFields(fields);
    this.clinicalLabelOptions = DataFieldFactory.getSampleLabelFields(fields);
    this.updateFields();
  }

  byKey(p1: DataField, p2: DataField) {
    if (p2 === null) {
      return false;
    }
    return p1.label === p2.label;
  }
  
  byN(p1: any, p2: any) {
    if (p2 == null) {
      return false;
    }
    return p1.n === p2.n;
  }
  
  customizeColorOptions(): void {
    // console.log('MJ customizeColorOptions is empty in graph-panel-visualization');
  }
  updateFields(): void {
    if (!this._config || !this.molecularColorOptions || !this.clinicalColorOptions) {
      return;
    }
    if (this.config.entity === EntityTypeEnum.GENE) {
      this.colorOptions = this.molecularColorOptions;
      this.shapeOptions = this.molecularShapeOptions;
      this.sizeOptions = this.molecularSizeOptions;
      this.labelOptions = this.molecularLabelOptions;
    } else {
      this.colorOptions = this.clinicalColorOptions;
      this.shapeOptions = this.clinicalShapeOptions;
      this.sizeOptions = this.clinicalSizeOptions;
      this.labelOptions = this.clinicalLabelOptions;
    }
    this.colorSelected = DataFieldFactory.getUndefined();
    this.shapeSelected = DataFieldFactory.getUndefined();
    this.sizeSelected = DataFieldFactory.getUndefined();
    this.labelSelected = DataFieldFactory.getUndefined();
  }

  onMarkerScaleChange(event: MatSliderChange) {
    this._config.uiOptions.markerBaseSize = event.value;
    this.threeDOption.emit({
      config: this.config,
      option: 'markerBaseSize',
      value: this._config.uiOptions.markerBaseSize
    });
  }

  findColorDecorator(){
    let dec = ChartScene.instance.views[0].chart.decorators
      .filter(v => v.type == DataDecoratorTypeEnum.COLOR);
    if (dec.length > 0) { 
      return dec[0];
    } else {
      return null;
    }
  }

  colorDecoratorHasInvisibles(){
    let dec = this.findColorDecorator();
    if (dec) {
      return (dec.legend.visibility.filter(v => v < 0.5).length > 0)
    } else {
      return false;
    }
  }

  setColorOption(event: MatSelectChange): void {
    console.log('setColorOption');
    let colorDec = this.findColorDecorator();
    console.dir(colorDec);

    // Save a LegendFilter if desired. These add/stack,
    // so we don't delete currrent one before adding a new one.
    if (this.colorDecoratorHasInvisibles()) {
      let p = window.confirm(`Do you want to save your "${colorDec.field.label}" filter?" `)
      if(p){

        let lf:LegendFilter = {
        legend: null,
        excludedValues: [],
        excludedItemIndexes: []
        }

        this.legendFilterAdd.emit({
          config: this.config,
          legendFilter: lf
        });

      }
    }

    this.colorSelected = event.value;
    if (this.colorSelected.key === 'None') {
      this.decoratorDel.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.COLOR,
          values: null,
          field: null,
          legend: null
        }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.COLOR,
          field: this.colorSelected,
          legend: null,
          values: null
        }
      });
    }
  }
  setShapeOption(event: MatSelectChange): void {
    this.shapeSelected = event.value;
    if (this.shapeSelected.key === 'None') {
      this.decoratorDel.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.SHAPE,
          values: null,
          field: null,
          legend: null
        }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.SHAPE,
          field: this.shapeSelected,
          legend: null,
          values: null
        }
      });
    }
  }
  setSizeOption(event: MatSelectChange): void {
    console.log('setSizeOption');
    this.sizeSelected = event.value;
    if (this.sizeSelected.key === 'None') {
      this.decoratorDel.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.SIZE,
          values: null,
          field: null,
          legend: null
        }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.SIZE,
          field: this.sizeSelected,
          legend: null,
          values: null
        }
      });
    }
  }
  setLabelOption(event: MatSelectChange): void {
    this.labelSelected = event.value;
    if (this.labelSelected.key === 'None') {
      this.decoratorDel.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.LABEL,
          values: null,
          field: null,
          legend: null
        }
      });
    } else {
      this.decoratorAdd.emit({
        config: this.config,
        decorator: {
          type: DataDecoratorTypeEnum.LABEL,
          field: this.labelSelected,
          legend: null,
          values: null
        }
      });
    }
  }

  setNClusters(num: number) {
    this.nClusters = num;
  }
  applyCluster(type: string) {
    this.decoratorAdd.emit({
      config: this.config,
      decorator: {
        type: DataDecoratorTypeEnum.CLUSTER_MINIBATCHKMEANS,
        field: {
          key: this.nClusters.toString(),
          label: this.nClusters.toString(),
          type: DataTypeEnum.FUNCTION,
          tbl: 'na',
          values: 'na',
          ctype: CollectionTypeEnum.UNDEFINED
        },
        legend: null,
        values: null
      }
    });
  }
  constructor(private cd: ChangeDetectorRef) {}
}
