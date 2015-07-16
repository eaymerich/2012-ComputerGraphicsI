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

// CIE color matching functions are available as a discrete array of [x(lamba), y(lambda), z(lambda)] values. 
// Lambda discretized at 5nm interval. Starting at 380nm.
var cie_colour_match=[ 
		0.0014,0.0000,0.0065, 0.0022,0.0001,0.0105, 0.0042,0.0001,0.0201,
		0.0076,0.0002,0.0362, 0.0143,0.0004,0.0679, 0.0232,0.0006,0.1102,
		0.0435,0.0012,0.2074, 0.0776,0.0022,0.3713, 0.1344,0.0040,0.6456,
		0.2148,0.0073,1.0391, 0.2839,0.0116,1.3856, 0.3285,0.0168,1.6230,
		0.3483,0.0230,1.7471, 0.3481,0.0298,1.7826, 0.3362,0.0380,1.7721,
		0.3187,0.0480,1.7441, 0.2908,0.0600,1.6692, 0.2511,0.0739,1.5281,
		0.1954,0.0910,1.2876, 0.1421,0.1126,1.0419, 0.0956,0.1390,0.8130,
		0.0580,0.1693,0.6162, 0.0320,0.2080,0.4652, 0.0147,0.2586,0.3533,
		0.0049,0.3230,0.2720, 0.0024,0.4073,0.2123, 0.0093,0.5030,0.1582,
		0.0291,0.6082,0.1117, 0.0633,0.7100,0.0782, 0.1096,0.7932,0.0573,
		0.1655,0.8620,0.0422, 0.2257,0.9149,0.0298, 0.2904,0.9540,0.0203,
		0.3597,0.9803,0.0134, 0.4334,0.9950,0.0087, 0.5121,1.0000,0.0057,
		0.5945,0.9950,0.0039, 0.6784,0.9786,0.0027, 0.7621,0.9520,0.0021,
		0.8425,0.9154,0.0018, 0.9163,0.8700,0.0017, 0.9786,0.8163,0.0014,
		1.0263,0.7570,0.0011, 1.0567,0.6949,0.0010, 1.0622,0.6310,0.0008,
		1.0456,0.5668,0.0006, 1.0026,0.5030,0.0003, 0.9384,0.4412,0.0002,
		0.8544,0.3810,0.0002, 0.7514,0.3210,0.0001, 0.6424,0.2650,0.0000,
		0.5419,0.2170,0.0000, 0.4479,0.1750,0.0000, 0.3608,0.1382,0.0000,
		0.2835,0.1070,0.0000, 0.2187,0.0816,0.0000, 0.1649,0.0610,0.0000,
		0.1212,0.0446,0.0000, 0.0874,0.0320,0.0000, 0.0636,0.0232,0.0000,
		0.0468,0.0170,0.0000, 0.0329,0.0119,0.0000, 0.0227,0.0082,0.0000,
		0.0158,0.0057,0.0000, 0.0114,0.0041,0.0000, 0.0081,0.0029,0.0000,
		0.0058,0.0021,0.0000, 0.0041,0.0015,0.0000, 0.0029,0.0010,0.0000,
		0.0020,0.0007,0.0000, 0.0014,0.0005,0.0000, 0.0010,0.0004,0.0000,
		0.0007,0.0002,0.0000, 0.0005,0.0002,0.0000, 0.0003,0.0001,0.0000,
		0.0002,0.0001,0.0000, 0.0002,0.0001,0.0000, 0.0001,0.0000,0.0000,
		0.0001,0.0000,0.0000, 0.0001,0.0000,0.0000, 0.0000,0.0000,0.0000
];

// Part of the information is from http://www.fourmilab.ch/documents/specrend/
var IlluminantC	=[0.3101, 0.3162],	    	/* For NTSC television */
IlluminantD65	=[0.3127, 0.3291],	    	/* Medium White: For EBU and SMPTE */
IlluminantD50	=[0.34567, 0.3585],	    	/* Warm White: For wide gamut */
IlluminantD75	=[0.29902, 0.31485],	    /* Cool White: Day Light*/
I9300K			=[0.2848, 0.2932],			/* High efficiency blue phospor monitor*/
IlluminantE		=[0.33333333, 0.33333333];  /* CIE equal-energy illuminant */
var GAMMA_REC709 =	0;		/* Rec. 709 */

// Data From http://www.brucelindbloom.com
// Name xRed yRed xGreen yGreen xBlue yBlue White point Gamma 
function ColourSystem(name,xR,yR,xG,yG,xB,yB,wp,g) {
	this.name=name;		/* Colour system name */
	this.xRed=xR;		/* Red x, y */
	this.yRed=yR;
	this.xGreen=xG;		/* Green x, y */
	this.yGreen=yG;
	this.xBlue=xB;		/* Blue x, y */
	this.yBlue=yB;
	this.xWhite=wp[0];	/* White point x, y */
	this.yWhite=wp[1];  	    
	this.gamma=g;		/* Gamma correction for system */
};

var colorSystems = [
	new ColourSystem("Adobe", 0.64,  0.33,   0.21,   0.71,  0.15,  0.06,   IlluminantD65,  GAMMA_REC709),
	new ColourSystem("Apple", 0.625,  0.34,   0.28,   0.595,  0.155,  0.07,   IlluminantD65, GAMMA_REC709),
	new ColourSystem("BestRGB", 0.7347,  0.2653,   0.215,   0.775,  0.13,  0.035,   IlluminantD50, GAMMA_REC709),
	new ColourSystem("BetaRGB", 0.6888,  0.3112,   0.1985,   0.7551,  0.1265,  0.0352,   IlluminantD50, GAMMA_REC709),
	new ColourSystem("BruceRGB", 0.64,   0.33,   0.28,   0.65,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("CIE", 0.735, 0.265, 0.274, 0.717, 0.167, 0.009, IlluminantE,    GAMMA_REC709 ),
	new ColourSystem("ColorMatch",0.630, 0.340, 0.295, 0.605, 0.150, 0.075, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("DonRGB4",0.696, 0.300, 0.215, 0.765, 0.130, 0.035, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("ECI v2",0.670, 0.330, 0.210, 0.710, 0.140, 0.080, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("Ekta space PS5",0.695, 0.305, 0.260, 0.700, 0.110, 0.005, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("HDTV", 0.670,  0.330,  0.210,  0.710,  0.150,  0.060,  IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("NTSC", 0.67,   0.33,   0.21,   0.71,   0.14,   0.08,   IlluminantC,    GAMMA_REC709 ),
	new ColourSystem("EBU (PAL/SECAM)",0.64,   0.33,   0.29,   0.60,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("Pro Photo",0.7347, 0.2653, 0.1596, 0.8404, 0.0366, 0.0001, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("CIE REC 709", 0.64,   0.33,   0.30,   0.60,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("SMPTE", 0.630,  0.340,  0.310,  0.595,  0.155,  0.070,  IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("sRGB", 0.640,  0.330,  0.300,  0.600,  0.150,  0.060,  IlluminantD65,  2.2 ),
	new ColourSystem("700/525/450nm", 0.7347, 0.2653, 0.1152, 0.0584, 0.1566, 0.0177, IlluminantD50,  2.2 )
	];
var colorSystem = colorSystems[14];

var xyzTOrgbMatrix;

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
	new Shader("Perfect Mirror","vs_simple.vs","fs_simple.fs"),
	new Shader("Intensity (Gray Sky)","vs_gray.vs","fs_gray.fs"),
	new Shader("Fresnel Only","vs_gray.vs","fs_fresnel.fs"),
	new Shader("Metalic Reflection","vs_gray.vs","fs_metalic.fs"),
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

// Variables for Cook-Torrance
var red_wave = 630.0;
var green_wave = 533.0;
var blue_wave = 473.0;

var SPECTRUM_LENGTH = 40;
var WAVELENGTH_STEP = 10;
var ct_n;
var ct_k;
var ct_RMS_slope = 0.4;

function calculateXYZtoRGBMatrix(){
	
	// Get RGB->XYZ matriz
	var xr = colorSystem.xRed;
	var yr = colorSystem.yRed;
	var zr = 1.0 - xr - yr;
	var xg = colorSystem.xGreen;
	var yg = colorSystem.yGreen;
	var zg = 1.0 - xg - yg;
	var xb = colorSystem.xBlue;
	var yb = colorSystem.yBlue;
	var zb = 1.0 - xb - yb;
	var xw = colorSystem.xWhite;
	var yw = colorSystem.yWhite;
	var zw = 1.0 - xw - yw;
	
	var Xw = xw / yw;
	var Yw = 1.0;
	var Zw = zw / yw;
	
	// Calculate Cr, Cg, Cb
	var det   = (xr*yg*zb + yr*zg*xb + zr*xg*yb) - (xb*yg*zr + yb*zg*xr + zb*xg*yr);
	var detCr = (Xw*yg*zb + Yw*zg*xb + Zw*xg*yb) - (xb*yg*Zw + yb*zg*Xw + zb*xg*Yw);
	var detCg = (xr*Yw*zb + yr*Zw*xb + zr*Xw*yb) - (xb*Yw*zr + yb*Zw*xr + zb*Xw*yr);
	var detCb = (xr*yg*Zw + yr*zg*Xw + zr*xg*Yw) - (Xw*yg*zr + Yw*zg*xr + Zw*xg*yr);
	
	var Cr = detCr / det;
	var Cg = detCg / det;
	var Cb = detCb / det;
	
	// Multiply Cr,Cg,Cb
	xr *= Cr; yr *= Cr; zr *= Cr;
	xg *= Cg; yg *= Cg; zg *= Cg;
	xb *= Cb; yb *= Cb; zb *= Cb;

	// Calculate XYZ->RGB matrix (by inverting RGB->XYZ matriz)
	
	var detM = xr*(yg*zb - yb*zg) - xg*(yr*zb - yb*zr) + xb*(yr*zg - yg*zr);
	
	var rx = (yg*zb - yb*zg) / detM;
	var ry = (xb*zg - xg*zb) / detM;
	var rz = (xg*yb - xb*yg) / detM;
	var gx = (yb*zr - yr*zb) / detM;
	var gy = (xr*zb - xb*zr) / detM;
	var gz = (xb*yr - xr*yb) / detM;
	var bx = (yr*zg - yg*zr) / detM;
	var by = (xg*zr - xr*zg) / detM;
	var bz = (xr*yg - xg*yr) / detM;
	
	xyzTOrgbMatrix = mat3.createFrom(rx, gx, bx, ry, gy, by, rz, gz, bz);
}

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
	
	// Send n k vectors
	var nfLoc = gl.getUniformLocation(sProgram, "nf");
	var kfLoc = gl.getUniformLocation(sProgram, "kf");
	gl.uniform1fv(nfLoc, ct_n);
	gl.uniform1fv(kfLoc, ct_k);
	
	// Send CIE color matching functions
	var cie_colour_matchLoc = gl.getUniformLocation(sProgram, "cie_colour_match");
	gl.uniform3fv(cie_colour_matchLoc, cie_colour_match);
	
	// Send XYZ to RGB matrix
	var xyzTOrgbLoc = gl.getUniformLocation(sProgram, "xyzTOrgb");
	gl.uniformMatrix3fv(xyzTOrgbLoc, false, xyzTOrgbMatrix);
	
	// Send gamma
	var gammaLoc = gl.getUniformLocation(sProgram, "gamma");
	gl.uniform1fv(gammaLoc, [colorSystem.gamma]);
	
	// Activate and sends Textures
	envCubeLoc = gl.getUniformLocation(sProgram, "envCube");
	//console.log("texCube.complete=" + texCube.complete);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texCube);
	gl.uniform1i(envCubeLoc,1);
	
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
		mat3.multiply(vm3, normalMatrix, normalMatrix);
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

function loadCubeMap2() {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);//LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var faces = [["posx.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["negx.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["posy.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["negy.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["posz.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["negz.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function(texture, face, image) {
            return function() {
				//console.log("Cuber map texture : "+image.src+" loaded. "+image.width+"x"+image.height);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				//if (face==gl.TEXTURE_CUBE_MAP_NEGATIVE_Z) gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
        } (texture, face, image);
        image.src = faces[i][0];
		if(i == 5){
			texture.complete = image.complete;
			//drawModel();
		}
    }
    return texture;
}

// Loading cubemap
function loadCubemap(cubemaptexturefiles){
	var tex = gl.createTexture();
	var directions =[
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
		];
	function loadACubeFace(dir) {
		var image = new Image();
		image.onload = function() {
			count--; 
			if (count==0) tex.complete = image.complete;
			console.log("Cuber map texture : "+image.src+" loaded. "+image.width+"x"+image.height);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
			gl.texImage2D(directions[dir], 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			if (count==0){
				 // EDWARD
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);//gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
			}
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		};
		image.src = cubemaptexturefiles[dir];
	}
	var count = 6;
	for (var i=0; i<6;i++) loadACubeFace(i);
	return tex;
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

function findLowerI( metalSymbol,  wavelength){
	var index = "l" + metalSymbol;
	
	// search for the index
	var i = 0;
	while (i < metalData[index].length){
		if(metalData[index][i] >= wavelength){
			i--;
			break;
		}
		i++;
	}
	
	return i;
}

function makeNKvectors(metal){
	var wavelength;
	ct_n = new Array();
	ct_k = new Array();
	
	for(var i = 0; i < SPECTRUM_LENGTH; i++){
		wavelength = 380 + i*WAVELENGTH_STEP;
		
		// Find boundary index
		var lowI = findLowerI(metal, wavelength);
		var highI = lowI + 1;
		var waveLow  = metalData["l"+metal][lowI];
		var waveHigh = metalData["l"+metal][highI];
		var nLow  = metalData["n"+metal][lowI];
		var nHigh = metalData["n"+metal][highI];
		var kLow  = metalData["k"+metal][lowI];
		var kHigh = metalData["k"+metal][highI];
		
		// Find linear interpolations
		var n = lerp(waveLow, waveHigh, nLow, nHigh, wavelength);
		var k = lerp(waveLow, waveHigh, kLow, kHigh, wavelength);
		
		//console.log(i + ": " + waveLow + "-" + wavelength + "-" + waveHigh + " | " + nLow + " - " + n + " - " + nHigh);
		
		// Save values;
		ct_n[i] = n;
		ct_k[i] = k;
	}
}

function setMetal(){
	var metalSelected = document.getElementById("metalSelect").value;
	
	makeNKvectors(metalSelected);
	
	//console.log("n" + metalSelected + "=" + showVec(ct_n));
	
	drawModel();
}
/*
function setMetal_old(){
	var metalSelected = document.getElementById("metalSelect").value;
	
	ct_n = [0.0,0.0,0.0];
	ct_k = [0.0,0.0,0.0];
	var i = findLowerI(metalSelected,red_wave);
	ct_n[0] = metalData["n"+metalSelected][i];
	ct_k[0] = metalData["k"+metalSelected][i];
	
	i = findLowerI(metalSelected,green_wave);
	ct_n[1] = metalData["n"+metalSelected][i];
	ct_k[1] = metalData["k"+metalSelected][i];
	
	i = findLowerI(metalSelected,blue_wave);
	ct_n[2] = metalData["n"+metalSelected][i];
	ct_k[2] = metalData["k"+metalSelected][i];
	
	//alert("n=" + showVec(ct_n) + "\nk=" + showVec(ct_k));
	drawModel();
}*/

function fillMetalSelect(){
	var metalSelect = document.getElementById("metalSelect");
	for(var i = 0; i < metals.length; i++){
		var newOption = document.createElement("option");
		newOption.text = metals[i];
		newOption.value = metals[i];
		if(metals[i] == "Au"){
			newOption.selected = true;
		}
		metalSelect.options.add(newOption);
	}
}

function changeColorSpace(){
	var select = document.getElementById("colorSpaceSelect");
	colorSystem = colorSystems[select.selectedIndex];
	calculateXYZtoRGBMatrix();
	drawModel();
}

function fillColorSpaceSelect(){
	var select = document.getElementById("colorSpaceSelect");
	for(var i = 0; i < colorSystems.length; i++){
		var option = document.createElement("option");
		option.text = colorSystems[i].name;
		option.value = i;
		if(colorSystems[i] == colorSystem){
			option.selected=true;
		}
		select.options.add(option);
	}
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

// Inits WebGL and renders default model.
function main(){

	// Fill options in HTML
	fillColorSpaceSelect();
	fillShaderSelect();
	fillMetalSelect();

	// Get canvas from document.
	var canvas = document.getElementById("myCanvas");
	
	// Get WebGL context, and paint canvas.
	gl = WebGLDebugUtils.makeDebugContext( initWebGL(canvas) );
	if (gl) {
		// Sets default background color
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
		
		
		/*
		texFiles = [
			"posx.jpg",
			"negx.jpg",
			"posy.jpg",
			"negy.jpg",
			"posz.jpg",
			"negz.jpg"
		];
		texCube = loadCubemap(gl,texFiles);*/

		// Prepares shader program.
		makeShaderProgram();
		
		// Load textures
		texCube = loadCubeMap2();
		
		//
		calculateXYZtoRGBMatrix();
		
		// Draws default model to canvas.
		loadModel();
		
		// Set metal vectors
		var metalSelected = document.getElementById("metalSelect").value;
		makeNKvectors(metalSelected);
		
		setTimeout(drawModel,200);
	}
	
}
