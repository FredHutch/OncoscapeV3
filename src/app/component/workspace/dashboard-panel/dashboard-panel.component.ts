import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ElementRef
} from '@angular/core';
import {
  pie,
  arc,
  Arc,
  DefaultArcObject,
  easeBounce,
  easeCubicInOut,
  mouse,
  rgb,
  select,
  interpolate,
  interpolateObject,
  selection,
  scaleBand,
  scaleLinear,
  range,
  ScaleBand,
  ScaleLinear,
  axisBottom,
  axisLeft,
  axisRight,
  interpolateHcl
} from 'd3';
import * as d3 from 'd3';
import { GraphConfig } from './../../../model/graph-config.model';
import { DataService } from './../../../service/data.service';
import { StatFactory } from './../../../service/stat.factory';
import { StatVegaFactory } from './../../../service/stat.vega.factory';
import { ChartTypeEnum } from '../../../model/enum.model';
import { sanitizeHtml } from '@angular/core/src/sanitization/sanitization';
import {
  Cohort,
  CohortCondition,
  CohortField
} from './../../../model/cohort.model';
import { CohortPanelComponent } from '../cohort-panel/cohort-panel.component';

declare const $: any;

// declare const vega: any;
// declare const vegaTooltip: any;

@Component({
  selector: 'app-workspace-dashboard-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard-panel.component.html',
  styleUrls: ['./dashboard-panel.component.scss']
})
export class DashboardPanelComponent implements AfterViewInit, OnDestroy {
  private statFactory: StatFactory;
  private container: any;

  @ViewChild('chartContainer') chartContainer: ElementRef;
  @Output() hide = new EventEmitter<any>();
  private _config: GraphConfig;
  get config(): GraphConfig {
    return this._config;
  }
  @Input() set config(value: GraphConfig) {
    this._config = value;
    if (this.container === undefined) {
      return;
    }
    this.drawStats();
  }

  @Input()
  cohorts: Array<Cohort> = [];

  cohortsAndNone: Array<Cohort> = [];

  cohort: Cohort; // main cohort for graph 
  cohortSecondary: Cohort;  // acohort for comparison

  ngAfterViewInit(): void {
    this.statFactory = StatFactory.getInstance(this.dataService);
    let noneCohort:Cohort = {    n: 'None',
      pids: [],
      sids: [],
      conditions: []
    }
    this.cohortsAndNone = [...this.cohorts];
    this.cohortsAndNone.unshift(noneCohort);
    this.drawStats();
  }

  onCohortChange(event) {
    console.log('cohort change...')
    console.dir(event)
  }

  onCohortSecondaryChange(event) {
    console.log('cohortSecondary change...')
    console.dir(event)
  }


  drawStats(): void {
    Promise.all([this.statFactory.getCohortsStats(this.config)]).then(results => {
      const allResults = results.reduce((p, c) => p.concat(...c), []);
      const c = this.chartContainer.nativeElement as any;
      const defaultWidth = 500;
      const defaultHeight = 400;

      console.log("==== drawstats, results... ===")
      console.dir(results);
      console.log("==== drawstats, allResults... ===")
      console.dir(allResults);
      
      c.insertAdjacentHTML(
        'beforeend',
        '<div id="chartdiv" foo="goo" style="{width:'+(defaultWidth*1.75)+'px; height:'+(defaultHeight*1.5)+'px;}"></div>'
      );

    //   // $.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]]);
    //   $(document).ready(function(){
    //     GetChart(allResults[0].stats[0]);
    //  });
     
     
    //   function GetChart(stat){
    //     // stat.data as Array<{ mylabel: string; myvalue: number; color?: any }>;
    //     $.jqplot.config.enablePlugins = true;
        
    //     var ticks = stat.data.map(v => v.mylabel);
    //     var series1 = stat.data.map(v => v.myvalue);

    //     let plot1 = $.jqplot('chartdiv', [series1], {
    //       title: stat.name.toUpperCase(),
    //       height: defaultHeight*1.5,
    //       width: 600, //defaultWidth*1.6,


    //       // Provide a custom seriesColors array to override the default colors.
    //       // Same length as stat.data.
    //       seriesColors: stat.data.map(v => "#1e88e5"),
    //       grid:{ borderWidth:1.0, background:"#FFFFFF"},
    //       animate: false , //!$.jqplot.use_excanvas,
    //       seriesDefaults:{
    //           renderer:$.jqplot.BarRenderer,
    //           pointLabels: { show: true }
    //       },
    //       axes: {
    //           xaxis: {
    //               renderer: $.jqplot.CategoryAxisRenderer,
    //               ticks: ticks
    //           }
    //       },
    //       highlighter: { show: false }
    //     });
    
    //     $('#chartdiv').bind('jqplotDataClick', 
    //         function (ev, seriesIndex, pointIndex, data) {
    //             // WOULD put data in div infor1... $('#info1').html('series: '+seriesIndex+', point: '+pointIndex+', data: '+data);
    //         }
    //     );
    //   }

      // this.drawSingleStatChart(allResults[0].stats[0], defaultWidth *1.75, defaultHeight*1.5)
      c.insertAdjacentHTML(
        'beforeend',
        '<hr />'
      );

      allResults.forEach(result => {
        // grab cohort name NEED break at cohort loop
        // tslint:disable-next-line:max-line-length
        // this.chartContainer.nativeElement.apply('<div style="font-size:1.2rem; font-weight: 300; margin-bottom:50px; margin-top:50px; text-transform:uppercase; letter-spacing: 1px; color: #1e88e5;">'
        // + result.cohort.n + '</div>');
        // tslint:disable-next-line:max-line-length
        //     this.chartContainer.nativeElement.innerHTML += '<div style="font-size:1.2rem; font-weight: 300; margin-bottom:50px; margin-top:50px; text-transform:uppercase; letter-spacing: 1px; color: #1e88e5;">'
        // + result.cohort.n + '</div>';
        // d3
        // .select(this.chartContainer.nativeElement)
        // .append('<div>hi</div>')
        c.insertAdjacentHTML(
          'beforeend',
          '<div style="font-size:1.2rem; font-weight: 300; margin-bottom:50px; margin-top:50px; text-transform:uppercase; letter-spacing: 1px; color: #1e88e5;">' +
            result.cohort.n +
            '</div>'
        );

        result.stats.forEach(stat => {
          this.drawSingleStatChart(stat, defaultWidth, defaultHeight)
        });
      }, this);
    });
  }

  drawSingleStatChart(stat, w, h){
    const myData = stat.data as Array<{ mylabel: string; myvalue: number; color?: any }>;
    const myTitle:string = stat.name; 
    
    // If starts with "%", they are percentages, so format accordingly.
    const arePercentages = myTitle.startsWith("%");


    // margins
    const margin = { top: 40, bottom: 70, left: 30, right: 10 };

    // width & height
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    // colors
    // const color = [
    //   '#e3f2fd',
    //   '#bbdefb',
    //   '#90caf9',
    //   '#29b6f6',
    //   '#64b5f6',
    //   '#42a5f5',
    //   '#2196f3',
    //   '#1e88e5',
    //   '#1976d2',
    //   '#1565c0',
    //   '#0d47a1'
    // ]; 
    const color = [
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5',
      '#42a5f5'
    ]; 

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(myData.map(d => d.mylabel))
      .range([margin.left, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(myData, d => d.myvalue)])
      .range([height, margin.top]);

    // Call yAxis & assign tick number
    const yAxis = d3.axisLeft(yScale).ticks(4);

    // Append 'svg'
    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    svg
      // add yAxis
      .append('g')
      .attr('class', 'xAxisLabels')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(yAxis);

    svg
      // draw bars
      .selectAll('rect')
      .data(myData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', function(d, i) {
        return color[i];
      })
      .attr('x', d => xScale(d.mylabel))
      .attr('width', xScale.bandwidth())
      .attr('y', height)

      .attr('y', d => yScale(d.myvalue))
      .attr('height', d => height - yScale(d.myvalue));

    svg
      // bar value labels
      .selectAll('.val-label')
      .data(myData)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.mylabel) + xScale.bandwidth() / 2)
      .attr('y', height)

      
      .attr('class', 'xAxisLabels')
      .attr('y', d => yScale(d.myvalue) - 4)
      .attr('text-anchor', 'middle')
      .text(d => arePercentages ? 
        (d.myvalue * 100).toFixed(2)+'%' : 
        d.myvalue);

    svg
      // x-axis labels
      .selectAll('.bar-label')
      .data(myData)
      .enter()
      .append('text')
      .attr('class', 'xAxisLabels')
      .attr('transform', function(d, i) {
        return (
          'translate(' +
          (xScale(d.mylabel) + xScale.bandwidth() / 2 - 8) +
          ',' +
          (height + 15) +
          ')' +
          ' rotate(45)'
        );
      })
      .attr('text-anchor', 'left')
      .text(d => d.mylabel);

    // title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text(myTitle);
  }
  
  closeClick(): void {
    this.hide.emit();
  }

  ngOnDestroy(): void {}

  constructor(private cd: ChangeDetectorRef, private dataService: DataService) {}
}
