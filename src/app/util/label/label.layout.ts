import { Subject } from 'rxjs/subject';
import { Observable } from 'rxjs/Observable';
import { LabelForce } from './../../util/label/label.force';
import { VisualizationView } from './../../model/chart-view.model';
import * as THREE from 'three';
import * as _ from 'lodash';

export class LabelLayout {

    private _view: VisualizationView;
    constructor(view: VisualizationView) {
        this._view = view;
    }

    private _enabled: boolean = false;
    public get enable(): boolean { return this._enabled; }
    public set enable(value: boolean) {
        if (value === this._enabled) { return; }
        if (value) {
            this._view.controls.addEventListener('change', this.onControlsChange.bind(this));
        } else {
            this._view.controls.removeEventListener('change', this.onControlsChange.bind(this));
        }
    }

    public firstChange = true;
    public onShow = new Subject<null>();
    public onHide = new Subject<null>();
    private onControlsChangeDebounce = _.debounce(this.onHide.next, 300)
    private onControlsChange(e: any): void {
        if (this.firstChange) {
            this.onHide.next();
            this.firstChange = false;
        }
        this.onControlsChangeDebounce();
    }

    static filterObjectsInFrustum(objs: Array<THREE.Object3D>, view: VisualizationView): Array<THREE.Object3D> {
        const frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(view.camera.projectionMatrix, view.camera.matrixWorldInverse));
        return objs.filter(obj => frustum.containsPoint(obj.position));
    }
    static mapLabelForces(objs: Array<THREE.Object3D>, view: VisualizationView, limit: number = 50, iterations: number = 200):
        Array<{ x: number, y: number, name: string }> {
        const w = view.viewport.width * .5;
        const h = view.viewport.height * .5;
        const data = objs.map(mesh => {
            const vector = mesh.position.clone().project(view.camera)
            vector.y = -(vector.y * h) + h;
            vector.x = (vector.x * w) + w;
            return { x: vector.x, y: vector.y, z: vector.z, name: mesh.userData.tooltip, width: 70, height: 10 };
        }).sort((a, b) => a.z - b.z);
        if (data.length > limit) {
            data.length = limit;
        }
        const anchors = data.map(datum => ({
            x: datum.x,
            y: datum.y,
            r: 0
        }));

        new LabelForce()
            .label(data)
            .anchor(anchors)
            .width(view.viewport.width)
            .height(view.viewport.width)
            .start(100);

        return data;
    }

    static reduceHtml(data: Array<{ x: number, y: number, name: string }>): string {
        return data.reduce((p, c) => {
            return p += '<div class="z-tooltip" style="left:' + c.x + 'px;top:' + c.y + 'px;">' + c.name + '</div>';
        }, '')
    }
}
