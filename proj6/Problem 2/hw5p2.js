 "use strict";

// Global variables
var gl, canvas, program;
var Uniforms, Attributes;
var M; // model
var Mv;
var Mcam, P, cM;
var eye, at, up;
var eye_z = 3;

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
			Attributes = getAttributeLocations("vPosition", "vNormal", "vTexCoords");

			Uniforms = getUniformLocations(
			  "ModelMatrix", "NormalTransformationMatrix", "CameraMatrix", "TrackBallMatrix", "CameraPosition",
			  "Ka", "Kd", "Ks", "shininess", "Ia", "Id", "Is", "LightPosition", "Sampler"
			);


			document.body.onkeydown = function(e){
				console.log(e.keyCode);
				key_pressed(e);
			};

			// Set up virtual trackball
			TrackBall(); 	

			// Set up Camera 
			eye = vec3(0,0, .5);
			at = vec3(0, 0 ,0);
			up = vec3(0,1,0);
			var C = Camera();
			C.lookAt(eye,at,up);
			C.setPerspective(60,1,0.1,10);

			// Set Light 
			var L = Light();
			L.setPosition(vec3(0,3,5));
			L.setParameters(vec3(0.3, 0.3, 0.3), vec3(1,1,1), vec3(1,1,1) );
			
			//M = Cube();
			console.log(Mcam);
			console.log(Cube());
			M = Cube();
			Mv = cross(P,Mcam);

			cM = gl.getUniformLocation(program, "CameraMatrix");

			gl.uniformMatrix4fv( cM, gl.FALSE, flatten(Mv));


			M.diffuseTexture = "../Images/cube.jpg";
			objInit(M);

			requestAnimationFrame(render);

};


function render(now){
	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	M.draw();
}


//-------------------------- CREATE SQUARE ----------------------------------

function Cube(){

	

	var front_1 = vec3(-1,1,1);
	var front_2 = vec3(1,1,1);
	var front_3 = vec3(1,-1,1);
	var front_4 = vec3(-1,-1,1);

	var front_1t = vec2(1/3,3/4);
	var front_2t = vec2(2/3,3/4);
	var front_3t = vec2(2/3,1/2);
	var front_4t = vec2(1/3,1/2);

	var left_1 = vec3(-1,1,-1);
	var left_2 = vec3(-1,1,1);
	var left_3 = vec3(-1,-1,1);
	var left_4 = vec3(-1,-1,-1);

	var left_1t = vec2(0,3/4);
	var left_2t = vec2(1/3,3/4);
	var left_3t = vec2(1/3,1/2);
	var left_4t = vec2(0,1/2);

	var right_1 = vec3(1,1,1);
	var right_2 = vec3(1,1,-1);
	var right_3 = vec3(1,-1,-1);
	var right_4 = vec3(1,-1,1);

	var right_1t = vec2(2/3,3/4);
	var right_2t = vec2(1,3/4);
	var right_3t = vec2(1,1/2);
	var right_4t = vec2(2/3,1/2);

	var back_1 = vec3(-1,-1,-1);
	var back_2 = vec3(1,-1,-1);
	var back_3 = vec3(1,1,-1);
	var back_4 = vec3(-1,1,-1);

	var back_1t = vec2(1/3,1/4);
	var back_2t = vec2(2/3,1/4);
	var back_3t = vec2(2/3,0);
	var back_4t = vec2(1/3,0);

	var top_1 = vec3(-1,1,-1);
	var top_2 = vec3(1,1,-1);
	var top_3 = vec3(1,1,1);
	var top_4 = vec3(-1,1,1);

	var top_1t = vec2(1/3,1);
	var top_2t = vec2(2/3,1);
	var top_3t = vec2(2/3,3/4);
	var top_4t = vec2(1/3,3/4);

	var bottom_1 = vec3(-1,-1,1);
	var bottom_2 = vec3(1,-1,1);
	var bottom_3 = vec3(1,-1,-1);
	var bottom_4 = vec3(-1,-1,-1);

	var bottom_1t = vec2(1/3,1/2);
	var bottom_2t = vec2(2/3,1/2);
	var bottom_3t = vec2(2/3,1/4);
	var bottom_4t = vec2(1/3,1/4);


	var front_normal = vec3(0,0,-1);
	var left_normal = vec3(1,0,0);
	var right_normal = vec3(-1,0,0);
	var back_normal = vec3(0,0,1);
	var top_normal = vec3(0,-1,0);
	var bottom_normal = vec3(0,1,0);


	var S = {	positions: [front_1,front_2,front_4, front_2,front_4,front_3,left_1,left_2,left_4, left_2,left_4,left_3,right_1,right_2,right_4, right_2,right_4,right_3,back_1,back_2,back_4, back_2,back_4,back_3 , top_1,top_2,top_4, top_2,top_4,top_3,bottom_1,bottom_2,bottom_4, bottom_2,bottom_4,bottom_3],
				normals: [front_normal,front_normal,front_normal,front_normal,front_normal,front_normal,left_normal ,left_normal ,left_normal ,left_normal ,left_normal ,left_normal, right_normal,right_normal,right_normal,right_normal,right_normal,right_normal,back_normal,back_normal,back_normal,back_normal,back_normal,back_normal, top_normal,top_normal,top_normal,top_normal,top_normal,top_normal,bottom_normal,bottom_normal,bottom_normal,bottom_normal,bottom_normal,bottom_normal], 
		 	  	texCoords: [front_1t,front_2t,front_4t, front_2t,front_4t,front_3t,left_1t,left_2t,left_4t, left_2t,left_4t,left_3t,right_1t,right_2t,right_4t, right_2t,right_4t,right_3t,back_1t,back_2t,back_4t, back_2t,back_4t,back_3t,top_1t,top_2t,top_4t, top_2t,top_4t,top_3t,bottom_1t,bottom_2t,bottom_4t, bottom_2t,bottom_4t,bottom_3t],
		 	  	material: {	
							Ka: vec3(0.2, 0.2, 0.2),
							Kd: vec3(0.0, 1.0, 0.5),
							Ks: vec3(0.2, 0.2, 0.2),
		 	  				shininess: 100
		 	  	},
		 	  	diffuseTexture: ""
			};

		 	return S;
}


//------------------------- objInit ----------------------------------------
function objInit(Obj){


	// Setup buffers
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.positions), gl.STATIC_DRAW);

	// Normals need to be computed here if not given
	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.normals), gl.STATIC_DRAW);


	var numItems = Obj.positions.length;


	console.log("Position, normals, cords",Obj.positions.length, Obj.normals.length,Obj.texCoords.length  );

	var usingTexture = ((Obj.texCoords!==undefined) && (Obj.texCoords.length > 0));

	if(usingTexture){
		var tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.texCoords), gl.STATIC_DRAW);

		var texture = gl.createTexture();
		texture.image = new Image();
		texture.image.onload = function(){handler(texture)};
		texture.image.src = Obj.diffuseTexture;

		function handler(texture){
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
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
		gl.drawArrays(gl.TRIANGLES, 0, numItems);

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
//Key Pressed 
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

		
		var rotationMatrix = mult(matrixY, matrixX);
		Mv = mult(P, mult(rotationMatrix, Mcam));
		gl.uniformMatrix4fv(cM, gl.FALSE, flatten(Mv));	
		requestAnimationFrame(render);
	}

}



//-----------------------CAMERA ----------------------------------
function Camera(){
	// set defaults
	var eye = vec3(0,0, 2.5);
	var at = vec3(0, 0 ,0);
	var up = vec3(0,1,0);
	Mcam= cameraMatrix(eye,at,up);
	P = perspectiveMatrix(60,1,0.1,10);
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