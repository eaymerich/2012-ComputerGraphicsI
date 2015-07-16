// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 8

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

uniform mat4 vmM;			// View-Model matrix.
uniform mat4 projM;			// Projection matrix.
uniform mat3 normalM;		// Normal matrix.

attribute vec3 vPos;		// Vertex position.
attribute vec3 vNor;		// Vertex normal.

varying vec3 vNorf;
varying vec3 vPosf;

void main(void){

	// Convert position to camera space
	vec4 cvPos = vmM*vec4(vPos,1.0);
	
	// Send normal to fragment shader
	vNorf = normalize(normalM*vNor);
	
	// Send vertex position to fragment shader
	vPosf = vPos;
	
	gl_Position = projM*cvPos;
}
