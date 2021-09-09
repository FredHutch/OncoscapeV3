import { OncoSVGRenderer } from './OncoSVGRenderer';
var THREE = require('three');

/*
*  Original three-to-svg.js from marciot, https://github.com/marciot/blog-demos/blob/master/three-to-svg/three-to-svg.js
*  Adaptions by Matt Jensen at fredhutch.org.
*
* To use, call init(), then svgSnapshot.
*/

/* This THREE.js demo was adapted from:
 *
 *   http://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
 *
 * The idea for rendering to SVG came from:
 *
 *   http://blog.felixbreuer.net/2014/08/05/using-threejs-to-create-vector-graphics-from-3d-visualizations.html
 */


export class ThreeToSvg {
  private canvas_3tosvg: any;
    
  public init(canvas: any) {
    this.canvas_3tosvg = canvas;
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  private removeChildrenFromNode(node) {
    var fc = node.firstChild;
    while( fc ) {
      node.removeChild( fc );
      fc = node.firstChild;
    }
  }

  public svgSnapshot(views:Array<any>):string {
    var svgContainer = document.getElementById("svgForExport");
    //document.getElementById("element").style.display = "none"
    this.removeChildrenFromNode(svgContainer);
    var width  = this.canvas_3tosvg.width;  // svgContainer.getBoundingClientRect().width;
    var height = this.canvas_3tosvg.height; // svgContainer.getBoundingClientRect().height;
    console.log(`MJ setting svg size to ${width}, ${height}.`);

    let svgRenderer =  new OncoSVGRenderer();  //new THREE['SVGRenderer'](); //  THREE.SVGRenderer();
    svgRenderer.setClearColor( 0xffffff, null );
    svgRenderer.setSize(width,height );
    svgRenderer.setQuality( 'high' );
    svgContainer.appendChild( svgRenderer.domElement );

    if(views.length >0){
      let v = views[0]; // TEMPNOTE: Was for each view.
      // //svgRenderer.setViewport(v.viewport.x, v.viewport.y, v.viewport.width, v.viewport.height);
      svgRenderer.render(v.scene, v.camera); // was new camera);
    }
  

    //svgRenderer.render( this.scene_3tosvg, this.camera_3tosvg );
    
    /* The following discussion shows how to scale an SVG to fit its contained
    *
    *  http://stackoverflow.com/questions/4737243/fit-svg-to-the-size-of-object-container
    *
    * Another useful primer is here
    *  https://sarasoueidan.com/blog/svg-coordinate-systems/
    */
    // svgRenderer.domElement.removeAttribute("width");
    // svgRenderer.domElement.removeAttribute("height");
    return svgContainer.innerHTML;
  }

}