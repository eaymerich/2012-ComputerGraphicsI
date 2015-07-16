// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 8

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform sampler2D tex;
uniform vec3 eye;

varying vec3 vNorf;
varying vec3 vPosf;

vec2 toUV(vec3 dir){
	float r = ( (1.0 / M_PI) * acos(dir.z) ) / ( sqrt( dir.x*dir.x + dir.y*dir.y ) );
	
	// (u,v) are in range [-1,1]
	float u = dir.x * r;
	float v = dir.y * r;
	
	// convert to range [0,1]
	float s = (u * 0.5) + 0.5;
	float t = (v * 0.5) + 0.5;
	
	return vec2(s,t);
}

void main(void){
	vec3 normal = normalize(vNorf);
	vec3 view = normalize(vPosf - eye);

	vec3 refl = reflect(view,normal);
	
	vec2 coord = toUV(refl);

	vec3 env_color = texture2D(tex,coord).rgb;
	
	gl_FragColor = vec4(env_color,1.0);
}
