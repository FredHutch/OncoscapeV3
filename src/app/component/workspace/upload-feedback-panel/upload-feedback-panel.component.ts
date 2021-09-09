import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Input,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { GraphConfig } from '../../../model/graph-config.model';


@Component({
  selector: 'app-workspace-upload-feedback-panel',
  templateUrl: './upload-feedback-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UploadFeedbackPanelComponent {
  public tip: any = null;
  public tipIndex = 0;
  public tipCount = 0;
  private _tips: Array<any>;
  @Input()
  set tips(value: Array<any>) {
    this.tip = value[0];
    this.tipIndex = 1;
    this.tipCount = value.length;
    this._tips = value;
    this.cd.markForCheck();
  }
  get tips(): Array<any> {
    return this._tips;
  }

  @Output() hide = new EventEmitter<any>();


  hideUploadFeedback(): void {
    console.log('Hiding feedback panel from within itself.');
    this.hide.emit();
  }

  // implements AfterViewInit, OnDestroy
  // Attributes
  // @Output() hide = new EventEmitter<any>();
  // closeClick(): void {
  //   this.hide.emit();
  // }
  // private _config: GraphConfig;
  // get config(): GraphConfig { return this._config; }
  // @Input() set config(value: GraphConfig) {
  // ngOnDestroy(): void {}
  // ngAfterViewInit(): void {}

  // Call cd.refresh() when something changes
  // To Hide call this.hide.emit();
  constructor(private cd: ChangeDetectorRef) {}
}
