//import * as THREE from 'three';
import {
  AmbientLight,
  Camera,
  HemisphereLight,
  Line,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  DirectionalLight,
  SpotLight,
  WebGLRendererParameters
} from 'three';
import { OncoProjector } from './OncoProjector';

var THREE = require('three');

THREE.SVGObject = function ( node ) {

	THREE.Object3D.call( this );

	this.node = node;

};

THREE.SVGObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.SVGObject.prototype.constructor = THREE.SVGObject;


export class OncoSVGRenderer {

	_this = this;
  _renderData;
  _elements;
  _lights;
  _projector = new OncoProjector();
  _svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
  _svgWidth;
  _svgHeight;
  _svgWidthHalf;
  _svgHeightHalf;

  _v1; _v2; _v3;

  _clipBox = new THREE.Box2();
  _elemBox = new THREE.Box2();

  _color = new THREE.Color();
  _diffuseColor = new THREE.Color();
  _ambientLight = new THREE.Color();
  _directionalLights = new THREE.Color();
  _pointLights = new THREE.Color();
  _clearColor = new THREE.Color();
  _clearAlpha = 1;

  _vector3 = new THREE.Vector3(); // Needed for PointLight
  _centroid = new THREE.Vector3();
  _normal = new THREE.Vector3();
  _normalViewMatrix = new THREE.Matrix3();

  _viewMatrix = new THREE.Matrix4();
  _viewProjectionMatrix = new THREE.Matrix4();

  _svgPathPool = [];
  _svgNode;
  _pathCount = 0;

  _currentPath;
  _currentStyle;

  _quality = 1;
  _precision = null;

	domElement = this._svg;

	autoClear = true;
	sortObjects = true;
	sortElements = true;

	info = {
  	render: {
			vertices: 0,
			faces: 0

		}
  };

	setQuality = function ( quality ) {

		switch ( quality ) {

			case "high": this._quality = 1; break;
			case "low": this._quality = 0; break;

		}

	};

	setClearColor = function ( color, alpha ) {

		this._clearColor.set( color );
		this._clearAlpha = alpha !== undefined ? alpha : 1;

	};

	setPixelRatio = function () {};

	setSize = function ( width, height ) {

    this._svgWidth = width; 
    this._svgHeight = height;
    this._svgWidthHalf = this._svgWidth / 2;
    this._svgHeightHalf = this._svgHeight / 2;

		this._svg.setAttribute( 'viewBox', ( - this._svgWidthHalf ) + ' ' + ( - this._svgHeightHalf ) + ' ' + this._svgWidth + ' ' + this._svgHeight );
		this._svg.setAttribute( 'width', this._svgWidth );
		this._svg.setAttribute( 'height', this._svgHeight );

		this._clipBox.min.set( - this._svgWidthHalf, - this._svgHeightHalf );
		this._clipBox.max.set( this._svgWidthHalf, this._svgHeightHalf );

	};

	setPrecision = function ( precision ) {
		this._precision = precision;
	};

	removeChildNodes() {
		this._pathCount = 0;
		while ( this._svg.childNodes.length > 0 ) {
			this._svg.removeChild( this._svg.childNodes[ 0 ] );
		}
	}

	getSvgColor( color, opacity ) {
  	var arg = Math.round( color.r * 255 ) + ',' + Math.round( color.g * 255 ) + ',' + Math.round( color.b * 255 );
		if ( opacity === undefined || opacity === 1 ) return 'rgb(' + arg + ')';
		return 'rgb(' + arg + '); fill-opacity: ' + opacity;
	}

	convert( c ) {
		return this._precision !== null ? c.toFixed( this._precision ) : c;
	}

	clear = function () {
		this.removeChildNodes();
		this._svg.style.backgroundColor = this.getSvgColor( this._clearColor, this._clearAlpha );
	};

	render = function ( scene:THREE.Scene, camera:THREE.Camera ) {
		if ( camera instanceof THREE.Camera === false ) {
			console.error( 'THREE.SVGRenderer.render: camera is not an instance of THREE.Camera.' );
			return;
		}
		var background = scene.background;
		if ( background && background['isColor'] ) {
			this.removeChildNodes();
			this._svg.style.backgroundColor = this.getSvgColor( background );
		} else if ( this.autoClear === true ) {
			this.clear();
		}

		this._this.info.render.vertices = 0;
		this._this.info.render.faces = 0;

		this._viewMatrix.copy( camera.matrixWorldInverse );
		this._viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, this._viewMatrix );

		this._renderData = this._projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
		this._elements = this._renderData.elements;
		this._lights = this._renderData.lights;

		this._normalViewMatrix.getNormalMatrix( camera.matrixWorldInverse );

		this.calculateLights( this._lights );

		 // reset accumulated path
    this._currentPath = '';
    this._currentStyle = '';

		for ( var e = 0, el = this._elements.length; e < el; e ++ ) {
			var element = this._elements[ e ];


			var material = element.material;

			if ( material === undefined || material.opacity === 0 ) continue;

			this._elemBox.makeEmpty();

			if ( element instanceof THREE.RenderableSprite ) {

				this._v1 = element;
				this._v1.x *= this._svgWidthHalf; this._v1.y *= - this._svgHeightHalf;

        if (this._v1.isMatrix) {
          this.renderMatrix( this._v1, element, material );
        } else {
          if (this._v1.object.geometry.type=='CircleGeometry') {
            this.renderCircle( this._v1, element);
          } else {
            if (this._v1.object.geometry.type=='PlaneGeometry') {
              this.renderPlane( this._v1, element);
            } else {
              this.renderSprite( this._v1, element, material );
            }
          }
        }

			} else if ( element instanceof THREE.RenderableLine ) {

				this._v1 = element.v1; this._v2 = element.v2;

				// MJ: Why are line positions in pixels instead of -1 to 1?
				// Need to comment out these lines to keep lines from being 1000x
				// too big, and clipped.
				//
				//this._v1.positionScreen.x *= this._svgWidthHalf; this._v1.positionScreen.y *= - this._svgHeightHalf;
				//this._v2.positionScreen.x *= this._svgWidthHalf; this._v2.positionScreen.y *= - this._svgHeightHalf;
				this._elemBox.setFromPoints( [ this._v1.positionScreen, this._v2.positionScreen ] );

				if ( this._clipBox.intersectsBox( this._elemBox ) === true ) {

					this.renderLine( this._v1, this._v2, element, material );

				}

			} else if ( element instanceof THREE.RenderableFace ) {

				this._v1 = element.v1; this._v2 = element.v2; this._v3 = element.v3;

				if ( this._v1.positionScreen.z < - 1 || this._v1.positionScreen.z > 1 ) continue;
				if ( this._v2.positionScreen.z < - 1 || this._v2.positionScreen.z > 1 ) continue;
				if ( this._v3.positionScreen.z < - 1 || this._v3.positionScreen.z > 1 ) continue;

				this._v1.positionScreen.x *= this._svgWidthHalf; this._v1.positionScreen.y *= - this._svgHeightHalf;
				this._v2.positionScreen.x *= this._svgWidthHalf; this._v2.positionScreen.y *= - this._svgHeightHalf;
				this._v3.positionScreen.x *= this._svgWidthHalf; this._v3.positionScreen.y *= - this._svgHeightHalf;

				this._elemBox.setFromPoints( [
					this._v1.positionScreen,
					this._v2.positionScreen,
					this._v3.positionScreen
				] );

				if ( this._clipBox.intersectsBox( this._elemBox ) === true ) {

					this.renderFace3( this._v1, this._v2, this._v3, element, material );

				}

			} else {
				console.warn('cannot render');
				console.log(element);
			}

		}

		this.flushPath(); // just to flush last svg:path

		scene.traverseVisible( function ( object ) {

			 if ( object instanceof THREE.SVGObject ) {

				this._vector3.setFromMatrixPosition( object.matrixWorld );
				this._vector3.applyMatrix4( this._viewProjectionMatrix );

				var x = this._vector3.x * this._svgWidthHalf;
				var y = - this._vector3.y * this._svgHeightHalf;

				var node = object['node'];
				node.setAttribute( 'transform', 'translate(' + x + ',' + y + ')' );

				this._svg.appendChild( node );

			}

		} );

	};

	calculateLights( lights ) {

		this._ambientLight.setRGB( 0, 0, 0 );
		this._directionalLights.setRGB( 0, 0, 0 );
		this._pointLights.setRGB( 0, 0, 0 );

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];
			var lightColor = light.color;

			if ( light.isAmbientLight ) {

				this._ambientLight.r += lightColor.r;
				this._ambientLight.g += lightColor.g;
				this._ambientLight.b += lightColor.b;

			} else if ( light.isDirectionalLight ) {

				this._directionalLights.r += lightColor.r;
				this._directionalLights.g += lightColor.g;
				this._directionalLights.b += lightColor.b;

			} else if ( light.isPointLight ) {

				this._pointLights.r += lightColor.r;
				this._pointLights.g += lightColor.g;
				this._pointLights.b += lightColor.b;

			}

		}

	}

	calculateLight( lights, position, normal, color ) {

		for ( var l = 0, ll = lights.length; l < ll; l ++ ) {

			var light = lights[ l ];
			var lightColor = light.color;

			if ( light.isDirectionalLight ) {

				var lightPosition = this._vector3.setFromMatrixPosition( light.matrixWorld ).normalize();

				var amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			} else if ( light.isPointLight ) {

				var lightPosition = this._vector3.setFromMatrixPosition( light.matrixWorld );

				var amount = normal.dot( this._vector3.subVectors( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			}

		}

	}

  webColorFromColorFloat32Array(colorArray:Float32Array, colorIndex:number):string {
    let colorSlice:Array<number> = colorArray['array'].slice(colorIndex*3,colorIndex*3+4 );
    let color3d = new THREE.Color();
    color3d.setRGB(colorSlice[0].toPrecision(3), colorSlice[1].toPrecision(3), colorSlice[2].toPrecision(3))
    return this.getSvgColor( color3d , 1 )
  }

	renderSprite( v1, element, material ) {
		if(v1.object.userData.doNotPrint == null) {
			let color='black';
			let fillOpacity='0.5';
			var scaleX = element.scale.x * this._svgWidthHalf;
			var scaleY = element.scale.y * this._svgHeightHalf;

			if ( material.isPointsMaterial ) {
				scaleX *= material.size;
				scaleY *= material.size;
			}

			if (v1.object.geometry.attributes.gColor) {
				if (v1.originalIndex > -1) {
					color = this.webColorFromColorFloat32Array(v1.object.geometry.attributes.gColor, v1.originalIndex);
				}
				let cx:number = this.convert( v1.x - scaleX * 0.5  );
				let cy:number = this.convert( v1.y - scaleY * 0.5 ); 
				let radius = 3;
				let borderWidth = radius * 0.1; // 0.3;
				this.addCircle(cx, cy, radius, color, fillOpacity, borderWidth, v1.object.userData.idDataForSvg);
			} else {
				console.error('MJ Sprite rendering without gColor attributes.');      
			}
		}
	}

  rgbIntToHex = function (rgb) { 
    var hex = '000000' + Number(rgb).toString(16);
    return '#' + hex.substr(-6);
  };

	renderCircle( v1, element ) {
		if(v1.object.userData.doNotPrint == null) {

			let color='black';
			let fillOpacity='1.0';
			var scaleX = element.scale.x * this._svgWidthHalf;
			var scaleY = element.scale.y * this._svgHeightHalf;

			color = this.rgbIntToHex(v1.object.userData.color);
			let cx:number = this.convert( v1.x - scaleX * 0.5  );
			let cy:number = this.convert( v1.y - scaleY * 0.5 ); 
			let radius = v1.object.userData.radius;
			this.addCircle(cx, cy, radius, color, fillOpacity, '', v1.object.userData.idDataForSvg);
		}
	}

	renderPlane( v1, element ) {
		if(v1.object.userData.doNotPrint == null) {
			let color='black';
			let fillOpacity='1.0';
			var scaleX = element.scale.x * this._svgWidthHalf;
			var scaleY = element.scale.y * this._svgHeightHalf;

			// NOTE: For PlaneGeometry, x,y is the CENTER of the rect.
			// We need to offset to the top,left corner.
			color = this.rgbIntToHex(v1.object.userData.color);
			let x:number = this.convert( v1.x - scaleX * 0.5  );
			let y:number = this.convert( v1.y - scaleY * 0.5 ); 
			// let width = v1.object.userData.width;
			// let height = v1.object.userData.height;
			let width = this.convert( v1.object.userData.width - scaleX * 0.5  )
			let height = this.convert( v1.object.userData.height - scaleY * 0.5  )
			let startX = x - (width / 2.0);
			let startY = y - (height / 2.0);
			this.addRectangle(startX, startY, width, height, color, fillOpacity, '', v1.object.userData.idDataForSvg);
		}
	}

	renderMatrix( v1, element, material ) {
		if(v1.object.userData.doNotPrint == null) {
			let color='orange';
			var scaleX = element.scale.x * this._svgWidthHalf;
			var scaleY = element.scale.y * this._svgHeightHalf;

			// // if ( material.isPointsMaterial ) {
			// // 	scaleX *= material.size;
			// // 	scaleY *= material.size;
			// // }

			// // if ( material.isSpriteMaterial || material.isPointsMaterial ) {
			// // 	style = 'fill:' + this.getSvgColor( material.color, material.opacity );
			// // }

			if (v1.object.geometry.attributes.color) {
				console.log(`MJ in renderMatrix. color count=${v1.object.geometry.attributes.color.length}.`);

				if (v1.originalIndex > -1) {
					color = this.webColorFromColorFloat32Array(v1.object.geometry.attributes.color, v1.originalIndex);
				}
				let x:number = this.convert( v1.x - scaleX * 0.5  );
				let y:number = this.convert( v1.y - scaleY * 0.5 ); 

				let matrixSettings = v1.object.userData.matrixSettings;
					// numSampleColumns: this.data.colors.length,
					// numGenes: this.data.colors[0].length,
					// squareSize: squareSize

				let cellSpacing = this.convert( matrixSettings.squareSize / 2.0 ); // center to center of next cell
				let cellWidth = this.convert( matrixSettings.squareSize / 2.3 );  // width of colored part of cell
				let cellWidthStr = cellWidth.toPrecision(6);
				var drawCell = ' h ' + cellWidthStr + ' v -' + cellWidthStr + ' h -' + cellWidthStr + ' v ' + cellWidthStr + ' z ';

				// // original, every cell is a separate path.
				// console.log(`MJ matrixSettings = ${JSON.stringify(matrixSettings)}.`);
				// var colorIndex:number = 0;
				// var currentX = 0 - (cellSpacing / 2.0);
				// var currentXPrecision:string = '';
				// var currentYPrecision:string = '';
				// for(let sampleCol=0; sampleCol < matrixSettings.numSampleColumns; sampleCol++){
				//   var currentY = 0 + (cellSpacing / 2.0);
				//   console.log(`column #${sampleCol}.`);
				//   currentXPrecision = currentX.toPrecision(6);
				//   for(let geneRow=0; geneRow < matrixSettings.numGenes; geneRow++){
				//     currentYPrecision = currentY.toPrecision(6);
				//     color = this.webColorFromColorFloat32Array(v1.object.geometry.attributes.color, colorIndex);
				//     var pathString = '';
				//     pathString = pathString + ' M ' + currentXPrecision + ' ' + currentYPrecision + ' ';
				//     pathString = pathString +  drawCell;
			
				//     let pathNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				//     pathNode.setAttribute( 'd', pathString );
				//     pathNode.setAttribute( 'fill', color );
				//     this._svg.appendChild( pathNode );
				//     currentY = (currentY - cellSpacing);
				//     colorIndex++;
				//   }
				//   currentX = currentX + cellSpacing;
				// }


				// Build list of color values seen, and for each color value, a list of 
				// cell locations. Then, we'll loop through it all again to render to SVG.
				let colorsSeen = {};

				console.log(`MJ matrixSettings = ${JSON.stringify(matrixSettings)}.`);
				var currentX = 0 - (cellSpacing / 2.0);
				var currentXPrecision:string = '';
				var currentYPrecision:string = '';
				var colorIndex:number = 0; // this index * 3 is the actual index into the RGB .color array.
				for(let sampleCol=0; sampleCol < matrixSettings.numSampleColumns; sampleCol++){
					var currentY = 0 + (cellSpacing / 2.0);
					currentXPrecision = currentX.toPrecision(6);
					for(let geneRow=0; geneRow < matrixSettings.numGenes; geneRow++){
						currentYPrecision = currentY.toPrecision(6);
						color = this.webColorFromColorFloat32Array(v1.object.geometry.attributes.color, colorIndex);
						if (colorsSeen[color] == null) {
							colorsSeen[color] = [];
						}
						let cell = {
							x: currentXPrecision,
							y: currentYPrecision
						}
						colorsSeen[color].push(cell);
						currentY = (currentY - cellSpacing);
						colorIndex++;
					}
					currentX = currentX + cellSpacing;
				}

				console.log('Now to write out each cell list for each color seen...');
				for (var colorSeen of Object.keys(colorsSeen)) {
					let pathNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
					var pathString = '';
					colorsSeen[colorSeen].forEach(function (element) {
						pathString = pathString + ' M ' + element.x + ' ' + element.y + ' ';
						pathString = pathString +  drawCell;
					});
					pathString = pathString + "\n";
					pathNode.setAttribute( 'd', pathString );
					pathNode.setAttribute( 'fill', colorSeen );
					this._svg.appendChild( pathNode );
				}

			} else {
				console.error('MJ Matrix rendering without gColor attributes.');      
			}
		}
	}

	renderLine( v1, v2, element, material ) {
		var path = 'M' + this.convert( v1.positionScreen.x ) + ',' + this.convert( v1.positionScreen.y ) + 'L' + this.convert( v2.positionScreen.x ) + ',' + this.convert( v2.positionScreen.y );
		if ( material.isLineBasicMaterial ) {
			var style = 'fill:none;stroke:' + this.getSvgColor( material.color, material.opacity ) + ';stroke-width:' + material.linewidth + ';stroke-linecap:' + material.linecap;
			if ( material.isLineDashedMaterial ) {
				style = style + ';stroke-dasharray:' + material.dashSize + "," + material.gapSize;
			}

			this.addPath( style, path );

		}
	}

	renderFace3( v1, v2, v3, element, material ) {

		this._this.info.render.vertices += 3;
		this._this.info.render.faces ++;

		var path = 'M' + this.convert( v1.positionScreen.x ) + ',' + this.convert( v1.positionScreen.y ) + 'L' + this.convert( v2.positionScreen.x ) + ',' + this.convert( v2.positionScreen.y ) + 'L' + this.convert( v3.positionScreen.x ) + ',' + this.convert( v3.positionScreen.y ) + 'z';
		var style = '';

		if ( material.isMeshBasicMaterial ) {

			this._color.copy( material.color );

			if ( material.vertexColors === THREE.FaceColors || material.vertexColors === THREE.VertexColors ) {

				this._color.multiply( element.color );

			}

		} else if ( material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial ) {

			this._diffuseColor.copy( material.color );

			if ( material.vertexColors === THREE.FaceColors || material.vertexColors === THREE.VertexColors ) {

				this._diffuseColor.multiply( element.color );

			}

			this._color.copy( this._ambientLight );

			this._centroid.copy( v1.positionWorld ).add( v2.positionWorld ).add( v3.positionWorld ).divideScalar( 3 );

			this.calculateLight( this._lights, this._centroid, element.normalModel, this._color );

			this._color.multiply( this._diffuseColor ).add( material.emissive );

		} else if ( material.isMeshNormalMaterial ) {

			this._normal.copy( element.normalModel ).applyMatrix3( this._normalViewMatrix );

			this._color.setRGB( this._normal.x, this._normal.y, this._normal.z ).multiplyScalar( 0.5 ).addScalar( 0.5 );

		}

		if ( material.wireframe ) {

			style = 'fill:none;stroke:' + this.getSvgColor( this._color, material.opacity ) + ';stroke-width:' + material.wireframeLinewidth + ';stroke-linecap:' + material.wireframeLinecap + ';stroke-linejoin:' + material.wireframeLinejoin;

		} else {

			style = 'fill:' + this.getSvgColor( this._color, material.opacity );

		}

		this.addPath( style, path );

	}

  addCircle(cx, cy, radius, fill:string, fillOpacity, borderWidth, idDataForSvg) {
    let circleNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
    circleNode.setAttribute( 'cx', cx);
    circleNode.setAttribute( 'cy', cy);
    circleNode.setAttribute( 'r', radius);
    if (fill != null && fill != '') {
      circleNode.setAttribute( 'fill', fill );
    }
    if (borderWidth > '') {
      circleNode.setAttribute( 'stroke', 'black' );
      circleNode.setAttribute( 'stroke-width', borderWidth);
      circleNode.setAttribute( 'stroke-opacity', fillOpacity);
    }
    circleNode.setAttribute( 'fill-opacity', fillOpacity );
		if(idDataForSvg != null) {
			circleNode.setAttribute( 'id', idDataForSvg );
		}
    this._svg.appendChild( circleNode );
  }

  addRectangle(cx, cy, width:number, height:number, fill:string, fillOpacity, borderWidth, idDataForSvg) {
    let rectNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );

    rectNode.setAttribute( 'x', cx );
    rectNode.setAttribute( 'y', cy );
    rectNode.setAttribute( 'width', Math.abs(width).toString() );
    rectNode.setAttribute( 'height', Math.abs(height).toString() );
    rectNode.setAttribute( 'fill', fill);
    rectNode.setAttribute( 'stroke', 'transparent');
		rectNode.setAttribute( 'fill-opacity', fillOpacity );
		if(idDataForSvg != null) {
			rectNode.setAttribute( 'id', idDataForSvg );
		}
    this._svg.appendChild( rectNode );
  }

  addPath( style, path ) {
		if ( this._currentStyle === style ) {
			this._currentPath += path;
		} else {
			this.flushPath();
			this._currentStyle = style;
			this._currentPath = path;
		}
	}

	flushPath() {
		if ( this._currentPath ) {
			this._svgNode = this.getPathNode( this._pathCount ++ );
			this._svgNode.setAttribute( 'd', this._currentPath );
			this._svgNode.setAttribute( 'style', this._currentStyle );
			this._svg.appendChild( this._svgNode );
		}

		this._currentPath = '';
		this._currentStyle = '';

	}

	getPathNode( id ) {
		if ( this._svgPathPool[ id ] == null ) {
			this._svgPathPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
			if ( this._quality == 0 ) {
				this._svgPathPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed
			}
			return this._svgPathPool[ id ];
		}
		return this._svgPathPool[ id ];
	}

}
