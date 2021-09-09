import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { MatSelectChange, MatButtonToggle } from '@angular/material';
import { ModalService } from 'app/service/modal-service';
import { Subject } from 'rxjs';
import { GeneSet } from './../../../model/gene-set.model';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataService } from './../../../service/data.service';
declare var $: any;

@Component({
  selector: 'app-workspace-geneset-panel',
  styleUrls: ['./geneset-panel.component.scss'],
  templateUrl: './geneset-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class GenesetPanelComponent implements AfterViewInit, OnDestroy {
  @Input() genesets: Array<GeneSet> = [];
  @Output() addGeneset: EventEmitter<{ database: string; geneset: GeneSet }> = new EventEmitter();
  @Output() delGeneset: EventEmitter<{ database: string; geneset: GeneSet }> = new EventEmitter();
  @Output() updateGeneset: EventEmitter<{ database: string; geneset: GeneSet }> = new EventEmitter();
  $genesetFilter: Subject<any>;
  buildType: 'CURATED' | 'CUSTOM' | 'CONDITIONAL' = 'CURATED';
  genesetFilter = '';
  genesetCategories: Array<{ c: string; n: string; d: string }>;
  genesetCategory: { c: string; n: string; d: string };
  genesetOptions: Array<any>;
  genesetOptionsFilter: Array<any>;
  public customName = '';
  public customGenes = '';

  // Attributes
  private _config;
  get config(): GraphConfig {
    return this._config;
  }
  @Input()
  set config(config: GraphConfig) {
    this._config = config;
  }

  @Output() hide: EventEmitter<any> = new EventEmitter();

  closeClick() {
    this.hide.emit();
  }
  setBuildType(e: any): void {
    this.buildType = e.target.value;
    // this.cd.detectChanges();
  }

  createCustomGeneSet(e: any): void {
    console.log('in createCustomGeneSet.');
    let genesetCreationNameElement = document.getElementsByClassName('geneset-creation-name')[0];
    let genesetCreationTextElement = document.getElementsByClassName('geneset-creation-text')[0];

    let rawGenesetText = genesetCreationTextElement['value'];
    this.customGenes = rawGenesetText.trim()
      .toUpperCase()
      .replace(/[, \n\t]+/g, ",");
    let genes:Array<string> = this.customGenes.split(',').map(v => v.trim().toUpperCase());
    this.customName = genesetCreationNameElement['value'];
    console.log('Saving genes as: ' + this.customName);
    console.log('Saving genes: ' + this.customGenes);
    this.addGeneset.emit({ database: this.config.database, geneset: { n: this.customName, g: genes } });

    // Now empty the fields.
    genesetCreationNameElement['value'] = '';
    genesetCreationTextElement['value'] = '';
    //window.setTimeout(function(){alert(`Saved gene set ${name}!`);}, 300);
  }

  genesetCategoryChange(e: MatSelectChange): void {
    const genesetCode = e.value.c;
    this.genesetOptions = [];
    this.dataService
      .getGeneSetByCategory(genesetCode)
      .toPromise()
      .then(v => {
        v.forEach(geneset => {
          geneset.name = geneset.sname.replace(/_/gi, ' ');
        });
        this.genesetOptions = v;
        this.genesetOptionsFilter = this.genesetOptions;
        this.cd.detectChanges();
      });
  }

  onGenesetFilterChange(criteria: string): void {
    // If term has "." at end, it means treat it as a complete gene.
    // For example, "ICAM" matches "ICAM", "ICAM1", "ICAM2",
    // but "ICAM." matches only "ICAM".
    // Implement this by turning a "." into a ",", which matches against hugo concat string.
    const terms = criteria
      .replace(/[, \n\t]+/g, " ").trim() // TUrn any sequence of commas/spaces into a single space.
      .split(' ')
      .map(v => {
         return v.toUpperCase().replace('.', ',').trim()
      })
      .filter(v => v.length > 1);
    this.genesetOptionsFilter = this.genesetOptions.filter(v => {
      const haystack = (v.name + ' ' + v.desc + ' ' + v.summary + ' ' + v.hugo +', ').toUpperCase();
      for (let i = 0; i < terms.length; i++) {
        if (haystack.indexOf(terms[i]) === -1) {
          return false;
        }
      }
      return true;
    });
    this.cd.detectChanges();
  }

  geneSetDel(v: any): void {
    if (this.genesets.length === 1) {
      alert('Please keep at least one geneset in your list of options.');
      return;
    }
    if (window.confirm('Are you sure you want to delete that gene set?')) {
      this.delGeneset.emit({ database: this.config.database, geneset: v });
    }
  }

  geneSetAdd(v: any): void {
    const name = v.name.toLowerCase().trim();
    if (name.length === 0) {
      alert('Please specify a name for this geneset');
      return;
    }
    if (this.genesets.find(gs => gs.n === name)) {
      alert(name + ' has already been added to your list of options.');
      return;
    }
    this.addGeneset.emit({
      database: this.config.database,
      geneset: { n: name, g: v.genes.map(w => w.toUpperCase()) }
    });
  }

  geneSetEdit(v: GeneSet): void {

    let genes = v.g.join(' ');
    let newGenes = prompt(`Genes for "${v.n}":`, genes);
    if (newGenes == null) { return; }  // User chose "Cancel"

    // TBD: Trim up newGenes, ensuring only one space between each item,
    // then turn into array of names.
    alert(`Saving edits: ${newGenes}`);
    let newGeneSet = {
       n: v.n, 
       g: newGenes.toUpperCase().split(' ').filter(x => x != '')
    };

    this.updateGeneset.emit({
      database: this.config.database,
      geneset: newGeneSet
    });
  }

  ngOnDestroy(): void {
    this.$genesetFilter.unsubscribe();
  }

  ngAfterViewInit(): void {}

  constructor(private cd: ChangeDetectorRef, private dataService: DataService, public ms: ModalService) {
    const categories = this.dataService.getGenesetCategories();
    const geneset = this.dataService.getGeneSetByCategory('H|NA').toPromise();
    Promise.all([categories, geneset]).then(response => {
      response[1].forEach(v => {
        v.name = v.sname.replace(/_/gi, ' ');
        v.hugo = v.genes.join(',');
      });
      this.genesetCategories = response[0].map(v => ({ n: v.name, c: v.code, d: v.desc }));
      this.genesetCategory = this.genesetCategories[0];
      this.genesetOptions = response[1];
      this.genesetOptionsFilter = this.genesetOptions;
      this.cd.detectChanges();
    });
    this.$genesetFilter = new Subject();
    this.$genesetFilter
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(this.onGenesetFilterChange.bind(this));
  }
}
