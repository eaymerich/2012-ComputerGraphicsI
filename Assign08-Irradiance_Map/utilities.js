function initWebGL(canvas){
  // Initialize glContext to null.
  var glContext = null;
   
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    glContext = canvas.getContext("webgl",{stencil: true}) || canvas.getContext("experimental-webgl",{stencil: true});
	//glContext = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {  
	  alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  return glContext;
}
function init(canvasName, debugFlag){
	if (!window.requestAnimationFrame){
		window.requestAnimationFrame = (function(){
			return  window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
		})();
	}
  var canvas = document.getElementById(canvasName);

  function logGLCalls(functionName, args) {   
      console.log("gl." + functionName + "(" +  WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
  } 
  function throwOnGLError(err, funcName, args) {
	  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
  }
  
  function validateNoneOfTheArgsAreUndefined(functionName, args) {
	  for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
		  console.error("undefined passed to gl." + functionName + "(" +
						 WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	  }
  } 
  function logAndValidate(functionName, args) {
	   logGLCalls(functionName, args);
	   validateNoneOfTheArgsAreUndefined (functionName, args);
  }
  var gl = initWebGL(canvas);
  if (debugFlag===true)
	gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, logAndValidate);
  if (gl) {
	//gl.canvas.width = window.innerWidth;
	//gl.canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);                      // Set clear color to black, fully opaque
	gl.clearStencil(0);
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
  }
  return gl;
}

function makeButton(wrappedGLContext, func, label) {
  var div = document.createElement("div");
  var button = document.createElement("button");
  button.innerHTML = label;
  button.addEventListener('click', function() {
    func(wrappedGLContext);
  });
  div.appendChild(button);
  document.body.appendChild(div);
}


function initBuffer(gl,verts) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  return buffer;
}
function initIndexBuffer(gl,indices) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);  
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  return buffer;
}

// initShaders: creates and initializes the shaders.
// Links the shaders to create the program
function initShaders(gl, vsSource, fsSource){
	//Create the vertex shader and initialize it.
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	if(!vertexShader){
		alert("Can not create: " + VERTEX_SHADER);
		return undefined;
	}	
	gl.shaderSource(vertexShader, vsSource);	
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		alert("An error occurred compiling vertex shader: " + gl.getShaderInfoLog(vertexShader)); 
		alert(vsSource);
		return undefined;
	}	
	//Get the fragment shader and initialize it.
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	if(!fragmentShader){
		alert("Can not create: " + FRAGMENT_SHADER);
		return undefined;
	}	
	gl.shaderSource(fragmentShader, fsSource);	
	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		alert("An error occurred compiling fragment shader: " + gl.getShaderInfoLog(fragmentShader)); 
		alert(fsSource);
		return undefined;
	}
	
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	
	//Now we can link the program with our gl context.
	gl.linkProgram(shaderProgram);
	
	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program."+ gl.getProgramInfoLog(shaderProgram));
	}
	return shaderProgram; 
}

//Get shader shource from document.
//Often shader code is declared in the document (mostly inside header) as scripts in following fashion.
// <script id="shader-fs" type="x-shader/x-fragment">
// ...shader code...
// </script>
// or
// <script id="shader-vs" type="x-shader/x-vertex">
// ...shader code...
// </script>
// getShaderSourceFromDOM extract this shader code and returns.
//
function getShaderSourceFromDOM(id,type){ // type is "x-shader/x-fragment" or "x-shader/x-vertex"
	var shaderScript = document.getElementById(id);
	
	//if there is not shaderScript, return null as well.
	if(!shaderScript){
		alert("Id: "+id+" not found in document.");
		return;
	}

	if(shaderScript.type != type){	
		alert("Type mismatch. Expected: "+type+" Found: "+shaderScript.type);
		return;
	}
	
	//Go through  the strings in the html file under the shader script and concatenate the strings into theSource.
	var theSource = "";
	var currentChild = shaderScript.firstChild;
	
	//Traverse the shader.
	while(currentChild){
		if(currentChild.nodeType == currentChild.TEXT_NODE){
			theSource += currentChild.textContent+"\n";//Concatenate into the source.
		}
		currentChild = currentChild.nextSibling;
	}
	return theSource;
}

//This function gets called when reading a JSON file. It stores the current xml information.
function parseJSON(jsonFile)
{
	var	xhttp = new XMLHttpRequest();
	xhttp.open("GET", jsonFile, false);
	xhttp.overrideMimeType("application/json");
	xhttp.send(null);	
	var Doc = xhttp.responseText;
	return JSON.parse(Doc);
}

function isPowerOfTwo(x) {
	return (x & (x - 1)) == 0;
}	 
function nextHighestPowerOfTwo(x) {
	--x;
	for (var i = 1; i < 32; i <<= 1) {
		x = x | x >> i;
	}
	return x + 1;
}
function setCubemap(gl, cubemaptexturefiles) 
{
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
	  count--; if (count==0) tex.complete = image.complete;
	  //console.log("Cuber map texture : "+image.src+" loaded. "+image.width+"x"+image.height);
	  gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
      gl.texImage2D(directions[dir], 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, image);
	  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	  if (count==0){
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
};

function setTexture(gl,textureFileName,raw)
{
	var tex = gl.createTexture();
	tex.width = 0; tex.height = 0;
	var img = new Image();
	img.onload = function(){
		var nPOT = false; // nPOT: notPowerOfTwo
		//console.log(textureFileName+" loaded : "+img.width+"x"+img.height);
		tex.complete = img.complete;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		if (!isPowerOfTwo(img.width) || !isPowerOfTwo(img.height)) nPOT = true;
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
		//void texImage2D(enum target, int level, enum internalformat, enum format, enum type, Object object);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, (nPOT)?gl.CLAMP_TO_EDGE:gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, (nPOT)?gl.CLAMP_TO_EDGE:gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, (raw)?gl.NEAREST:gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, (raw)?gl.NEAREST:((nPOT)?gl.LINEAR:gl.LINEAR_MIPMAP_LINEAR));
		if (!nPOT)gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		tex.width = img.width;
		tex.height = img.height;
	};
	img.src = textureFileName;
	return tex;
}

//This function converts from spherical to cartesian. Returns an array containing three values (x,y,z).
function spherToCart(theta, phi,r){
	if (!r) r = 1;
	var radTheta = degToRad(theta);
	var radPhi = degToRad(phi);
	var retval = new Array();
	retval[0] = r*Math.cos(radPhi) * Math.sin(radTheta);//Convert to cartesian coordinates, radius=1.
	retval[1] = r*Math.sin(radPhi) * Math.sin(radTheta);//Convert to cartesian coordinates
	retval[2] = r*Math.cos(radTheta);
	return retval;
}

function radToDeg(radians)
{
	return radians * 180 / Math.PI
}

function degToRad(degrees)
{
	return degrees*(Math.PI/180);
}
function getRotationMatrix(angle,center,axis)
{
	var m = mat4.create();
	mat4.identity(m);
	return mat4.translate(mat4.rotate(mat4.translate(m,center),degToRad(angle), axis),[-center[0],-center[1],-center[2]]);
}

function getShadowProjectionMatrix(L,Q,n)// Light: 4 element vector, Q: point on Projection plane, n: normal to the projection plane
{  
	var lightIsDirection=(L[3]===0);
	//console.log("Light is direction :"+lightIsDirection);
	//console.log(L+" "+Q+" "+n);
	  var nDotL = n[0]*L[0]+n[1]*L[1]+n[2]*L[2];
	  var nDotQ = n[0]*Q[0]+n[1]*Q[1]+n[2]*Q[2];
	  var mat=[];
	  //console.log(nDotL+" "+nDotQ);
	  // Create the matrix. OpenGL uses column by column ordering

	  mat[0]  = -nDotL+((lightIsDirection)?0:nDotQ)+n[0]*L[0]; 
	  mat[4]  = n[1]*L[0]; 
	  mat[8]  = n[2]*L[0]; 
	  mat[12] = -nDotQ*L[0];
	  
	  mat[1]  = n[0]*L[1];        
	  mat[5]  = -nDotL+((lightIsDirection)?0:nDotQ)+n[1]*L[1];
	  mat[9]  = n[2]*L[1]; 
	  mat[13] = -nDotQ*L[1];
	  
	  mat[2]  = n[0]*L[2];        
	  mat[6]  = n[1]*L[2]; 
	  mat[10] = -nDotL+((lightIsDirection)?0:nDotQ)+n[2]*L[2];; 
	  mat[14] = -nDotQ*L[2];
	  
	  mat[3]  = (lightIsDirection)?0:n[0];        
	  mat[7]  = (lightIsDirection)?0:n[1]; 
	  mat[11] = (lightIsDirection)?0:n[2]; 
	  mat[15] = -nDotL;
	if (mat[15] < 0){
		for(var i=0; i<16;i++) mat[i] = -mat[i];
	}
	return mat;
}
