import { GraphConfig } from 'app/model/graph-config.model';
//import { Renderer, OrbitControls } from 'three';
import { ChartObjectInterface } from './../model/chart.object.interface';
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

/**
 * Represents A Chart View
 */
export interface VisualizationView {
  controls: OrbitControls;
  config: GraphConfig; // {visualization: VisualizationEnum};
  renderer: THREE.Renderer;
  viewport: { x: number; y: number; width: number; height: number };
  camera: THREE.Camera;
  scene: THREE.Scene;
  chart: ChartObjectInterface;
}
