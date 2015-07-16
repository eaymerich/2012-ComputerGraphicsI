// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 5

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
varying vec4 k_ambientf;
varying float i_ambientf;

void main(void){
	
	// Diffuse calculation
	vec3 light = normalize(clight);
	vec3 normal = normalize(cvNor);
	float doti = dot(light,normal);
	float cos_theta = max( doti, 0.0);
	vec3 i_diff = cos_theta * vec3(diffusef);
	
	// Specular calculation
	vec3 view = normalize( viewf );
	vec3 h = normalize(light+view);
	float cos_alpha = dot(normal,h);
	vec3 i_spec = pow(cos_alpha, 4.0*shininessf) * vec3(specularf);
	// multiplies shininess by 4, to look similar to Phong.
	
	// Ambient calculation
	vec3 i_amb = vec3(k_ambientf) * i_ambientf;
	
	// Color calculation
	vec3 color = min( i_amb + i_diff + i_spec, 1.0);

	gl_FragColor = vec4(color, 1.0);
}
