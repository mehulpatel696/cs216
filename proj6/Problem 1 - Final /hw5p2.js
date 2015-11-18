"use strict";

// Global variables
var gl, canvas, program;
var Uniforms, Attributes;
var M; // model
var T,B;
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
			  "Ka", "Kd", "Ks", "shininess", "Ia", "Id", "Is", "LightPosition", "Sampler", "normalSampler"
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
			M.normalTexture = "../Images/earth-normal.jpg"
			objInit(M);

			requestAnimationFrame(render);

};


function render(now){

	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	M.draw();

}

function Sphere(){

    var S = {     positions: [],
                normals: [],
                texCoords: [],
                triangles: [],
                material: {    Ka: vec3(0.1, 0.1, 0.1),
                            Kd: vec3(0.7, 0.1, 0.6),
                            Ks: vec3(0.1, 0.1, 0.1),
                            shininess: 1
                },
                ModelMatrix: mat4(),
                diffuseTexture: "",
                normalTexture: ""
            };

    var N = 100; // # latitudes (excluding poles) = N, # longitudes = 2*N+3
    var i, j;

    S.normals = S.positions; // for unit sphere with center (0,0,0), normal = position

    S.positions[0] = (vec3(0,0,1)); // north pole
    S.positions[(2*N+3)*N +1] = vec3(0,0,-1); // south pole
    
    // fill positions array
    for(i=0; i< N; ++i){ 
        for(j=0; j< 2*N+3; ++j){
            S.positions[index(i,j)] = pos(i,j);
        }
    }

    // fill triangles array
    for(j = 0; j< 2*N+2; ++j) {
        // north pole triangle fan
        S.triangles.push( vec3(0, index(0,j), index(0,j+1)) ); 
        // south pole tri fan
        S.triangles.push( vec3( index(N-1,j), (2*N+3)*N+1, index(N-1,j+1)) ); 
    }
    
    // the rest of the quads
    for(i = 0; i<N-1; ++i){ 
        for(j=0; j< 2*N+2; ++j){
            S.triangles.push( vec3(index(i,j), index(i+1,j), index(i+1,j+1)) );
            S.triangles.push( vec3(index(i,j), index(i+1, j+1), index(i,j+1)) );    
        }
    }
    
    // fill texCooords array
    for(i = 0; i < S.positions.length; ++i){     
        S.texCoords.push(textureCoords(S.positions[i])); 
    }

    function index(i,j){
        return i*(2*N+3) + j + 1;
    }

    function pos(i, j){
        var theta = (i+1)*Math.PI/(N+1);
        var phi = j*Math.PI/(N+1);
        return vec3(Math.sin(theta)*Math.cos(phi), 
                    Math.sin(theta)*Math.sin(phi), 
                    Math.cos(theta));
    }
    
    function textureCoords(pos){
        var x = pos[0];
        var y = pos[1];
        var z = pos[2];
        var theta = Math.atan2(Math.sqrt(x*x+y*y), z);
        var phi = Math.atan2(y,x);
        if(phi<0){phi += 2*Math.PI; }
        var t = vec2(phi/(2*Math.PI), 1 - theta/Math.PI);
        return t;
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
        new Uint8Array([0, 0, 0, 255])); // red

		var image = new Image();
		image.onload = function(){ handler(texture) };
		image.src = Obj.diffuseTexture;

		var normaltexture = gl.createTexture();
		var normalimg = new Image();
		normalimg.onload = function(){handler(normaltexture)};
		normalimg.src = Obj.normalTexture;

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
			gl.uniform1i(Uniforms.normalSampler, 0);
			
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