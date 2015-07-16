/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 8

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

// WebGL context as a global variable.
// Not very elegant. :(
var gl;
var nVertices;

// Shader Code
function Shader(name,vs_file,fs_file) {
	this.name=name;
	this.vs_file=vs_file;
	this.fs_file=fs_file;
};

var shaders = [
	new Shader("HDR Reflect","vs_hdr.vs","fs_hdr.fs"),
	new Shader("HDR Map","vs_hdr.vs","fs_hdr_map.fs"),
	new Shader("Irradiance Map","vs_hdr.vs","fs_irradiance_map.fs")
	];
var shader = shaders[shaders.length-1];

// Vertex Shader code
var vsCode = loadFile(shader.vs_file);

// Fragment Shader code
var fsCode = loadFile(shader.fs_file);

// Shader program
var sProgram;

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

// Textures
var texCube;
var img;
var tex;
var irradiance_map;
var irradiance_map_width = 32;
var irradiance_map_height = 64;
var irradiance_map_thetas = 32;
var irradiance_map_phis = 64;
var irradiance_map_tex;
var irradiance_scale = 1.0 / 30000.0;

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
		
		// Update the rest
		lookAt = vec3.create();
		vec3.subtract(center, eye, lookAt);
		vec3.normalize(lookAt);
		up = vec3.create();
		up[1] = 1;
	}
}

function loadTextureToGPU(){

	if(tex) { return;}

	if(!img.data){console.log("img not ready"); return;}
	
	var image = img;
	tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,tex);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB, image.width, image.height, 0, gl.RGB, gl.FLOAT, image.data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);	
	
}

function loadIrradianceToGPU() {
	var image = irradiance_map;
	
	if(!image.data){console.log("Irradiance data not ready"); return;}
	
	irradiance_map_tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, irradiance_map_tex);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB, image.width, image.height, 0, gl.RGB, gl.FLOAT, image.data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);	
	
	console.log("Irradiance data stored in GPU");
}

// Renders a JSON model
function drawModel(){
	
	// Ready to draw
	
	loadTextureToGPU();

	// Clear canvas.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Set Shader program
	gl.useProgram(sProgram);
	
	// Get location for vertex positions and normals
	var posLoc = gl.getAttribLocation(sProgram, "vPos");
	gl.enableVertexAttribArray(posLoc);
	var normalLoc = gl.getAttribLocation(sProgram, "vNor");
	gl.enableVertexAttribArray(normalLoc);
		
	// Calculate and send view matrix
	//alert(showVec(lookAt));
	var vm = mat4.lookAt(eye,center,up);
	var vm3 = mat4.toMat3(vm);
	//var viewMLoc = gl.getUniformLocation(sProgram, "viewM");
	//gl.uniformMatrix4fv(viewMLoc, false, vm);
	
	// Calculate and send projection matrix
	var near = 0.1 + diag;
	var far  = 5 * diag;
	var oposite = Math.max(max[0] - center[0], max[1] - center[1]);
	var adjacent = (1.5 * diag) - ( (max[2] - min[2]) / 2 );
	var fov = 2 * ( Math.atan(oposite/adjacent) * 180.0 / Math.PI );
	var pm = mat4.perspective(fov, 1.0, near, far);
	var projMLoc = gl.getUniformLocation(sProgram, "projM");
	gl.uniformMatrix4fv(projMLoc, false, pm);
	
	// Send the eye
	var eyeLoc = gl.getUniformLocation(sProgram, "eye");
	gl.uniform3fv(eyeLoc, eye);
	
	//var normalMatrix = mat3.create();
	//var modelMLoc = gl.getUniformLocation(sProgram, "modelM");
	var normalMLoc = gl.getUniformLocation(sProgram, "normalM");
	
	var vmM = mat4.create();
	var vmMLoc = gl.getUniformLocation(sProgram, "vmM");
	
	// Send HDR map
	var texLoc = gl.getUniformLocation(sProgram, "tex");
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(texLoc,1);
	
	// Send Irradiance map
	var irradiance_map_texLoc = gl.getUniformLocation(sProgram, "irradiance_map_tex");
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, irradiance_map_tex);
	gl.uniform1i(irradiance_map_texLoc,2);
	
	// Send irradiance scale
	var irradiance_scaleLoc = gl.getUniformLocation(sProgram, "irradiance_scale");
	gl.uniform1fv(irradiance_scaleLoc, [irradiance_scale]);
	
	// Render models
	for(var ni = 0; ni < obj.nodes.length; ++ni){
		var node = obj.nodes[ni]; // Get actual node
		
		// Send node modelmatrix
		//gl.uniformMatrix4fv(modelMLoc, false, node.modelMatrix);
		
		// Calculate and send view-model matrix
		mat4.multiply(vm,node.modelMatrix,vmM);
		gl.uniformMatrix4fv(vmMLoc, false, vmM);
		
		// Calculate and send normal matrix
		var normalMatrix = mat4.toMat3(node.modelMatrix);
		mat3.inverse(normalMatrix,normalMatrix);
		mat3.transpose(normalMatrix);
		//mat3.multiply(vm3, normalMatrix, normalMatrix);
		gl.uniformMatrix3fv(normalMLoc, false, normalMatrix);
		
		// For each mesh in node
		for(var mi = 0; mi < node.meshIndices.length; ++mi){
			var mesh_index = node.meshIndices[mi];
			var mesh = obj.meshes[mesh_index]; // Get actual mesh
			
			// FIX for DijonPalais
			if(mesh.vertexNormals.length == 0) continue;
						
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
	
	// Render model
	//drawModel();
}

// Function called from webpage, when the user selects a model.
function loadModel(){

	// Get model name from combobox
	//var modelName = document.getElementById("modelSelected").value;
	var modelName = "Teapot.json";
	
	// Load and render the model
	load(modelName);
}

// Animation callback request.
var request = 0;

function startAnimation(){
	if(request == 0){
		(function callback(){
			request = window.webkitRequestAnimationFrame(callback);
				updateCamera();
				drawModel();
		})();
	}
}

function stopAnimation(){
	if(request != 0){
		window.webkitCancelAnimationFrame(request);
		request = 0;
	}
}

function toggleCameraRotation(){
	rotateCamera = !rotateCamera;
	var button = document.getElementById("rotateCamButton");
	if(rotateCamera){
		startAnimation();
		button.value = "Stop Camera";
	}else{
		stopAnimation();
		button.value = "Rotate Camera";
	}
}

function lerp(xa, xb, ya, yb, x){
	var y = ya + ( (yb-ya) * ( (x-xa) / (xb-xa) ) );
	return y;
}

var print = 0;

function getRadiance(hdr_map,direction){

	var x = direction[0];
	var y = direction[1];
	var z = direction[2];
	
	//if(print == 1) console.log("xyz=["+x+","+y+","+z+"]");

	// Calculate probe texture coordinates [u,v]
	var div = Math.sqrt( x*x + y*y );
	var r = 0;
	if(div != 0){
		r = ( (1.0/Math.PI) * Math.acos(z) ) / ( div );
	}
	var u = x * r;
	var v = y * r;
	
	//if(print == 1) console.log("ruv=["+r+","+u+","+v+"]");
	
	// Convert to standar texture coordinates
	var s = (u * 0.5) + 0.5;
	var t = (v * 0.5) + 0.5;
	
	// Covert to integer coordinates
	var si = Math.round( lerp(0.0,1.0,0,hdr_map.width-1,s) );
	var ti = Math.round( lerp(0.0,1.0,0,hdr_map.height-1,t) );
	
	var index = ((hdr_map.width*ti) + si) * 3;
	
	var radiance = new Array();
	
	//if (hdr_map.data) console.log("hdr_map.width="+hdr_map.width+" hdr_map.height="+hdr_map.height);
	
	radiance[0] = hdr_map.data[index];
	radiance[1] = hdr_map.data[index+1];
	radiance[2] = hdr_map.data[index+2];
	
	//if(print == 1) console.log("rad=["+radiance[0]+","+radiance[1]+","+radiance[2]+"] si=" +si+" ti="+ti+" index="+index);
	
	return radiance;
}

function getIrradianceForNormal(hdr_map,theta,phi){

	var thetas = irradiance_map_thetas;
	var phis = irradiance_map_phis;
	
	var delta_theta = 180.0 / thetas;
	var delta_phi = 380.0 / phis;

	// Convert normal to cartesian coordinates
	var normal = spherToCart(theta,phi);
	
	var irradiance = new Array();
	irradiance[0] = 0.0;
	irradiance[1] = 0.0;
	irradiance[2] = 0.0;
	
	for(var j = 0; j < thetas; j++){
		for(var i = 0; i < phis; i++){
		
			// Calculate omega (in sphere coordinates)
			var theta_j = lerp(0.0,thetas-1,0.0,180.0,j);
			var phi_i = lerp(0.0,phis-1,0.0,360.0,i);
			//if(j < 2 && i < 2) console.log("theta_j="+theta_j+" phi_i="+phi_i);
			
			// Calculate delta omega
			var delta_omega = delta_theta * delta_phi * Math.sin(degToRad(theta_j));
			
			// Convert omega to cartesian coordinates
			var omega = spherToCart(theta_j, phi_i);
			//if(j < 2 && i < 3) console.log("omega=["+omega[0]+","+omega[1]+","+omega[2]+"]");
			
			var n_dot_w = Math.max( vec3.dot(normal,omega), 0);
			
			//if(j== 0 && i == 0){print = 1;}
			var radiance = getRadiance(hdr_map,omega);
			//print = 0;
			//if(j==0 && i == 0){console.log("radiance=["+radiance[0]+","+radiance[1]+","+radiance[2]+"]");}
			
			irradiance[0] += radiance[0] * n_dot_w * delta_omega;
			irradiance[1] += radiance[1] * n_dot_w * delta_omega;
			irradiance[2] += radiance[2] * n_dot_w * delta_omega;
			
			//if(j==0 && i == 0) console.log("radiance=["+radiance[0]+","+radiance[1]+","+radiance[2]+"]");
		}
	}

	return irradiance;
}

function makeIrradianceMap(hdr_map){
	console.log("Calculating Irradiance Map");
	var im = {};
	im.width = irradiance_map_width;
	im.height = irradiance_map_height;
	im.data =  new Float32Array(im.width*im.height*3);
	
	// For every pixel in the irradiance map
	for(var y = 0; y < im.height; y++){
		for(var x = 0; x < im.width; x++){
			// Calculate the spherical coordinates
			var theta = lerp(0.0,im.width-1,0.0,180.0,x);
			var phi = lerp(0.0,im.height-1,0.0,360.0,y);
			
			// Get the irradiance for the normal (theta,phi)
			var irradiance = getIrradianceForNormal(hdr_map,theta,phi);
			//console.log("[x,y]=["+x+","+y+"] irradiance=["+irradiance[0]+","+irradiance[1]+","+irradiance[2]+"]");
			
			// Store irradiance in Irradiance Map
			var index = ((y*im.width)+x)*3;
			
			im.data[index] = irradiance[0];
			im.data[index+1] = irradiance[1];
			im.data[index+2] = irradiance[2];
			/*
			im.data[index] = 1.0;
			im.data[index+1] = 0.0;
			im.data[index+2] = 0.0;*/
		}
	}
	console.log("Irradiance Map done!");
	return im;
}

function setShader(){
	var select = document.getElementById("shaderSelect");
	shader = shaders[select.selectedIndex];
	
	//alert(shader);
	
	vsCode = loadFile(shader.vs_file);
	fsCode = loadFile(shader.fs_file);
	
	makeShaderProgram();
	
	drawModel();
}

function fillShaderSelect(){
	var select = document.getElementById("shaderSelect");
	for(var i = 0; i < shaders.length; i++){
		var option = document.createElement("option");
		option.text = shaders[i].name;
		option.value = i;
		if(shaders[i] == shader){
			option.selected=true;
		}
		select.options.add(option);
	}
}

function setHDR(){
	var select = document.getElementById("HDRSelect");
	hdr_file = select.options[select.selectedIndex].value;
	var hdr=new HDRimage();
	img=hdr.readFile(hdr_file,true);
}

function generateIrradianceMap(){

	// Get values from interface
	var text = document.getElementById("widthText");
	irradiance_map_width = parseInt(text.value);
	text = document.getElementById("heightText");
	irradiance_map_height = parseInt(text.value);
	text = document.getElementById("thetasText");
	irradiance_map_thetas = parseInt(text.value);
	text = document.getElementById("phisText");
	irradiance_map_phis = parseInt(text.value);

	if(!img.data){ alert("HDR image not ready"); return;}
	
	console.log("HDR image ready");
	setStatus("Generating Irradiance Map... please wait.");
	irradiance_map = makeIrradianceMap(img);
	setStatus("Irradiance Map completed.");
	enableGenerate(false);
	enableRender(true);
	
	loadIrradianceToGPU();
}

function setScale(){
	var text = document.getElementById("scaleText");
	irradiance_scale = 1.0 / parseFloat(text.value);
}

function setStatus(str){
	var text = document.getElementById("statusText");
	text.value = str;
}

function enableRender(val){
	var button = document.getElementById("rotateCamButton");
	button.disabled = !val;
}

function enableGenerate(val){
	var button = document.getElementById("genIMButton");
	button.disabled = !val;
}

function fillIrradianceMapData(){
	var text = document.getElementById("widthText");
	text.value = irradiance_map_width;
	text = document.getElementById("heightText");
	text.value = irradiance_map_height;
	text = document.getElementById("thetasText");
	text.value = irradiance_map_thetas;
	text = document.getElementById("phisText");
	text.value = irradiance_map_phis;
	text = document.getElementById("scaleText");
	text.value = 1.0/irradiance_scale;
}

// Inits WebGL and renders default model.
function main(){

	// Fill options in HTML
	fillShaderSelect();
	fillIrradianceMapData();

	// Get canvas from document.
	var canvas = document.getElementById("myCanvas");
	
	// Get WebGL context, and paint canvas.
	gl = WebGLDebugUtils.makeDebugContext( initWebGL(canvas) );
	
	if (!gl.getExtension("OES_texture_float")) {
		alert("This project requires the OES_texture_float extension. Must use a separate hardware.");
		return false;
	}
	
	if (gl) {
		// Sets default background color
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
		
		// Prepares shader program.
		makeShaderProgram();
		
		// Load textures
		// texCube = loadCubeMap2();
		var hdr=new HDRimage();
		img=hdr.readFile("rnl_probe.hdr",true);
		
		//calculateXYZtoRGBMatrix();
		
		// Draws default model to canvas.
		loadModel();
				
		setStatus("Please generate irradiance map before rendering.");
		
		//setTimeout(drawModel,100);
	}
	
}
