precision mediump float;
attribute vec3 gPositionFrom;
attribute vec3 gColor;
attribute float gShape;
attribute float gSelected;
attribute float gMarkerScale;


varying vec3 vColor;
varying float vShape;
varying float vSelected;

uniform float uAnimationPos;

void main() {
  vColor = gColor;
  vShape = gShape;
  vSelected = gSelected;

  vec4 mvPosition = modelViewMatrix * vec4(gPositionFrom * (1.0 - uAnimationPos) +position * uAnimationPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float size = gMarkerScale; //   50.0;
  if (vSelected == 1.0){
    size = size * 1.5;  // e.g., 75 if regular size is 50.
  }
  gl_PointSize = size;  //       / 7.0; // * ( 300.0 / -mvPosition.z );
}
