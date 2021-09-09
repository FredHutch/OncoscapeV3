import { GraphConfig } from 'app/model/graph-config.model';
import { ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import * as THREE from 'three';
import { Mesh, Shape, ShapeGeometry, Vector2 } from 'three';
import { ILabel, LabelController, LabelOptions } from './../../../controller/label/label.controller';
import { VisualizationView } from './../../../model/chart-view.model';
import { ChartObjectInterface } from './../../../model/chart.object.interface';
import { DataDecorator } from './../../../model/data-map.model';
import { EntityTypeEnum } from './../../../model/enum.model';
import { ChartEvent, ChartEvents } from './../../workspace/chart/chart.events';
import { ChartFactory } from './../../workspace/chart/chart.factory';
import { AbstractVisualization } from './../visualization.abstract.component';
import { SurvivalConfigModel, SurvivalDataModel, SurvivalDatumModel } from './survival.model';
import { SurvivalStats } from './survival.stats';
import { OncoData } from 'app/oncoData';

export class SurvivalGraph extends AbstractVisualization {

    public set data(data: SurvivalDataModel) { this._data = data; }
    public get data(): SurvivalDataModel { return this._data as SurvivalDataModel; }
    public set config(config: SurvivalConfigModel) { this._config = config; }
    public get config(): SurvivalConfigModel { return this._config as SurvivalConfigModel; }

    public labelsForPercents: Array<ILabel>;
    public labelsForTimes: Array<ILabel>;
    public lines: Array<THREE.Line>;
    public confidences: Array<THREE.Mesh>;
    public grid: Array<THREE.Object3D>;

    private pValuesDivTexts:string = '';

    // Create - Initialize Mesh Arrays
    create(entity: EntityTypeEnum, labels: HTMLElement, events: ChartEvents, view: VisualizationView): ChartObjectInterface {
        super.create(entity, labels, events, view);
        this.confidences = [];
        this.meshes = [];
        this.lines = [];
        this.grid = [];
        this.labelsForPercents = [];
        this.labelsForTimes = [];
        this.view.camera.position.setZ(5000);
        return this;
    }

    destroy() {
        super.destroy();
        this.removeObjects();
    }

    updateDecorator(config: GraphConfig, decorators: DataDecorator[]) {
        super.updateDecorator(config, decorators);
        ChartFactory.decorateDataGroups(this.meshes, this.decorators);
    }

    updateData(config: GraphConfig, data: any): void {
        super.updateData(config, data);
        this.removeObjects();
        this.addObjects(this.config.entity);
    }

    enable(truthy: boolean): void {
        super.enable(truthy);
        this.view.controls.enableRotate = false;

        // Mouse Control Options
        // this.view.controls.maxZoom = 100;
        // this.view.controls.enableZoom = false;
        // this.view.controls.enableZoom = false;
        // this.view.camera.position.setZ(7000);
        // this.view.camera.position.setX(-400);

    }

    // Create string for <div> with all p-value statistics.
    // This gets shown when the button "i P-values" is clicked on.
    prepareValuesDivTexts(statsResults:Array<any>) {
        // originalCohorts: groupedDataTable.map(g => g.name),
        // dof: dof,
        // KMStats: KMStats,
        // pValue: pValue
        
        let s:string = `<div id='survivalStatsDiv' style='z-index: 100; display: none; background-color: #eeeeee; border-style: ridge; border-width: 1 ;` +
        `position:fixed;bottom:35px;right:10px; font-size: 15px; pointer-events: all ' ` +
        ` ><div style='margin: 8px'>`;
        if(statsResults.length ==0){
            s = s + "To see p-values, please use Params tab to show more cohorts.";
        } else {
            s = s + `<table id="survivalStatsTable" border="1" frame="hsides" rules="rows" style=" border: 1px solid lightgray;">`;
            s = s + `<thead >
            <th /><th /><th />
            <th><b>Log-rank</b></th>
            <th><b>P-value</b></th>
            </thead>`
            s = s + '<tbody>';
            statsResults.forEach(stats => {
                let cohort0 = stats.originalCohorts[0];
                let cohort1 = stats.originalCohorts[1];
                let sidebarColor0 = OncoData.instance.currentCommonSidePanel.colorOfSavedCohortByName(cohort0);
                let sidebarColor1 = OncoData.instance.currentCommonSidePanel.colorOfSavedCohortByName(cohort1);

                s = s + '<tr>';
                s = s + `<td  title="${cohort0}" width="10" bgcolor="${sidebarColor0}" >&nbsp;</td>`;
                s = s + `<td   width="3"></td>`;
                s = s + `<td  title="${cohort1}" width="10" bgcolor="${sidebarColor1}" >&nbsp;</td>`;
                s = s + `
                <td>&nbsp;${stats.KMStats[0].toFixed(5)}</td>
                <td>&nbsp;${stats.pValue.toFixed(5)}</td>
                <tr>`;
            });
            s = s + '</tbody></table>';
        }
        s = s+ "</div></div>";
        this.pValuesDivTexts = s;
    }

    addObjects(type: EntityTypeEnum): void {
        // console.log('MJ addObjects in survival');
        let self = this;

        if (this.data.result.survival === undefined) {
            return;
        }

        let stats = new SurvivalStats();
        let statsResults:Array<any> = [];

        // groupedDataTable: [{tte, ev}, ...]
        let cohorts = this.data.result.cohorts;
        if (cohorts.length > 1){
            let a = cohorts; //.map(c => c.n);   //Array.from(Array(cohorts.length).keys());
            let combinations = a.flatMap(
                (v, i) => a.slice(i+1).map( w => [v,w] )
            );
            combinations.forEach(combo => {
                // let groupedDataTable = cohorts.map(function(c)  { 
                //     return {tte: c.patients.map(i => i.t), ev: c.patients.map(i => i.e)};
                // });
                let groupedDataTable:Array<any> = [];
                let c = combo[0]; // first cohort in combo
                groupedDataTable.push (
                    {name: c.name, tte: c.patients.map(i => i.t), ev: c.patients.map(i => i.e)}
                );
                c = combo[1]; // second cohort in combo
                groupedDataTable.push (
                    {name: c.name, tte: c.patients.map(i => i.t), ev: c.patients.map(i => i.e)}
                );

                let logrankresults = stats.logranktest(groupedDataTable);
                // console.log('MJ logrank results  ...');
                statsResults.push(logrankresults);
                console.dir(logrankresults);
                    
            });

        } else {
            // console.log('MJ only one cohort (all), so no p value test.');
        }
        self.prepareValuesDivTexts(statsResults);

        const sX = scaleLinear().range([-500, 500]).domain(
            this.data.result.survival.reduce((p, c) => {
                p[0] = Math.min(p[0], c.range[0][0]);
                p[1] = Math.max(p[1], c.range[0][1]);
                return p;
            }, [Infinity, -Infinity]));
        const sY = scaleLinear().range([-500, 500]).domain(
            this.data.result.survival.reduce((p, c) => {
                p[0] = Math.min(p[0], c.range[1][0]);
                p[1] = Math.max(p[1], c.range[1][1]);
                return p;
            }, [Infinity, -Infinity]));
        self.data.result.survival.forEach((result, i) => {
            let cohortName = self.data.result.cohorts[i].name;
            if(OncoData.instance.currentCommonSidePanel) {
                let curveColor = OncoData.instance.currentCommonSidePanel.colorOfSavedCohortByName(cohortName);
                let curveColorAsInt:number = new THREE.Color(curveColor).getHex();
                self.drawLine(0, 0, result, sX, sY, i, 'Survival', curveColorAsInt);
            } else {
                console.warn('Expected colorOfSavedCohortByName in survival addObjects.');
            }
        });
        for (let x = -500; x <= 500; x += 100) {
            this.labelsForTimes.push(
                {
                    position: new THREE.Vector3(x, -500, 0),
                    userData: { tooltip: Math.round(sX.invert(x)).toString() }
                }
            );
        }
        this.drawGrid(0, 0);
        ChartFactory.configPerspectiveOrbit(this.view,
            new THREE.Box3(
                new THREE.Vector3(-500, -500, -5),
                new THREE.Vector3(500, 500, 5)));

        requestAnimationFrame(v => {
            this.onShowLabels();
        });
    }

    drawLine(xOffset: number, yOffset: number, cohort: SurvivalDatumModel,
        xScale: ScaleContinuousNumeric<number, number>, yScale: ScaleContinuousNumeric<number, number>,
        renderOrder, label: string, curveColorAsInt: number): void {
        let pts: Array<Vector2>, line: THREE.Line;

        // Confidence
        const shape = new Shape();
        shape.autoClose = false;
        const initPoint = [0, 1]; // TEMPNOTE: It was cohort.lower[0] was only [0], not [0, 1]
        let cohortLowerCopy = cohort.lower.slice();
        cohortLowerCopy[0] = [0,1];
        let cohortUpperCopy = cohort.upper.slice();
        cohortUpperCopy[0] = [0,1];

        shape.moveTo(xScale(initPoint[0]) + xOffset, yScale(initPoint[1]) + yOffset);
        cohortLowerCopy.forEach(pt => {
            shape.lineTo(xScale(pt[0]) + xOffset, yScale(pt[1]) + yOffset);
        });
        cohortUpperCopy.reverse().forEach(pt => {
            shape.lineTo(xScale(pt[0]) + xOffset, yScale(pt[1]) + yOffset);
        });

        const geometry = new ShapeGeometry(shape);
        const material = new THREE.MeshPhongMaterial({
            color: curveColorAsInt, //cohort.color,
            transparent: true,
            opacity: 0.1,
            blending: THREE.NormalBlending
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.setZ(renderOrder * 1);
        this.confidences.push(mesh);
        this.view.scene.add(mesh);

        // Line
        pts = cohort.line.map(v => new Vector2(xScale(v[0]) + xOffset, yScale(v[1]) + yOffset));

        line = ChartFactory.linesAllocate(curveColorAsInt, pts, {}); // cohort.color
        this.lines.push(line);
        this.view.scene.add(line);

    }

    drawGrid(xOffset: number, yOffset: number): void {

        for (let x = -500; x <= 500; x += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD,
                new Vector2(x + xOffset, -500 + yOffset),
                new Vector2(x + xOffset, 500 + yOffset));
            this.grid.push(line);
            this.view.scene.add(line);
        }

        let percent = 0;
        for (let y = -500; y <= 500; y += 100) {
            const line = ChartFactory.lineAllocate(0xDDDDDD,
                new Vector2(-500 + xOffset, y + yOffset),
                new Vector2(500 + xOffset, y + yOffset));
            this.grid.push(line);
            this.view.scene.add(line);

            if (percent > 0) {
                this.labelsForPercents.push({
                    position: new THREE.Vector3(-510 + xOffset, y + 6 + yOffset, 0),
                    userData: { tooltip: percent.toString() + '%' }
                });
            }
            percent += 10;
        }
    }

    handleSurvivalStatsButtonClick() {
        alert('inside handler!');
    }

    removeObjects(): void {
        this.view.scene.remove(...this.confidences);
        this.view.scene.remove(...this.meshes);
        this.view.scene.remove(...this.lines);
        this.view.scene.remove(...this.grid);
        this.confidences.length = 0;
        this.meshes.length = 0;
        this.lines.length = 0;
        this.grid.length = 0;
    }

    onMouseDown(e: ChartEvent): void { }
    onMouseUp(e: ChartEvent): void { }
    onMouseMove(e: ChartEvent): void { }

    // Label Options
    onShowLabels(): void {

        const optionsForPercents = new LabelOptions(this.view, 'PIXEL');
        optionsForPercents.fontsize = 10;
        optionsForPercents.origin = 'RIGHT';
        optionsForPercents.align = 'RIGHT';
        optionsForPercents.fontsize = 10;

        const optionsForTimes = new LabelOptions(this.view, 'PIXEL');
        optionsForTimes.fontsize = 10;

        let buttonHtml = ''; //`<i attr.data-tippy-content="Statistics"  class="handmade-icon-button material-icons md-18">info</i>`;
        buttonHtml = `<button id="survivalStatsButton" type="button" onclick='(function(){
            var div = document.getElementById("survivalStatsDiv");
            div.style.display = div.style.display == "none" ? "block" : "none";
        })()'>${buttonHtml} Statistics</button>`;

        if (this.view.camera.position.z > 10000) {
            this.labels.innerHTML =
            '<div style="position:fixed;bottom:10px;left:50%; font-size: 15px;">Time (Days)</div>' +
            this.pValuesDivTexts +
            `<div style="position:fixed;bottom:10px;right:10px; font-size: 15px; pointer-events: all">${buttonHtml}</div>` +
            '<div style="position:fixed;right:10px;top:50%; transform: rotate(90deg); font-size: 15px;">Percent</div>';
            // this.labels.innerHTML = '';
            // // '<div style="position:fixed;bottom:50px;left:30%; font-size: 1.2rem;">Time</div>' +
            // // '<div style="position:fixed;left:275px;top:50%; transform: rotate(90deg);font-size: 1.2rem;">Percent</div>';
        } else if (this.view.camera.position.z < 10000) {
            optionsForPercents.fontsize = 10;
            optionsForTimes.fontsize = 10;
            this.labels.innerHTML =
                '<div style="position:fixed;bottom:10px;left:50%; font-size: 15px;">Time (Days)</div>' +
                this.pValuesDivTexts +
                `<div style="position:fixed;bottom:10px;right:10px; font-size: 15px; pointer-events: all">${buttonHtml}</div>` +
                '<div style="position:fixed;right:10px;top:50%; transform: rotate(90deg); font-size: 15px;">Percent</div>' +
                LabelController.generateHtml(this.labelsForPercents, optionsForPercents) +
                LabelController.generateHtml(this.labelsForTimes, optionsForTimes);

            // '<div style="position:fixed;bottom:50px;left:30%; font-size: 1.2rem;">Days</div>'
            // '<div style="position:fixed;left:200px;top:50%; transform: rotate(90deg);font-size: 1.2rem;">Percent</div>';
        }
    }
}
