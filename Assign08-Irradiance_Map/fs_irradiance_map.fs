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

uniform sampler2D irradiance_map_tex;
uniform float irradiance_scale;

varying vec3 vNorf;
varying vec3 vPosf;

// Transforms a direction from cartesian
// to spherical coordinates.
vec2 cartToSpher(vec3 dir){
	float r = sqrt(dir.x*dir.x + dir.y*dir.y + dir.z*dir.z);
	float theta = acos(dir.z / r);
	float phi = atan(dir.y,dir.x);
	return vec2(theta,phi);
}

vec2 toUV(vec3 dir){
	vec2 spher = cartToSpher(dir);
	float u = spher.x / M_PI;
	float v = 1.0-((spher.y + M_PI) / (2.0*M_PI));
	return vec2(u,v);
}

void main(void){
	vec3 normal = normalize(vNorf);
		
	vec2 coord = toUV(normal);

	vec3 env_color = texture2D(irradiance_map_tex,coord).rgb;
	
	gl_FragColor = vec4(env_color*irradiance_scale,1.0);
}
