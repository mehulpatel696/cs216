"use strict";
var gl; // global variable


var vBuffer, vBuffer2, vPosition;
var uTime;
var cBuffer;
var cPosition;
var objId;
var vertices;
var vertices2;


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
			gl.useProgram(program);
			

			var r = 1;
			vertices = [-r,-r,-r,r,r,-r,r,-r,-r,r,r,r];
			
			vPosition = gl.getAttribLocation(program, "vPosition");
			cPosition = gl.getUniformLocation(program, "vColor");
			requestAnimationFrame(render);
			


					


			
		
};


function Square(){

	var S = {
		vertices : [],
		normals : [],
		material : {

		},
		ModelMatrix: mat4()
	}

	var numTimesToSubDivide = 6;

	function triangle(){

	}

	return S; 
}

function render(now){

			gl.clearColor(1.0, 1.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);


			
		    //Draw the first one
	        vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			
			gl.enableVertexAttribArray(vPosition);
			gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
			




            requestAnimationFrame(render);
}






