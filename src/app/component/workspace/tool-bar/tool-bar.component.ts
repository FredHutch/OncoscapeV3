import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { WorkspaceLayoutEnum } from 'app/model/enum.model';
import { WorkspaceConfigModel } from 'app/model/workspace.model';
// import * as dat from 'dat.gui';
declare var dat: any;

@Component({
  selector: 'app-workspace-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ToolBarComponent implements OnInit {
  hideButtons = false;

  ngOnInit(): void {}

  constructor(private cd: ChangeDetectorRef) {}
}
