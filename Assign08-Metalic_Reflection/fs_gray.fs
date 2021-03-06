// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 8

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

precision mediump float;

uniform samplerCube envCube;
uniform vec3 eye;

varying vec3 vNorf;
varying vec3 vPosf;

void main(void){
	vec3 normal = normalize(vNorf);
	vec3 view = normalize(vPosf - eye);
	
	vec3 refView = reflect(view,normal);
	//vec3 skycolor = textureCube(cubemap,reflectedView).rgb;
	vec3 env_color = textureCube(envCube,refView).rgb;
	
	float env_intensity = env_color.r * 0.3 + env_color.g * 0.68 + env_color.b * 0.02;
	
	gl_FragColor = vec4(env_intensity,env_intensity,env_intensity,1.0);
}
