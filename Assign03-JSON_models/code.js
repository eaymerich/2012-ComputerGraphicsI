/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 3

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

var nVertices;

// WebGL context as a global variable.
// Not very elegant. :(
var gl;

// Shader Code

// Value of z is inverted here and not in view matrix.
// For some reason, if z was inverted in view matrix,
// model "skull.json" won't render, even if all other
// models render correctly. So, for all models to render
// correctly, z value is inverted in Vertex Shader.
var vsCode = " \
	attribute vec3 vPos; \
	attribute vec3 vCol; \
	uniform mat4 modelM; \
	uniform mat4 viewM; \
	varying mediump vec3 color; \
	void main(void){ \
		vec4 p = vec4(vPos,1.0); \
		p = viewM*modelM*p; \
		gl_Position = vec4(p.x,p.y,-p.z,1.0); \
		color = vCol; \
	} \
	";
var fsCode = " \
	precision mediump float; \
	varying vec3 color; \
	void main(void){ \
		gl_FragColor = vec4(color, 1.0); \
	} \
	";

var sProgram;

// Compiles and links the shader program.
function makeShaderProgram(){
	// Compile vertex shader
	var vShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vShader, vsCode);
	gl.compileShader(vShader);
	var test = gl.getShaderParameter(vShader, gl.COMPILE_STATUS);
	if(!test){ // Test if vertex shader compiled correcly.
		alert("ERROR: vertex shader not compiled.");
	}
	
	// Compile fragment shader
	var fShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fShader, fsCode);
	gl.compileShader(fShader);
	test = gl.getShaderParameter(fShader, gl.COMPILE_STATUS);
	if(!test){ // Test if fragment shader compiled correcly.
		alert("ERROR: fragment shader not compiled.");
	}
	
	// Create shader program
	sProgram = gl.createProgram();
	gl.attachShader(sProgram, vShader);
	gl.attachShader(sProgram, fShader);
	gl.linkProgram(sProgram);
	test = gl.getProgramParameter(sProgram, gl.LINK_STATUS);
	if(!test){  // Test if shader program linked correcly.
		alert("ERROR: shader program not linked.");
	}
}

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

// Miscellaneous function to convert a vector to string.
function showVec(vec){
	var str = "[";
	for(var i = 0; i < vec.length;++i){
		if(i != vec.length-1){
			str += vec[i] + ",";
		}else{
			str += vec[i] + "]";
		}
	}
	return str;
}

// Renders a JSON model
function drawJSON(obj){
	
	//var tvertex = new Array();
	var max = [-Infinity, -Infinity, -Infinity];
	var min = [ Infinity,  Infinity,  Infinity]; 
	
	// For each node in object
	for(var ni = 0; ni < obj.nodes.length; ++ni){
		var node = obj.nodes[ni]; // actual node
		var modelMatrix = node.modelMatrix;
		//var modelMatrix = mat4.identity();

		// For each mesh in node
		for(var mi = 0; mi < node.meshIndices.length; ++mi){
			var mesh = obj.meshes[node.meshIndices[mi]]; // actual mesh
			
			// Apply modelMatrix to each vector;
			var point = vec3.create();
			for(var vi = 0; vi < mesh.vertexPositions.length; vi+=3){
				// Get vertex
				point[0] = mesh.vertexPositions[vi];
				point[1] = mesh.vertexPositions[vi+1];
				point[2] = mesh.vertexPositions[vi+2];
				
				// Multiply by ModelMatrix
				mat4.multiplyVec3(modelMatrix, point);
				
				// Compare to min and max
				// x
				if(point[0] < min[0]) min[0] = point[0];
				if(point[0] > max[0]) max[0] = point[0];
				// y
				if(point[1] < min[1]) min[1] = point[1];
				if(point[1] > max[1]) max[1] = point[1];
				// z
				if(point[2] < min[2]) min[2] = point[2];
				if(point[2] > max[2]) max[2] = point[2];
			}
		}
	}
	
	// Calculate center
	var c = vec3.create();
	vec3.add(max,min,c);
	vec3.scale(c,0.5);
	
	// Calculate scale factor
	var lx = max[0] - min[0];
	var ly = max[1] - min[1];
	var lz = max[2] - min[2];
	var maxl = Math.max(lx,ly);
	maxl = Math.max(maxl,lz);
	
	var scale = 2.0 / maxl;
	//alert("center=" + showVec(c) + "\nscale=" + scale);
	//alert("max.x=" + max[0] + " max.y=" + max[1] + " max.z=" + max[2] + "\nmin.x=" + min[0] + " min.y=" + min[1] + " min.z=" + min[2]);
	
	
	// Now, send object to GPU
	var buffers = new Array();
	
	for(var mi = 0; mi < obj.meshes.length; ++mi){
		var mesh = obj.meshes[mi];
		// Create positions buffer
		var posBuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexPositions), gl.STATIC_DRAW);
		
		// Create color buffer
		var colBuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colBuff);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
		
		var indBuff = null;
		
		// If there are indices, create indices buffer
		if(mesh.indices){
			indBuff = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuff);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
		}
		
		// Save buffers to buffer array
		buffers[mi] = new Object();
		buffers[mi].vertex = posBuff;
		buffers[mi].color = colBuff;
		buffers[mi].index = indBuff;
	}
	
	// Ready to draw

	// Clear canvas.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Set Shader program
	gl.useProgram(sProgram);
	
	// Send uniforms for all models
	var scaleLoc = gl.getUniformLocation(sProgram, "scaleFactor");
	var transLoc = gl.getUniformLocation(sProgram, "translation");
	gl.uniform1f(scaleLoc, scale);
	gl.uniform3fv(transLoc, c);
	
	// Get location for vertex positions and colors
	var posLoc = gl.getAttribLocation(sProgram, "vPos");
	gl.enableVertexAttribArray(posLoc);
	var colLoc = gl.getAttribLocation(sProgram, "vCol");
	gl.enableVertexAttribArray(colLoc);
	
	// Set view matrix
	
	// The conversion to right handed system will be done
	// in the vertex shader, and not in the view matrix.
	// This is because model "skull.json" didn't render
	// correctly when z was inverted in this matriz.
	
	// For orthografic projection
	var vm = [	scale,0,0,-( c[0]*scale ),
				0,scale,0,-( c[1]*scale ),
				0,0,scale,-( c[2]*scale ),
				0,0,0,1
				];
	mat4.transpose(vm); // To be coherent with matrices defined by columns.
	
	var viewMLoc = gl.getUniformLocation(sProgram, "viewM");
	gl.uniformMatrix4fv(viewMLoc, false, vm);
	
	var modelMLoc = gl.getUniformLocation(sProgram, "modelM");
	
	for(var ni = 0; ni < obj.nodes.length; ++ni){
		var node = obj.nodes[ni]; // Get actual node
		
		// Send node modelmatrix
		gl.uniformMatrix4fv(modelMLoc, false, node.modelMatrix);
		
		// For each mesh in node
		for(var mi = 0; mi < node.meshIndices.length; ++mi){
			var mesh_index = node.meshIndices[mi];
			var mesh = obj.meshes[mesh_index]; // Get actual mesh
			
			// FIX for DijonPalais
			if(mesh.vertexNormals.length == 0) continue;
			
			// Render Mesh
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mesh_index].vertex);
			gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mesh_index].color);
			gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, true, 0, 0);
			
			// Actual draw
			var primitives;
			if(buffers[mesh_index].index){
				primitives = mesh.indices.length;
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[mesh_index].index);
				gl.drawElements(gl.TRIANGLES, primitives, gl.UNSIGNED_SHORT, 0);
			}else{
				primitives = mesh.vertexPositions.length/3;
				gl.drawArrays(gl.TRIANGLES, 0, primitives);
			}
		}
	}
	
	// Finish rendering
}

// Loads and renders a JSON model
function load(modelName){
	
	// Loads JSON file to model
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",modelName,false);
	xhttp.send();
	var model = JSON.parse(xhttp.responseText);
	
	// Render model
	drawJSON(model);
}

// Function called from webpage, when the user selects a model.
function loadModel(){

	// Get model name from combobox
	var modelName = document.getElementById("modelSelected").value;
	
	// Load and render the model
	load(modelName);
}

// Inits WebGL and renders default model.
function main(){
	// Get canvas from document.
	var canvas = document.getElementById("myCanvas");
	
	// Get WebGL context, and paint canvas.
	gl = initWebGL(canvas);
	if (gl) {
		// Sets default background color
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 

		// Prepares shader program.
		makeShaderProgram();
		
		// Draws default model to canvas.
		load("skull.json");
	}
}
