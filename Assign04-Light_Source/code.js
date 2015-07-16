/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 4

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

var nVertices;

// WebGL context as a global variable.
// Not very elegant. :(
var gl;

var shader2 = false;

// Shader Code
var vsCodeA = loadFile("vertex_shader.vs");
var vsCodeB = loadFile("vertex_shader2.vs")
var vsCode = vsCodeA;

// Fragment code
var fsCodeA = loadFile("fragment_shader.fs");
var fsCodeB = loadFile("fragment_shader2.fs");
var fsCode = fsCodeA;

// Shader program
var sProgram;

// Model
var obj;

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

// Camera parameters
var eye;
var lookAt;
var up;

var c;
var max,min;
var diag;
var buffers;
//var light_src = [0.0,0.0,1.0,0.0];

// Light parameters
var light_point = false;
var light_src = [0.0,0.0,0.0,0.0];
var light_rup = (Math.PI * 2.0) / 240;//0.0;
var light_rup_delta = (Math.PI * 2.0) / 240;

function setupModel(){
	
	//var tvertex = new Array();
	max = [-Infinity, -Infinity, -Infinity];
	min = [ Infinity,  Infinity,  Infinity]; 
	
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
	c = vec3.create();
	vec3.add(max,min,c);
	vec3.scale(c,0.5);
	
	// Calculate diagonal
	var temp_d = vec3.create();
	vec3.subtract(max,min,temp_d);
	diag = vec3.length(temp_d);
	
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
	buffers = new Array();
	
	for(var mi = 0; mi < obj.meshes.length; ++mi){
		var mesh = obj.meshes[mi];
		// Create positions buffer
		var posBuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexPositions), gl.STATIC_DRAW);
		
		// Create normal buffer
		var normalBuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuff);
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
		buffers[mi].normal = normalBuff;
		buffers[mi].index = indBuff;
	}
	
	// Setup Camera
	eye = vec3.create(c);
	eye[2] = c[2] + (1.5 * diag);
	lookAt = vec3.create(c);
	vec3.subtract(c, eye, lookAt);
	vec3.normalize(lookAt);
	up = vec3.create();
	up[1] = 1;
	

	setupLight();
}

function showLight(){
	var button = document.getElementById("lsx");
	button.value = light_src[0];
	
	button = document.getElementById("lsy");
	button.value = light_src[1];
	
	button = document.getElementById("lsz");
	button.value = light_src[2];
	
	button = document.getElementById("lsw");
	button.value = light_src[3];
}

function setupLight(){
	// Setup light initial values
	if(light_point){
		// is a point
		light_src = vec4.create();
		light_src[0] = c[0] + diag;
		light_src[1] = c[1] + diag;
		light_src[2] = c[2] - diag;
		light_src[3] = 1.0;
	}else{
		// is a direction
		light_src = vec4.create();
		var viewVec = vec3.create(lookAt);
		vec3.scale(viewVec,-1.0);
		vec3.lerp(lookAt, up, 0.5, light_src);
		vec3.normalize(light_src);
		light_src[3] = 0.0;
	}
	
	//alert(showVec(light_src));
}

function updateLightSource(){
	// Rotate the light source
	var rotM = mat4.identity();
	mat4.rotateY(rotM,light_rup);
	mat4.multiplyVec3(rotM,light_src);
	showLight();
}

// Renders a JSON model
function drawModel(){
	
	// Ready to draw

	// Clear canvas.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Set Shader program
	gl.useProgram(sProgram);
	
	// Get location for vertex positions and normals
	var posLoc = gl.getAttribLocation(sProgram, "vPos");
	gl.enableVertexAttribArray(posLoc);
	var normalLoc = gl.getAttribLocation(sProgram, "vNor");
	gl.enableVertexAttribArray(normalLoc);
	
	
	var diffLoc = gl.getUniformLocation(sProgram, "diffuse");
	var specLoc = gl.getUniformLocation(sProgram, "specular");
	var shinLoc = gl.getUniformLocation(sProgram, "shininess");
	
	// Set view matrix
	//alert(showVec(lookAt));
	var vm = mat4.lookAt(eye,c,up);
	var vm3 = mat4.toMat3(vm);
	var viewMLoc = gl.getUniformLocation(sProgram, "viewM");
	gl.uniformMatrix4fv(viewMLoc, false, vm);
	
	// Set projection matrix
	var near = 0.1 + diag;
	var far  = 5 * diag;
	
	var oposite = Math.max(max[0] - c[0], max[1] - c[1]);
	var adjacent = (1.5 * diag) - ( (max[2] - min[2]) / 2 );
	var fov = 2 * ( Math.atan(oposite/adjacent) * 180.0 / Math.PI );
	//alert ("fov="+fov);
	var pm = mat4.perspective(fov, 1.0, near, far);
	
	var projMLoc = gl.getUniformLocation(sProgram, "projM");
	gl.uniformMatrix4fv(projMLoc, false, pm);
	
	var lightLoc = gl.getUniformLocation(sProgram, "light_src");
	gl.uniform4fv(lightLoc, light_src);
	
	// Render models
	var normalMatrix = mat3.create();
	var modelMLoc = gl.getUniformLocation(sProgram, "modelM");
	var normalMLoc = gl.getUniformLocation(sProgram, "normalM");
	
	for(var ni = 0; ni < obj.nodes.length; ++ni){
		var node = obj.nodes[ni]; // Get actual node
		
		// Send node modelmatrix
		gl.uniformMatrix4fv(modelMLoc, false, node.modelMatrix);
		
		// Calculate and send normal matrix
		var normalMatrix = mat4.toMat3(node.modelMatrix);
		mat3.inverse(normalMatrix);
		mat3.transpose(normalMatrix);
		mat3.multiply(vm3, normalMatrix, normalMatrix);
		
		gl.uniformMatrix3fv(normalMLoc, false, normalMatrix);
		
		// For each mesh in node
		for(var mi = 0; mi < node.meshIndices.length; ++mi){
			var mesh_index = node.meshIndices[mi];
			var mesh = obj.meshes[mesh_index]; // Get actual mesh
			
			// FIX for DijonPalais
			if(mesh.vertexNormals.length == 0) continue;
			
			// Send Diffuse property
			var diffuse;
			if(!obj.materials){
				diffuse = [1.0,1.0,1.0,1.0];
			}else{
				var material_index = mesh.materialIndex;
				diffuse = obj.materials[material_index].diffuseReflectance;
			}
			//alert(showVec(diffuse));
			gl.uniform4fv(diffLoc, diffuse);
			
			// Send Specular properties
			var specular;
			var shininess;
			if(!obj.materials){
				specular = [0.5,0.5,0.5,1.0];
				shininess = 4.0;
			}else{
				var material_index = mesh.materialIndex;
				specular = obj.materials[material_index].specularReflectance;
				shininess = obj.materials[material_index].shininess;
			}
			gl.uniform4fv(specLoc, specular);
			gl.uniform1fv(shinLoc, [shininess]);
			
			// Render Mesh
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mesh_index].vertex);
			gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mesh_index].normal);
			gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, true, 0, 0);
			
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

function loadFile(fileName){
	// Loads JSON file to model
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",fileName,false);
	xhttp.send();
	
	return xhttp.responseText;
}

// Loads and renders a JSON model
function load(modelName){
	
	// Loads JSON file to model
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET",modelName,false);
	xhttp.send();
	obj = JSON.parse(xhttp.responseText);
	
	// Prepare model
	setupModel();
	
	showLight();
	
	// Render model
	drawModel();
}

// Function called from webpage, when the user selects a model.
function loadModel(){

	// Get model name from combobox
	var modelName = document.getElementById("modelSelected").value;
	
	// Load and render the model
	load(modelName);
}

var rotateLightSource = false;
var request = 0;

function toggleRotation(){
	rotateLightSource = !rotateLightSource;
	if(rotateLightSource){
		(function callback(){
			request = window.webkitRequestAnimationFrame(callback);
			updateLightSource();
			drawModel();
		})();
		var button = document.getElementById("rotateButton");
		button.value = "Cancel rotation";
	}else{
		window.webkitCancelAnimationFrame(request);
		var button = document.getElementById("rotateButton");
		button.value = "Rotate light source";
	}
}

function toggleLightType(){
	light_point = !light_point;
	var text = document.getElementById("lt");
	if(light_point){
		text.value = "positional";
	}else{
		text.value = "directional";
	}
	
	setupLight();
	drawModel();
}

function toggleShaders(){
	shader2 = !shader2;
	var text = document.getElementById("shadText");
	if(shader2){
		vsCode = vsCodeB;
		fsCode = fsCodeB;
		text.value = "Fragment Shader";
	}else{
		vsCode = vsCodeA;
		fsCode = fsCodeA;
		text.value = "Vertex Shader";
	}
	
	makeShaderProgram();
	drawModel();
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
