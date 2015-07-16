/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 5

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

var nVertices;

// WebGL context as a global variable.
// Not very elegant. :(
var gl;

// Shader Code
var vsCodeA = loadFile("vs_gouraud.vs");
var vsCodeB = loadFile("vs_phong.vs");
var vsCodeC = loadFile("vs_blinn-phong.vs");
var vsCodeD = loadFile("vs_cook-torrance.vs");
var vsCodeE = loadFile("vs_oren-nayar.vs");
var vsCode = vsCodeD;

// Fragment code
var fsCodeA = loadFile("fs_gouraud.fs");
var fsCodeB = loadFile("fs_phong.fs");
var fsCodeC = loadFile("fs_blinn-phong.fs");
var fsCodeD = loadFile("fs_cook-torrance.fs");
var fsCodeE = loadFile("fs_oren-nayar.fs");
var fsCode = fsCodeD;

// Shader program
var sProgram;
var selected_shader = 3;
var total_shaders = 5;

// Model variables
var obj;
var center;
var max,min;
var diag;
var buffers;

// Camera parameters
var eye;
var lookAt;
var up;
var rotateCamera = false;

// Light parameters
var light_point = false;
var light_src = [0.0,0.0,0.0,0.0];
var light_rup = (Math.PI * 2.0) / 240;//0.0;
var light_rup_delta = (Math.PI * 2.0) / 240;

var i_ambient = 0.1; // Ambient intensity.

var sigma = 0.2; // Standard deviation for Oren-Nayar shader.

// Variables for Cook-Torrance
var red_wave = 630.0;
var green_wave = 533.0;
var blue_wave = 473.0;

var ct_n = [0.0,0.0,0.0];
var ct_k = [0.0,0.0,0.0];
var ct_RMS_slope = 0.4;
var ct_shininess = 5.0;

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
	center = vec3.create();
	vec3.add(max,min,center);
	vec3.scale(center,0.5);
	
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
	
	setupCamera();

	setupLight();
	
}

function setupCamera(){
	// Setup Camera
	eye = vec3.create(center);
	eye[2] = center[2] + (1.5 * diag);
	lookAt = vec3.create();
	vec3.subtract(center, eye, lookAt);
	vec3.normalize(lookAt);
	up = vec3.create();
	up[1] = 1;
}

function updateCamera(){
	// Rotate Camera
	if(rotateCamera){
		// Rotate the eye
		var teye = vec4.createFrom(eye[0]-center[0],eye[1]-center[1],eye[2]-center[2],1.0);
		
		var rotM = mat4.identity();
		mat4.rotateY(rotM,light_rup);
		mat4.multiplyVec4(rotM,teye);

		eye[0] = teye[0]+center[0];
		eye[1] = teye[1]+center[1];
		eye[2] = teye[2]+center[2];
		
		/*
		var minus_center = vec3.create(center);
		vec3.scale(minus_center, -1.0);
		
		var teye = vec4.createFrom(eye[0],eye[1],eye[2],1.0);
		
		var t1Mat = mat4.identity();
		mat4.translate(t1Mat,minus_center);
		
		var rMat = mat4.identity();
		mat4.rotateY(rMat,light_rup);
		
		var t2Mat = mat4.identity();
		mat4.translate(t2Mat,center);
		
		var fullMat = mat4.create();
		mat4.multiply(rMat,t1Mat, fullMat);
		mat4.multiply(t2Mat,fullMat,fullMat);
		
		mat4.multiplyVec4(fullMat,teye);
		
		eye = vec3.create(teye);
		*/
		// Update the rest
		lookAt = vec3.create();
		vec3.subtract(center, eye, lookAt);
		vec3.normalize(lookAt);
		up = vec3.create();
		up[1] = 1;
	}
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
		light_src[0] = center[0];// + diag;
		light_src[1] = center[1];// + diag;
		light_src[2] = center[2] + diag;
		light_src[3] = 1.0;
	}else{
		// is a direction
		light_src = vec4.create();
		var viewVec = vec3.create(lookAt);
		vec3.scale(viewVec,-1.0);
		light_src[0] = viewVec[0];
		light_src[1] = viewVec[1];
		light_src[2] = viewVec[2];
		//vec3.lerp(viewVec, up, 0.5, light_src);
		vec3.normalize(light_src);
		light_src[3] = 0.0;
	}
}

function updateLightSource(){
	if(rotateLightSource){
		// Rotate the light source
		if(light_src[3] == 0.0){
			// Just rotate the direction
			var rotM = mat4.identity();
			mat4.rotateY(rotM,light_rup);
			mat4.multiplyVec4(rotM,light_src);
		}else{
			// We must translate, rotate and translate the point
			light_src[0] -= center[0];
			light_src[1] -= center[1];
			light_src[2] -= center[2];
			var rotM = mat4.identity();
			mat4.rotateY(rotM,light_rup);
			mat4.multiplyVec4(rotM,light_src);
			light_src[0] += center[0];
			light_src[1] += center[1];
			light_src[2] += center[2];
		}
		showLight();
	}
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
	var ambiLoc = gl.getUniformLocation(sProgram, "k_ambient");
	var iambLoc = gl.getUniformLocation(sProgram, "i_ambient");
	gl.uniform1fv(iambLoc, [i_ambient]);
	
	// Set view matrix
	//alert(showVec(lookAt));
	var vm = mat4.lookAt(eye,center,up);
	var vm3 = mat4.toMat3(vm);
	var viewMLoc = gl.getUniformLocation(sProgram, "viewM");
	gl.uniformMatrix4fv(viewMLoc, false, vm);
	
	// Set projection matrix
	var near = 0.1 + diag;
	var far  = 5 * diag;
	
	var oposite = Math.max(max[0] - center[0], max[1] - center[1]);
	var adjacent = (1.5 * diag) - ( (max[2] - min[2]) / 2 );
	var fov = 2 * ( Math.atan(oposite/adjacent) * 180.0 / Math.PI );
	//alert ("fov="+fov);
	var pm = mat4.perspective(fov, 1.0, near, far);
	
	var projMLoc = gl.getUniformLocation(sProgram, "projM");
	gl.uniformMatrix4fv(projMLoc, false, pm);
	
	var lightLoc = gl.getUniformLocation(sProgram, "light_src");
	gl.uniform4fv(lightLoc, light_src);
	
	// Send shader specific parameters
	if(selected_shader == 4){
		// Oren-Nayar shader
		var sigmaLoc = gl.getUniformLocation(sProgram, "sigma");
		gl.uniform1fv(sigmaLoc, [sigma]);
	}
	if(selected_shader == 3) {
		// Cook-Torrance shader
		var nLoc = gl.getUniformLocation(sProgram, "n");
		gl.uniform3fv(nLoc, ct_n);
		
		var kLoc = gl.getUniformLocation(sProgram, "k");
		gl.uniform3fv(kLoc, ct_k);
		
		var shinLoc = gl.getUniformLocation(sProgram, "ct_shininess");
		gl.uniform1fv(shinLoc, [ct_shininess]);
	}
	
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
		mat3.inverse(normalMatrix,normalMatrix);
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
			//alert(showVec(diffuse));
			
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
				if(shininess == 0.0) shininess = 5.0; // HACK for skull model.
			}
			gl.uniform4fv(specLoc, specular);
			gl.uniform1fv(shinLoc, [shininess]);
			
			// Send ambient property
			var ambient;
			if(!obj.materials){
				ambient = [0.3,0.3,0.3,1.0];
			}else{
				var material_index = mesh.materialIndex;
				ambient = obj.materials[material_index].ambientReflectance;
			}
			gl.uniform4fv(ambiLoc, ambient);
			
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

function startAnimation(){
	(function callback(){
		request = window.webkitRequestAnimationFrame(callback);
		updateLightSource();
		updateCamera();
		drawModel();
	})();
}

function stopAnimation(){
	window.webkitCancelAnimationFrame(request);
	request = 0;
}

function toggleCameraRotation(){
	rotateCamera = !rotateCamera;
	var button = document.getElementById("rotateCamButton");
	if(rotateCamera){
		if(!rotateLightSource){
			startAnimation();
		}
		button.value = "Stop Camera";
	}else{
		if(!rotateLightSource){
			stopAnimation();
		}
		button.value = "Rotate Camera";
	}
}

function toggleRotation(){
	rotateLightSource = !rotateLightSource;
	var button = document.getElementById("rotateButton");
	if(rotateLightSource){
		if(!rotateCamera){
			startAnimation();
		}
		button.value = "Cancel rotation";
	}else{
		if(!rotateCamera){
			stopAnimation();
		}
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
	showLight();
	drawModel();
}

function toggleShaders(){
	selected_shader = (selected_shader + 1) % total_shaders;
	var text = document.getElementById("shadText");
	
	switch(selected_shader){
		case 0:
			text.value = "Gouraud Shading";
			vsCode = vsCodeA;
			fsCode = fsCodeA;
			break;
		case 1:
			text.value = "Phong Shading";
			vsCode = vsCodeB;
			fsCode = fsCodeB;
			break;
		case 2:
			text.value = "Blinn-Phong Shading";
			vsCode = vsCodeC;
			fsCode = fsCodeC;
			break;
		case 3:
			text.value = "Cook-Torrance Shading";
			vsCode = vsCodeD;
			fsCode = fsCodeD;
			break;
		case 4:
			text.value = "Oren-Najar Shading";
			vsCode = vsCodeE;
			fsCode = fsCodeE;
			break;
	}
	
	makeShaderProgram();
	drawModel();
}

function setSigma(){
	var text = document.getElementById("sigma");
	sigma = parseFloat(text.value);
	drawModel();
}

function fillMetalSelect(){
	var metalSelect = document.getElementById("metalSelect");
	//alert(metals.length);
	for(var i = 0; i < metals.length; i++){
		var newOption = document.createElement("option");
		newOption.text = metals[i];
		newOption.value = metals[i];
		metalSelect.options.add(newOption);
	}
}

function findI( metalSymbol,  wavelength){
	var index = "l" + metalSymbol;
	
	// search the index
	var i = 0;
	while (i < metalData[index].length){
		if(metalData[index][i] >= wavelength){
			break;
		}
		i++;
	}
	
	return i;
}

function setMetal(){
	var metalSelected = document.getElementById("metalSelect").value;
	
	ct_n = [0.0,0.0,0.0];
	ct_k = [0.0,0.0,0.0];
	var i = findI(metalSelected,red_wave);
	ct_n[0] = metalData["n"+metalSelected][i];
	ct_k[0] = metalData["k"+metalSelected][i];
	
	i = findI(metalSelected,green_wave);
	ct_n[1] = metalData["n"+metalSelected][i];
	ct_k[1] = metalData["k"+metalSelected][i];
	
	i = findI(metalSelected,blue_wave);
	ct_n[2] = metalData["n"+metalSelected][i];
	ct_k[2] = metalData["k"+metalSelected][i];
	
	//alert("n=" + showVec(ct_n) + "\nk=" + showVec(ct_k));
	drawModel();
}

function setShininess(){
	var text = document.getElementById("shininess");
	ct_shininess = parseFloat(text.value);
	drawModel();
	//alert(ct_shininess);
}

// Inits WebGL and renders default model.
function main(){
	// Get canvas from document.
	var canvas = document.getElementById("myCanvas");
	
	// Get WebGL context, and paint canvas.
	gl = WebGLDebugUtils.makeDebugContext( initWebGL(canvas) );
	if (gl) {
		// Sets default background color
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 

		// Prepares shader program.
		makeShaderProgram();
		
		// Draws default model to canvas.
		loadModel();
		
		// Sets values
		var text = document.getElementById("sigma");
		text.value = sigma;
		
		var text2 = document.getElementById("shininess");
		text2.value = ct_shininess;
		
		fillMetalSelect();
	}
	
}
