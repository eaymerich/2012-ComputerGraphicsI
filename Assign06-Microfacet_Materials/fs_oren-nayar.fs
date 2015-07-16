// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 5

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform float sigma;

varying vec3 cvNor;
varying vec3 clight;
varying vec3 viewf;
varying vec4 diffusef;
varying vec4 specularf;
varying float shininessf;
varying vec4 k_ambientf;
varying float i_ambientf;

float getA(float sigma2){
	float a = 1.0 - ( sigma2 / ( 2.0 * (sigma2+0.33) ));
	return a;
}

float getB(float sigma2){
	float b = (0.45*sigma2) / (sigma2 + 0.09);
	return b;
}

void main(void){
	
	vec3 light = normalize(clight);
	vec3 normal = normalize(cvNor);
	vec3 view = normalize( viewf );
	vec3 h = normalize(light+view);
	
	//float sigma = 0.4;
	float sigma2 = sigma*sigma;
	
	// Diffuse calculation
	
	float cos_theta_i = max(0.0, dot(light, normal));
	float theta_i = acos(cos_theta_i);
	float cos_theta_r = max(0.0, dot(view, normal));
	float theta_r = acos(cos_theta_r);
	
	vec3 u_i = normalize(light - (cos_theta_i)*normal);
	vec3 u_r = normalize(view - (cos_theta_r)*normal);
	
	float cos_phi_diff = dot(u_i, u_r);
	
	float alpha = max(theta_r, theta_i);
	float beta = min(theta_r, theta_i);
	
	float f = cos_theta_i * ( getA(sigma2) + ( getB(sigma2) * max(0.0, cos_phi_diff) * sin(alpha) * tan(beta) ) );
	f = f / M_PI;
	
	vec3 i_diff = vec3(diffusef) * f;
	
	// Ambient calculation
	vec3 i_amb = vec3(k_ambientf) * i_ambientf;
	
	// Color calculation
	vec3 color = min( i_amb + i_diff, 1.0);

	gl_FragColor = vec4(color, 1.0);
}
