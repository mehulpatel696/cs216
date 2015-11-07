/*
Mehul Patel
Mohan Dhar
*/


"use strict";
var gl; // global variable
var time, program, objId; 
var vPosition;
var vertices1, vertices2;
var colors1, colors2;
var vBuffer1, vBuffer2;
var cBuffer1, cBuffer2;
var M, uM, Mcam, P;
var eye, at, up;
var eye_z = 3;

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
			program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );

			document.body.onkeydown = function(e){
				console.log(e.keyCode);
				key_pressed(e);

			    //alert(String.fromCharCode(e.keyCode)+" --> "+e.keyCode);
			};

			// PLANE
			var t = 1;
			var l = vec3(-t, 0, t);
			var i = vec3(t, 0, t);
			var j = vec3(t, 0, -t);
			var m = vec3(-t, 0, -t);

			var s = 0.4;
			var a = vec3(-s,-s + s, s);
			var b = vec3(s,-s + s,s);
			var c = vec3(s,s + s,s);
			var d = vec3(-s,s + s,s);		
			var e = vec3(s,s + s,-s);
			var f = vec3(-s,s + s,-s);
			var g = vec3(-s,-s + s,-s);
			var h = vec3(s,-s + s,-s);


			vertices1 = [l,i,j,j,l,m];

			vertices2 = [a,d,b,
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
							g,b,a];

			var R = vec3(1,1,0);
			var G = vec3(0,1,0);
			var B = vec3(0,0,1);
			var X = vec3(0.0,0.5,0.5); 
			var Y = vec3(0.5, 0, 0.5);
		    var Z = vec3(0.5, 0.5, 0.0);

		    colors1 = [G,G,G,G,G,G];
			colors2 = [R,R,R,R,R,R,G,G,G,G,G,G,B,B,B,B,B,B,X,X,X,X,X,X,Y,Y,Y,Y,Y,Y,Z,Z,Z,Z,Z,Z];
			

			// Do shader plumbing
			vPosition = gl.getAttribLocation(program, "vPosition");
			gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
			
			time = gl.getUniformLocation(program,"time");
			objId = gl.getUniformLocation(program,"objId");
			uM = gl.getUniformLocation(program, "M");

			eye = vec3(0,1,eye_z);
			at = vec3(0,0,0);
			up = vec3(0,1,0);
			Mcam = cameraMatrix(eye,at,up);
			
			P = perspectiveMatrix(90,1,0.1,10);

			//P = orthoProjMatrix(1,-1,1,-1,-0.1,-10);
			M = mult(P, Mcam);

			gl.uniformMatrix4fv(uM, gl.FALSE, flatten(M));
			

			requestAnimationFrame(render);

};


function render(now){

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	vBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices1), gl.STATIC_DRAW);

	cBuffer1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer1);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors1), gl.STATIC_DRAW);

	
	vBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);

	cBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW);		

	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);			
				
	var vColor = gl.getAttribLocation(program,"vColor");
	gl.enableVertexAttribArray(vColor);

	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer1);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer1);
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

	gl.uniform1f(time, now * 0.007);
	gl.uniform1f(objId, 0.0);

	gl.drawArrays(gl.TRIANGLES,0, 6);



	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer2);
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer2);
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

	gl.uniform1f(objId, 1.0);

	gl.drawArrays(gl.TRIANGLES,0,36);




	requestAnimationFrame(render);



}

var thetaY = 0;
var thetaX = 0;
var matrixX = mat4();
var matrixY = mat4();
var translationZ = 3;

function key_pressed(e){

	var code = e.keyCode;
	if(code === 37 || code === 38 || code === 39 || code === 40 || code === 65 || code === 90) {
		
		if (code === 65){
			eye_z -= 0.1;
			eye = vec3(0,1, eye_z);
		}
		else if (code === 90){
			eye_z += 0.1;
			eye = vec3(0,1, eye_z);
		}

		if (code === 37) thetaY -= 5;
		else if (code === 39) thetaY += 5;

		if (code === 37 || code === 39) {

			var rowX = vec4(Math.cos(thetaY * (Math.PI/180)), 0, Math.sin(thetaY * (Math.PI/180)), 0);
			var rowY = vec4(0,1,0,0);
			var rowZ = vec4(-Math.sin(thetaY * (Math.PI/180)), 0, Math.cos(thetaY * (Math.PI/180)), 0);
			var rowW = vec4(0,0,0,1);
			matrixY = mat4(rowX, rowY, rowZ, rowW);

		}

		if (code === 38) thetaX -= 5;
		else if (code === 40) thetaX += 5;

		if (code === 38 || code === 40) {

			var rowX = vec4(1,0,0,0);
			var rowY = vec4( 0, Math.cos(thetaX * (Math.PI/180)), -Math.sin(thetaX * (Math.PI/180)), 0);
			var rowZ = vec4( 0, Math.sin(thetaX * (Math.PI/180)), Math.cos(thetaX * (Math.PI/180)), 0);
			var rowW = vec4(0,0,0,1);
			matrixX = mat4(rowX, rowY, rowZ, rowW);

		}

		Mcam = cameraMatrix(eye,at,up);	
		var rotationMatrix = mult(matrixY, matrixX);
		M = mult(P, mult(rotationMatrix, Mcam));
		gl.uniformMatrix4fv(uM, gl.FALSE, flatten(M));	
		requestAnimationFrame(render);
	}

}



function cameraMatrix(eye, at, up){
  var w = normalize(subtract(eye,at));
  var u = cross(up, w);
  var v = cross(w,u);
  return mat4( vec4(u, -dot(u,eye)),
  			vec4(v, -dot(v,eye)),
  			vec4(w, -dot(w,eye)),
  			vec4(0,0,0,1)
  		);
}

function orthoProjMatrix(r,l,t,b,n,f){ // n and f should be -ve

	return mat4(2/(r-l), 0, 0, -(r+l)/(r-l),
				0, 2/(t-b), 0, -(t+b)/(t-b),
				0, 0, 2/(n-f), -(n+f)/(n-f),
				0, 0, 0, 1);
	
}

function perspProjectionMatrix(r,l,t,b,n,f){ // n and f should be -ve
   
	return mat4(-2*n/(r-l), 0, (r+l)/(r-l), 0,
				0, -2*n/(t-b),(t+b)/(t-b), 0,
				0, 0, -(n+f)/(n-f), 2*f*n/(n-f),
				0, 0, -1, 0 );
}

function perspectiveMatrix(fovy, aspect, near, far ){ // near and far are +ve
	var t = near*Math.tan(radians(fovy/2));
	var r = t*aspect;
	return perspProjectionMatrix(r,-r, t,-t, -near, -far);
}



