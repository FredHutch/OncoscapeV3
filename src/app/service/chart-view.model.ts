import { ChartObjectInterface } from './../model/chart.object.interface';
// ===>import { VisualizationView } from './chart-view.model';
import { VisualizationEnum } from 'app/model/enum.model';
import { OrbitControls } from 'three-orbitcontrols-ts';
import * as THREE from 'three';


// MJ threeupdate - const OrbitControls = require('three-orbit-controls')(THREE);
/**
 * Represents A Chart View
 */
export interface VisualizationView {
  controls: OrbitControls;
  config: { visualization: VisualizationEnum };
  viewport: { x: number; y: number; width: number; height: number };
  camera: THREE.Camera;
  scene: THREE.Scene;
  chart: ChartObjectInterface;
}
