// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 4

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

precision mediump float;

varying vec3 cvNor;
varying vec3 clight;
varying vec3 viewf;
varying vec4 diffusef;
varying vec4 specularf;
varying float shininessf;

void main(void){
	
	// Diffuse calculation
	vec3 light = normalize(clight);
	vec3 normal_c = normalize(cvNor);
	float doti = dot(light,normal_c);
	float cos_theta = max( doti, 0.0);
	vec3 i_diff = cos_theta * vec3(diffusef);
	
	// Specular calculation
	vec3 view = normalize( viewf );
	vec3 refl = (2.0 * ( doti ) * normal_c) - light;
	float cos_alpha = max( dot(refl,view), 0.0);
	vec3 i_spec = pow(cos_alpha, shininessf) * vec3(specularf);
	
	// Color calculation
	vec3 color = min(i_diff + i_spec, 1.0);

	gl_FragColor = vec4(color, 1.0);
}
