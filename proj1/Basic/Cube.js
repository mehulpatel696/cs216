/*
  Mehul Patel 
  Mohan Dhar 
  Jiwon Shin 
 */

"use strict";
var gl; // global variable
var alpha, beta, gamma;
var alpha_x = 0, beta_y = 0, gamma_z = 1;



window.onload = function init() {
			// Set up WebGL
			var canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// set clear color 
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			

			//Enable depth test
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clearDepth(1.0);
					
			
			// Load shaders and initialize attribute buffers
			var program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );

			//Slider
			var xSlider = document.getElementById("xSlider");
			xSlider.oninput = function(){ 
					alpha_x = event.srcElement.value;
					
					
			};
								
			var ySlider = document.getElementById("ySlider");
			ySlider.oninput = function(){ 
				beta_y = event.srcElement.value;
				
				
			};

			var zSlider = document.getElementById("zSlider");
			zSlider.oninput = function(){
				 gamma_z = event.srcElement.value;
			};

			var s = 0.4;
			var a = vec3(-s,-s,s);
			var b = vec3(s,-s,s);
			var c = vec3(s,s,s);
			var d = vec3(-s,s,s);		
			var e = vec3(s,s,-s);
			var f = vec3(-s,s,-s);
			var g = vec3(-s,-s,-s);
			var h = vec3(s,-s,-s);

			var vertices = [a,d,b,
							b,d,c,
							d,f,g,
							d,a,g,
							f,h,e,
							f,h,g,
							c,h,e,
							c,h,b,
							f,c,e,
							f,c,d,
							g,b,h,
							g,b,a
							];

            var R = vec3(1,0,0);
			var G = vec3(0,1,0);
			var B = vec3(0,0,1);
			var X = vec3(0.0,0.5,0.5); 
			var Y = vec3(0.5, 0, 0.5);
			var Z = vec3(0.5, 0.5, 0.0);
			var colors = [R,R,R,R,R,R,G,G,G,G,G,G,B,B,B,B,B,B,X,X,X,X,X,X,Y,Y,Y,Y,Y,Y,Z,Z,Z,Z,Z,Z];
		

			var vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

			var cBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);			
						
			// Do shader plumbing
			var vPosition = gl.getAttribLocation(program, "vPosition");
			gl.enableVertexAttribArray(vPosition);

			var vColor = gl.getAttribLocation(program,"vColor");
			gl.enableVertexAttribArray(vColor);

			gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
			gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
			gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

			
			alpha = gl.getUniformLocation(program,"alpha");
			beta = gl.getUniformLocation(program,"beta");
			gamma = gl.getUniformLocation(program,"gamma");

			requestAnimationFrame(render);

};


function render(now){

	requestAnimationFrame(render);
	
	gl.uniform1f(alpha, alpha_x);
	gl.uniform1f(beta, beta_y);
	gl.uniform1f(gamma, gamma_z);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,36);

}