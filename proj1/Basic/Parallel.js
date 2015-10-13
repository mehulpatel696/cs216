/*
  Mehul Patel 
  Mohan Dhar 
  Jiwon Shin 
 */


"use strict";
var gl; // global variable
var num_clicked = 0; 
var clicked = [];
var debug = true;
var vertices = [];
var buffers = [];
var colors = [];
var r,g,b;

window.onload = function init(){

	//Set  up WebGL
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) {alert( "WebGL isn't available" );}

	canvas.addEventListener("click", function(event){
	   var pos = getMousePosition(canvas, event);
	   clicked.push(pos.x);
	   clicked.push(pos.y);
	   num_clicked++;
	   if(num_clicked == 2){
	   		num_clicked = 0;
	   		if(debug) console.log("Clicked - Before", clicked);
	   		drawRectangle(clicked);
		}

	   if(debug) console.log("NDC Coordinates:" + pos.x + "," + pos.y);
	});
    
    // Set viewport and clear canvas
    gl.viewport( 0, 0, canvas.width, canvas.height );
   	gl.clearColor( 0.0, 1.0, 1.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);



    // Load shaders and initialize attribute buffers

 };


//If there have been two clicks call the drawRectangleFunction()
// and pass in the coordinate and then that function takes care of everything else 

function drawRectangle(pos){

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    r = gl.getUniformLocation(program,"r");
    g = gl.getUniformLocation(program,"g");
    b = gl.getUniformLocation(program,"b");

   	gl.clearColor( 0, 1.0, 1.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);

    var r_c = Math.random();
    var g_c = Math.random();
    var b_c= Math.random();
   
    var color_tmp = [r_c, g_c, b_c];
    colors.push(color_tmp);
	var pos_tmp = pos; 
	if(debug) console.log("TMP-POS", clicked);
    //Empty the global variable for the next click
	clicked = [];
	if(debug) console.log("Clicked - After", clicked);
	// buffer for square
	
	
	var vertices_one = [ pos_tmp[0], pos_tmp[1], pos_tmp[2], pos_tmp[1], pos_tmp[2], pos_tmp[3],pos_tmp[0], pos_tmp[1], pos_tmp[0], pos_tmp[3], pos_tmp[2], pos_tmp[3] ];
	vertices.push(vertices_one);

	var buffer1 = gl.createBuffer();
	buffers.push(buffer1);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);	


	for(var i = 0;  i < vertices.length; i++){
		gl.uniform1f(r, colors[i][0]);
	    gl.uniform1f(g, colors[i][1]);
	    gl.uniform1f(b, colors[i][2]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices[i]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES,0,6); 
    }
	



	

	  
	


}	

function getMousePosition(canvas, event){
	var rect = canvas.getBoundingClientRect();
    return {
          x: -1+2*event.offsetX/canvas.width,
          y: -1+2*(canvas.height- event.offsetY)/canvas.height
    };
}
