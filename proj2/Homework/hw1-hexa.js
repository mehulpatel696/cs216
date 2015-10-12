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
			

			var r = .4;
			var r_half = r/2; 
			var top = (Math.sqrt(3)/2)*r;
			vertices = [ -r, 0, -r_half, top,-r_half, -top, r_half, top,r_half, -top, r,0];
			
			vPosition = gl.getAttribLocation(program, "vPosition");
						


			var r2 = .05;
			var r2_half = r2/2; 
			var top2 = (Math.sqrt(3)/2)*r2;
			vertices2 = [ -r2 + .5, 0 + .5, -r2_half + .5, top2 + .5,-r2_half + .5, -top2 + .5, r2_half + .5, top2 + .5,r2_half + .5, -top2 + .5, r2 + .5,0 + .5]
			
			uTime = gl.getUniformLocation(program,"Time");
			objId = gl.getUniformLocation(program,"objId");
			cPosition = gl.getUniformLocation(program, "vColor");
			requestAnimationFrame(render);
			


					


			
		
};


function render(now){

			gl.clearColor(1.0, 1.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);


			gl.uniform1f(objId, 1.0);
			gl.uniform1f(uTime, now);
		    //Draw the first one
	        vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			
			gl.enableVertexAttribArray(vPosition);
			gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
			

		  
			gl.uniform1f(objId, 0.0);
			gl.uniform1f(uTime, now);
			//Draw the second one
	        vBuffer2 = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
			
			gl.enableVertexAttribArray(cPosition);
			gl.vertexAttribPointer(cPosition, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);


            requestAnimationFrame(render);
}






