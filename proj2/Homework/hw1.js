"use strict";
var gl; // global variable

//STEPS
//1. Draw a Line Segment with length 1
//2. Replace the middle third with two line segments that form an equilateral triangle

window.onload = function init() {
			// Set up WebGL
			var canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// Clear canvas
			gl.clearColor(1.0, 1.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			
			// Load shaders and initialize attribute buffers
			var program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );
			

			// var x1 = -.5;
			// var x2 = ((-.5-.5)/3);

			var levels  = 3;
			var x1 = -.5;
			var x4 = .5; 
			var vertices = [x1,0,x4,0];
			

			for(var i = 0; i < levels; i++){
				
				var new_verticies = [];
				for(var j = 0; j < vertices.length; j+=2){
					
					//Start point 
					new_verticies.push(vertices[j]);
					new_verticies.push(vertices[j+1]);


					var xFirstThird = (2/3)*(vertices[j]) + (1/3)*(vertices[j+2]);
					var yFirstThird = (2/3)*(vertices[j+1]) + (1/3)*(vertices[j+3]);
					
					var xMiddleThird = (1/3)*(vertices[j]) + (2/3)*(vertices[j+2]);
					var yMiddleThird = (1/3)*(vertices[j+1]) + (2/3)*(vertices[j+3]);

					//First Third point
					new_verticies.push(xFirstThird);
					new_verticies.push(yFirstThird);

					var x_coord_eq_triangle = (((xFirstThird + xMiddleThird)/2) + (Math.sqrt(3)/2)*(yFirstThird - yMiddleThird));
					var y_coord_eq_triangle = (((yFirstThird + yMiddleThird)/2) +  (Math.sqrt(3)/2)*(xMiddleThird - xFirstThird));

					//Triangle Point
					new_verticies.push(x_coord_eq_triangle);
					new_verticies.push(y_coord_eq_triangle);

					//End of Third Point
					new_verticies.push(xMiddleThird);
					new_verticies.push(yMiddleThird);

					//End point 
					new_verticies.push(vertices[j+2]);
					new_verticies.push(vertices[j+3]);


				}
				
				vertices = new_verticies;
				

			}

			var vBuffer = gl.createBuffer();
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			

			// Do shader plumbing
			var vPosition = gl.getAttribLocation(program, "vPosition");
			gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(vPosition);
			console.log(vertices);

			gl.drawArrays(gl.LINE_STRIP,0, (vertices.length/2));
			
		
};
