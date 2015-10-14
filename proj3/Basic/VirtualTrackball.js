"use strict";

// global variables
var gl; 
var canvas;
var vBuffer, cBuffer;

var lastVector;
var uM, M;
var tracking = false;

window.onload = function init() {
			
	// Set up WebGL
	canvas = document.getElementById("gl-canvas");
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

	//set event handlers
	canvas.onmousemove = mousemove;
	canvas.onmousedown = mousedown;
	canvas.onmouseup = mouseup;

	
	// Load data into a buffer
	var s = 0.3;
	var a = vec3(-s,-s,-s);
	var b = vec3(s,-s,-s);
	var c = vec3(s,s,-s);
	var d = vec3(-s,s,-s);		
	var e = vec3(0,0,2*s);
	var vertices = [a,b,e,b,c,e,c,d,e,d,a,e,a,b,c,a,c,d];

	var R = vec3(1,0,0);
	var G = vec3(0,1,0);
	var B = vec3(0,0,1);
	var X = vec3(0.0,0.5,0.5); 
	var Y = vec3(0.5, 0, 0.5);
	var colors = [R,R,R,G,G,G,B,B,B,X,X,X,Y,Y,Y,Y,Y,Y];


	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	

	cBuffer = gl.createBuffer();
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

	uM = gl.getUniformLocation(program,"M");

	M = mat4();; // initialize M

	gl.uniformMatrix4fv(uM, gl.FALSE, flatten(M)); 

	requestAnimationFrame(render);

};

function render(now){
	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//draw pyramid
	gl.drawArrays(gl.TRIANGLES,0,18);
}


function mousedown(event){
  lastVector = getMouseDirectionVector(event);
  tracking = true;
}

function mouseup(){
	tracking = false;
}

function mousemove(event){ 

	if(tracking && event.buttons===1){

		
		var currentVector = getMouseDirectionVector(event);
        var dotProduct = dot(lastVector, currentVector);
		//console.log("Dot product: " + dotProduct);

		var lengthOfCurrentVector = Math.sqrt((lastVector[0] * lastVector[0]) + (lastVector[1] * lastVector[1]) + (lastVector[2] * lastVector[2]));
		//console.log("currentVector: " + lengthOfCurrentVector);

		var lengthOfLastVector = Math.sqrt((currentVector[0] * currentVector[0]) + (currentVector[1] * currentVector[1]) + (currentVector[2] * currentVector[2]));
		//console.log("lastVector" + lengthOfLastVector);
		var axis = cross(lastVector, currentVector);
		//console.log("axis: " + axis);		
		var theta = Math.acos(dotProduct / (lengthOfCurrentVector * lengthOfLastVector));
		//console.log("theta: " + theta);
		M = rotate(5*theta * (180 / Math.PI), axis);
		
		gl.uniformMatrix4fv(uM, gl.FALSE, flatten(M));
		requestAnimationFrame(render);

    } else {
    	lastVector = getMouseDirectionVector(event);
    }

}

function getMouseDirectionVector(event){
  var r = 2.0;
  var x = -1+2*event.offsetX/canvas.width;
  var y = -1+2*(canvas.height- event.offsetY)/canvas.height;
  var z = Math.sqrt(r*r-x*x-y*y);
  return normalize(vec3(x,y,z));
}


