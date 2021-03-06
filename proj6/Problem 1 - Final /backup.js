"use strict";

// Global variables
var gl, canvas, program;
var Uniforms, Attributes;
var M; // model

function webGLinit(){

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

}


window.onload = function init() {

			// Set up WebGL
			webGLinit();

			// Get attribute and uniform locations
			Attributes = getAttributeLocations( "vTexCoords","vNormal","vPosition");


			Uniforms = getUniformLocations(
			  "ModelMatrix", "NormalTransformationMatrix", "CameraMatrix", "TrackBallMatrix", "CameraPosition",
			  "Ka", "Kd", "Ks", "shininess", "Ia", "Id", "Is", "LightPosition", "Sampler"
			);


			// Set up virtual trackball
			TrackBall(); 	

			// Set up Camera 
			var eye = vec3(0,0, 2.5);
			var at = vec3(0, 0 ,0);
			var up = vec3(0,1,0);
			var C = Camera();
			C.lookAt(eye,at,up);
			C.setPerspective(60,1,0.1,10);


			// Set Light 
			var L = Light();
			L.setPosition(vec3(0,3,5));
			L.setParameters(vec3(0.3, 0.3, 0.3), vec3(1,1,1), vec3(1,1,1) );
			
			M = Sphere();
			M.diffuseTexture = "../Images/earth-diffuse.jpg";
			objInit(M);

			requestAnimationFrame(render);

};


function render(now){

	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	M.draw();

}


//-------------------------- CREATE SPHERE ----------------------------------

function Sphere(){

	//Texture Coordinates 
	// var ta = vec2(0,0);
	// var tb = vec2(1,0);
	// var tc = vec2(1,1);
	// var td = vec2(0,1);

	var S = { 	

				positions : [],
				vertices: [],
		 	  	normals: [], 
		 	  	texCoords: [],
		 	  	triangles: [],
		 	  	material: {	Ka: vec3(0.9, 0.9, 0.9),
		 	  				Kd: vec3(0.7, 0.1, 0.6),
		 	  				Ks: vec3(0.9, 0.9, 0.9),
		 	  				shininess: 500
		 	  	},
		 	  	ModelMatrix: mat4(),
		 	  	diffuseTexture: ""


	};


	var numTimesToSubdivide = 5; 

	var s2 = Math.sqrt(2);
	var s6 = Math.sqrt(6);

	var va = vec3(0,0,1);
	var vb = vec3(0, 2 * s2/3, -1/3);
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

			console.log(ab,ac,bc);

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
		
		S.texCoords.push(vec2(a[0],a[1],a[2]),vec2(b[0],b[1],b[2]),vec2(c[0],c[1],c[2]));
		
		S.vertices.push(a,b,c);
		//if(S.positions.indexOf(a) === -1){
			
			S.positions.push(a);
		//} 
		//if(S.positions.indexOf(b) === -1){
			
			S.positions.push(b);
		//} 
		//if(S.positions.indexOf(c) === -1){
			
			S.positions.push(c);
		//} 
		
		var aIndex = S.positions.indexOf(a);
		var bIndex = S.positions.indexOf(b);
		var cIndex = S.positions.indexOf(c);

		S.triangles.push([aIndex, bIndex, cIndex]);

		S.normals.push(norm,norm,norm);

	}


	return S;



}


//------------------------- objInit ----------------------------------------
function objInit(Obj){

	//console.log("Before");

	// Setup buffers
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.positions), gl.STATIC_DRAW);

	//console.log("After");

	// Normals need to be computed here if not given
	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.normals), gl.STATIC_DRAW);

	var iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(Obj.triangles)),gl.STATIC_DRAW);

	var numItems = Obj.triangles.length * 3;

	console.log("Positions, Normals, Text Cords ", Obj.positions.length, Obj.normals.length, Obj.texCoords.length);
	//console.log("Triangles and Num Items and Normals", Obj.triangles.length, numItems, Obj.normals.length);

	//console.log(numItems);

	var usingTexture = ((Obj.texCoords!==undefined) && (Obj.texCoords.length > 0));

	if(usingTexture){

		var tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.texCoords), gl.STATIC_DRAW);

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red

		var image = new Image();
		image.onload = function(){handler(texture)};
		image.src = Obj.diffuseTexture;

		function handler(texture){

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		}

	}

	var ModelMatrix = mat4();
	var NormalTransformationMatrix = mat3();

	Obj.setModelMatrix = function(m){// m is 4x4 matrix

		ModelMatrix = m;
		NormalTransformationMatrix = 
			inverse3 ( mat3(m[0][0], m[1][0], m[2][0],
							m[0][1], m[1][1], m[2][1],
							m[0][2], m[1][2], m[2][2] ) );

	}

	Obj.draw = function(){
		// Set attribute pointers
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.vertexAttribPointer(Attributes.vPosition, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.vertexAttribPointer(Attributes.vNormal, 3, gl.FLOAT, false, 0, 0);

		if(usingTexture){

			gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
			gl.vertexAttribPointer(Attributes.vTexCoords, 2, gl.FLOAT, false, 0 ,0);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);

			//Set Sampler
			gl.uniform1i(Uniforms.Sampler, 0);
			
		}

		// Set material properties
		gl.uniform3fv(Uniforms.Ka, flatten(Obj.material.Ka));
		gl.uniform3fv(Uniforms.Kd, flatten(Obj.material.Kd));
		gl.uniform3fv(Uniforms.Ks, flatten(Obj.material.Ks));
		gl.uniform1f(Uniforms.shininess, Obj.material.shininess);


		// Set model matrix and the matrix for transforming normal vectors
		gl.uniformMatrix4fv(Uniforms.ModelMatrix, gl.FALSE, flatten(ModelMatrix));
		gl.uniformMatrix3fv(Uniforms.NormalTransformationMatrix, gl.FALSE, flatten(NormalTransformationMatrix));


		// Draw
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_SHORT, 0);

	}
}


//------------------------- TRACKBALL --------------------------------

function TrackBall(){
	var TrackBallMatrix, lastVector, tracking = false;
	
	TrackBallMatrix = mat4(); // initialize TrackBallMatrix
	gl.uniformMatrix4fv(Uniforms.TrackBallMatrix, gl.FALSE, flatten(TrackBallMatrix));

	//set event handlers
	canvas.onmousemove = mousemove;
	canvas.onmousedown = mousedown;
	canvas.onmouseup = mouseup;
	canvas.onwheel = wheel;

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
}

//-----------------------CAMERA ----------------------------------
function Camera(){
	// set defaults
	var eye = vec3(0,0, 2.5);
	var at = vec3(0, 0 ,0);
	var up = vec3(0,1,0);
	var Mcam= cameraMatrix(eye,at,up);
	var P = perspectiveMatrix(60,1,0.1,10);
	setUniforms();

	var C =  { };

	C.lookAt = function(eye,at,up){
		Mcam = cameraMatrix(eye,at,up);
		setUniforms();
	};

	C.setPerspective = function(fovy, aspect, near, far){
		P = perspectiveMatrix(fovy, aspect, near, far );
		setUniforms();
	}
	
							
	C.setOrthographic = function (r,l,t,b,n,f){
		P = orthoProjMatrix(r,l,t,b,n,f);
		setUniforms();

	}

	function setUniforms(){
		gl.uniformMatrix4fv( Uniforms.CameraMatrix, gl.FALSE,flatten(mult(P,Mcam)));
		gl.uniform3fv(Uniforms.CameraPosition, flatten(eye));
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

	return C;
}

//--------------- GET UNIFORM AND ATTRIBUTE LOCATIONS -------------

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

//--------------------- LIGHT -------------------------------
function Light(){
	var L = {};
	L.setPosition = function(position){
		gl.uniform3fv( Uniforms.LightPosition, flatten(position) );
	};
	L.setParameters = function(Ia, Id, Is){
		gl.uniform3fv( Uniforms.Ia, flatten(Ia) );
		gl.uniform3fv( Uniforms.Id, flatten(Id) );
		gl.uniform3fv( Uniforms.Is, flatten(Is) );
	}

	// set defaults
	L.setPosition(vec3(0,3,5));
	L.setParameters(vec3(0.3, 0.3, 0.3), vec3(1,1,1), vec3(1,1,1) );
	
	return L;
}