"use strict";

// global variables
var gl; 
var canvas;
var program;

var Uniforms, Attributes;

var TrackBallMatrix;

var lastVector;
var tracking = false;

var S;

window.onload = function init() {
			// Set up WebGL
			canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// set clear color 
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			
			//Enable depth test
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL); // since WebGL uses left handed
			gl.clearDepth(1.0); 	 // coordinate system
			
			// Load shaders and initialize attribute buffers
			program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );


			//set event handlers
			canvas.onmousemove = mousemove;
			canvas.onmousedown = mousedown;
			canvas.onmouseup = mouseup;
			canvas.onwheel = wheel;

			// Get attribute and uniform locations

			Attributes = getAttributeLocations("vPosition", "vNormal");

			Uniforms = getUniformLocations(
			  "ModelMatrix", "CameraMatrix", "TrackBallMatrix", "CameraPosition",
			  "Ka", "Kd", "Ks", "shininess", "Ia", "Id", "Is", "LightPosition");


			// Initialize uniforms
			TrackBallMatrix = mat4(); // initialize TrackBallMatrix
			gl.uniformMatrix4fv(Uniforms.TrackBallMatrix, gl.FALSE, flatten(TrackBallMatrix)); 

			gl.uniformMatrix4fv(Uniforms.ModelMatrix, gl.FALSE, flatten(mat4()));			


			// Set up Camera 
			var eye = vec3(0,0, 3);
			var at = vec3(0, 0 ,0);
			var up = vec3(0,1,0);
			var Mcam= cameraMatrix(eye,at,up);
			var P = perspectiveMatrix(60,1,0.1,10);
			gl.uniformMatrix4fv( Uniforms.CameraMatrix, gl.FALSE, flatten(mult(P,Mcam)));
			gl.uniform3fv(Uniforms.CameraPosition, flatten(eye));

			// Initialize ModelMatrix
			gl.uniformMatrix4fv(Uniforms.ModelMatrix, gl.FALSE, flatten(mat4()));

			// Set Light 
			var Light = {
				position: vec3(0,2,2),
				Ia: vec3(0.2, 0.2, 0.2),
				Id: vec3(1,1,1),
				Is: vec3(1,1,1)
			};

			gl.uniform3fv( Uniforms.LightPosition, flatten(Light.position) );
			gl.uniform3fv( Uniforms.Ia, flatten(Light.Ia) );
			gl.uniform3fv( Uniforms.Id, flatten(Light.Id) );
			gl.uniform3fv( Uniforms.Is, flatten(Light.Is) );

			S = Sphere();
			//S.ModelMatrix = scalem(1,0.5,1);
			objInit(S);

			requestAnimationFrame(render);

};


function render(now){
	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	S.draw();
}

function fmod(a,b) { 
	return a - Math.floor(a / b) * b;
}



//-------------------------- CREATE SPHERE ----------------------------------- 

function Sphere(){

	var S = { 	vertices: [],
		 	  	normals: [], 
		 	  	material: {	Ka: vec3(0.9, 0.9, 0.9),
		 	  				Kd: vec3(0.7, 0.1, 0.6),
		 	  				Ks: vec3(0.9, 0.9, 0.9),
		 	  				shininess: 500
		 	  	},
		 	  	ModelMatrix: mat4()
		 	};

	var numTimesToSubdivide = 6; 

	var s2 = Math.sqrt(2);
	var s6 = Math.sqrt(6);

	var va = vec3(0,0,1);
	var vb = vec3(0, 2*s2/3, -1/3);
	var vc = vec3(-s6/3, -s2/3, -1/3);
	var vd = vec3(s6/3, -s2/3, -1/3);

	tetrahedron(va, vb, vc, vd, numTimesToSubdivide);


	function tetrahedron(a,b,c,d,n){
		divideTriangle(a,b,c,n);
		divideTriangle(d,c,b,n);
		divideTriangle(a,d,b,n);
		divideTriangle(a,c,d,n);
	}

	function divideTriangle(a,b,c,n){
		if(n>0){
			var ab = normalize(mix(a,b,0.5));
			var ac = normalize(mix(a,c,0.5));
			var bc = normalize(mix(b,c,0.5));

			n--;

			divideTriangle(a,ab,ac,n);
			divideTriangle(ab,b,bc,n);
			divideTriangle(bc,c,ac,n);
			divideTriangle(ab,bc,ac,n);
		}
		else{
			triangle(a,b,c);
		}
	}

	function triangle(a,b,c){
		var norm = normalize(cross(subtract(b,a), subtract(c,a)));
		S.vertices.push(a,b,c);
		S.normals.push(norm, norm, norm);
	}


	return S;
}

/*------------------------- objInit -------------------------------------*/
function objInit(Obj){
	// Setup buffers
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.vertices), gl.STATIC_DRAW);


	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.normals), gl.STATIC_DRAW);

	var numVertices = Obj.vertices.length;

	Obj.draw = function(){
		// Set attribute pointers
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.vertexAttribPointer(Attributes.vPosition, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.vertexAttribPointer(Attributes.vNormal, 3, gl.FLOAT, false, 0, 0);

		// Set material properties
		gl.uniform3fv(Uniforms.Ka, flatten(Obj.material.Ka));
		gl.uniform3fv(Uniforms.Kd, flatten(Obj.material.Kd));
		gl.uniform3fv(Uniforms.Ks, flatten(Obj.material.Ks));
		gl.uniform1f(Uniforms.shininess, Obj.material.shininess);

		//set model matrix 
		gl.uniformMatrix4fv(Uniforms.ModelMatrix, gl.FALSE, flatten(Obj.ModelMatrix));

		gl.drawArrays(gl.TRIANGLES, 0, numVertices);
	}
}



//------------------------- TRACKBALL FUNCTIONS --------------------------------

function mousedown(event){
  lastVector = getMouseDirectionVector(event);
  tracking = true;
}

function mouseup(){
	tracking = false;
}

function mousemove(event){ 
	if(tracking && event.buttons===1){
		var p1 = lastVector;
  		var p2 = getMouseDirectionVector(event);
  		lastVector = p2;
  		var n = cross(p1,p2);
		if(length(n)!=0){
			var theta = 5*Math.asin(length(n))*180/Math.PI;
			TrackBallMatrix = mult(rotate(theta, n), TrackBallMatrix);
			gl.uniformMatrix4fv(Uniforms.TrackBallMatrix, gl.FALSE, flatten(TrackBallMatrix));
		}
  	}
}

function getMouseDirectionVector(event){
  var r = 2.0;
  var x = -1+2*event.offsetX/canvas.width;
  var y = -1+2*(canvas.height- event.offsetY)/canvas.height;
  var z = Math.sqrt(r*r-x*x-y*y);
  return normalize(vec3(x,y,z));
}

function wheel(event){
	var s = (1 - event.deltaY/500);
	TrackBallMatrix = mult(scalem(s,s,s), TrackBallMatrix);
	gl.uniformMatrix4fv(Uniforms.TrackBallMatrix, gl.FALSE, flatten(TrackBallMatrix));

}

//-----------------------CAMERA SETUP FUNCTIONS -----------------------------

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


//-------------------------- GET UNIFORM AND ATTRIBUTE LOCATIONS -------------
function getAttributeLocations(){
  var A = {};
  var l = arguments.length;
  for(var i=0;i<l;++i){
  	var name = arguments[i];
  	var loc = gl.getAttribLocation(program, name);
	gl.enableVertexAttribArray(loc);
	A[name] = loc;
  }
  return A;
}

function getUniformLocations(){
 var U = {};
  var l = arguments.length;
  for(var i=0;i<l;++i){
  	var name = arguments[i];
	U[name] = gl.getUniformLocation(program, name);
  }
  return U;
}

