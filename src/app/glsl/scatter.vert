precision mediump float;
attribute vec3 gPositionFrom;
attribute vec3 gColor;
attribute float gShape;
attribute float gSelected;
attribute float gMarkerScale;
attribute float gVisibility; // 1 = visible, 0 = invisible


varying vec3 vColor;
varying float vShape;
varying float vSelected;
varying float vVisibility;

uniform float uAnimationPos;
uniform float uMarkerBaseSize;

void main() {
  vColor = gColor;
  vShape = gShape;
  vSelected = gSelected;
  vVisibility = gVisibility;
  
  vec4 mvPosition = modelViewMatrix * vec4(gPositionFrom * (1.0 - uAnimationPos) +position * uAnimationPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float size = uMarkerBaseSize * 6.5; // 65.0;  // default for size "3" of 8 bins.
  if (gMarkerScale > 0.0) {
    float markerBin = gMarkerScale;
    if (markerBin > 8.0) { markerBin = 8.0;}
    size = uMarkerBaseSize; //7.0;
    float stepIncrease = 22.0 ; //20.0;
    if (markerBin == 1.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 2.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 3.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 4.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 5.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 6.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin == 7.0 ) { size = size + stepIncrease * markerBin *1.0;}
    if (markerBin >= 8.0 ) { size = size + stepIncrease * markerBin *1.0;}

    /*
    if (markerBin >= 1.0 ) { size = size + stepIncrease;}
    if (markerBin >= 2.0 ) { size = size + stepIncrease;}
    if (markerBin >= 3.0 ) { size = size + stepIncrease;}
    if (markerBin >= 4.0 ) { size = size + stepIncrease;}
    if (markerBin >= 5.0 ) { size = size + stepIncrease;}
    if (markerBin >= 6.0 ) { size = size + stepIncrease;}
    if (markerBin >= 7.0 ) { size = size + stepIncrease;}
    if (markerBin >= 8.0 ) { size = size + stepIncrease;}
    */
  }

  if (vSelected == 1.0){
//    size = size + 30.0; // * 1.5;  // e.g., 75 if regular size is 50.
    size = max(size + 30.0, size * 1.5); // * 1.5;  // e.g., 75 if regular size is 50.
  }

  gl_PointSize = size / 6.0; //* ( 300.0 / -mvPosition.z );
}





// ============== old =======
// ============== old =======
// ============== old =======
/*
void main() {
  vColor = gColor;
  vShape = gShape;
  vSelected = gSelected;

  vec4 mvPosition = modelViewMatrix * vec4(gPositionFrom * (1.0 - uAnimationPos) +position * uAnimationPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float baseSize = 46.0; // 28.0; // 50
  float size = baseSize + (gMarkerScale * 2.0);
  if (vSelected == 1.0){
    size = size + 19.0; // * 1.5;  // e.g., 75 if regular size is 50.
  }
  gl_PointSize = size / 6.0; //* ( 300.0 / -mvPosition.z );
}
*/


