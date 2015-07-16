// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 4

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

uniform mat4 modelM;		// Model matrix.
uniform mat4 viewM;			// View matrix (camera matrix).
uniform mat4 projM;			// Projection matrix.
uniform mat3 normalM;		// Normal matrix.
uniform vec4 diffuse;		// Diffuse material property.
uniform vec4 specular;		// Specular material property.
uniform float shininess;	// Shininess.
uniform vec4 light_src;		// Light direction or position, in world space.

attribute vec3 vPos;		// Vertex position.
attribute vec3 vNor;		// Vertex color.

varying vec3 cvNor;
varying vec3 clight;
varying vec3 viewf;
varying vec4 diffusef;
varying vec4 specularf;
varying float shininessf;

void main(void){

	// Convert position to camera space
	vec4 cvPos = viewM*modelM*vec4(vPos,1.0);

	// Convert light to camera space
	if(light_src.w == 0.0){
		// Light_src is a direction
		clight = vec3(viewM*light_src);
	} else {
		// Light_src is a position;
		clight = vec3(viewM*light_src - cvPos);
	}
	
	// Convert normal to camera space
	cvNor = normalM * vec3(vNor.x,vNor.y,-vNor.z);
	
	// Specular calculation
	viewf = vec3(cvPos);
	
	diffusef = diffuse;
	specularf = specular;
	shininessf = shininess;
	
	gl_Position = projM*cvPos;
}
