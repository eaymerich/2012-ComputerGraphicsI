/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 1
Part 2

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

// WebGL context as a global variable.
// Not very elegant. :(
var gl;

// Returns the WegGL context from canvas.
function initWebGL(canvas){
	var glContext = null;
	
	try{
		glContext = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}catch(e){
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
	
	if(glContext == null){
		alert("WebGL context not inicialized");
	}
	
	return glContext;
}

// Inits WebGL.
function main(){
	// Get canvas from document.
	var canvas = document.getElementById("myCanvas");
	
	// Get WebGL context, and paint canvas.
	gl = initWebGL(canvas);
	if (gl) {
		update();
	}
}

// Paints canvas to actual color from sliders.
function update(){
	// Get color components from sliders.
	var r = document.getElementById("ired").value;
	var g = document.getElementById("igreen").value;
	var b = document.getElementById("iblue").value;
	
	// Set the color on canvas.
	if (gl) {
		gl.clearColor(r/255, g/255, b/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
}
