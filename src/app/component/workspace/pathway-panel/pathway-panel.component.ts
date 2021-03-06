
import {distinctUntilChanged, debounceTime} from 'rxjs/operators';
import { Pathway } from './../../../model/pathway.model';
import { getPathways } from './../../../reducer/index.reducer';
import { GeneSet } from './../../../model/gene-set.model';
import { Observable } from 'rxjs/Rx';
import { ModalService } from 'app/service/modal-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from './../../../service/data.service';
import { GraphConfig } from './../../../model/graph-config.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { DataField } from 'app/model/data-field.model';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { VisualizationEnum, DirtyEnum } from 'app/model/enum.model';
import { Legend } from 'app/model/legend.model';
import { Subscription ,  Subject } from 'rxjs';
import * as _ from 'lodash';
import { MatSelectChange } from '@angular/material';
declare var $: any;

@Component({
  selector: 'app-workspace-pathway-panel',
  styleUrls: ['./pathway-panel.component.scss'],
  templateUrl: './pathway-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PathwayPanelComponent implements AfterViewInit, OnDestroy {
  @Input()
  pathways: Array<GeneSet> = [];
  @Output()
  addPathway: EventEmitter<{
    database: string;
    pathway: Pathway;
  }> = new EventEmitter();
  @Output()
  delPathway: EventEmitter<{
    database: string;
    pathway: Pathway;
  }> = new EventEmitter();
  $pathwayFilter: Subject<any>;
  pathwayFilter = '';
  pathwayCategories: Array<{ c: string; n: string; d: string }>;
  pathwayCategory: { c: string; n: string; d: string };
  pathwayOptions: Array<any>;
  pathwayOptionsFilter: Array<any>;

  // Attributes
  private _config;
  get config(): GraphConfig {
    return this._config;
  }
  @Input()
  set config(config: GraphConfig) {
    this._config = config;
  }

  @Output()
  hide: EventEmitter<any> = new EventEmitter();

  closeClick() {
    this.hide.emit();
  }

  pathwayCategoryChange(e: MatSelectChange): void {
    const pathwayCode = e.value.c;
    this.pathwayOptionsFilter = this.pathwayOptions.filter(
      v => v.dataSource === pathwayCode
    );
    this.cd.detectChanges();
  }

  onPathwayFilterChange(criteria: string): void {
    const terms = criteria
      .split(' ')
      .map(v => v.toUpperCase().trim())
      .filter(v => v.length > 1);
    this.pathwayOptionsFilter = this.pathwayOptions.filter(v => {
      const haystack = (v.name + ' ' + v.summary).toUpperCase();
      for (let i = 0; i < terms.length; i++) {
        if (haystack.indexOf(terms[i]) === -1) {
          return false;
        }
      }
      return true;
    });
    this.cd.detectChanges();
  }

  pathwayDel(v: any): void {
    if (this.pathways.length === 1) {
      alert('Please keep at least one pathway in your list of options.');
      return;
    }
    this.delPathway.emit({ database: this.config.database, pathway: v });
  }

  pathwayAdd(v: any): void {
    const name = v.name.toLowerCase();
    if (this.pathways.find(gs => gs.n === name)) {
      alert(name + ' has already been added to your list of options.');
      return;
    }
    this.addPathway.emit({
      database: this.config.database,
      pathway: { n: name, uri: v.uri }
    });
  }

  ngOnDestroy(): void {
    this.$pathwayFilter.unsubscribe();
  }

  ngAfterViewInit(): void {}

  constructor(
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    public ms: ModalService
  ) {
    const categories = this.dataService.getPathwayCategories();
    const pathways = this.dataService.getPathways();
    Promise.all([categories, pathways]).then(results => {
      this.pathwayCategories = results[0].filter(v => v.n !== 'KEGG Pathway');

      this.pathwayCategory = this.pathwayCategories[0];
      this.pathwayOptions = results[1]['searchHit'].map(v => ({
        name: v.name,
        uri:
          'https://oncoscape.v3.sttrcancer.org/data/pathways/' +
          v.uri.replace(/\//gi, '_').replace(':', '_') +
          '.json.gz',
        dataSource: v.dataSource[0],
        summary:
          v.numParticipants + ' Participants | ' + v.numProcesses + ' Processes'
      }));

      const pathwayCode = this.pathwayCategories[0].c;
      this.pathwayOptionsFilter = this.pathwayOptions.filter(
        v => v.dataSource === pathwayCode
      );
      this.cd.detectChanges();
    });
    this.$pathwayFilter = new Subject();
    this.$pathwayFilter.pipe(
      debounceTime(300),
      distinctUntilChanged(),)
      .subscribe(this.onPathwayFilterChange.bind(this));
  }
}
