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

uniform vec3 n;
uniform vec3 k;
uniform float ct_shininess;

varying vec3 cvNor;
varying vec3 clight;
varying vec3 viewf;
varying vec4 diffusef;
varying vec4 specularf;
varying float shininessf;
varying vec4 k_ambientf;
varying float i_ambientf;


float fresnel(float cos_theta, float n, float k){

	float n2 = n*n;
	float k2 = k*k;
	float cos2_theta = cos_theta * cos_theta;
	
	//if(cos_theta == 0.0) return 0.0;
	
	float r_parallel = ( (n2+k2)*cos2_theta - 2.0*n*cos_theta + 1.0 ) / ( (n2+k2)*cos2_theta + 2.0*n*cos_theta + 1.0 );
	
	float r_perpendicular = ( (n2+k2) - 2.0*n*cos_theta + cos2_theta ) / ( (n2+k2) + 2.0*n*cos_theta + cos2_theta );
	
	float ro = ( r_parallel + r_perpendicular ) / 2.0;
	
	return ro;
}

float facet_distribution(float cos_alpha, float m){
	
	//if(cos_alpha == 0.0) return 0.0;
	
	float cos2_alpha = cos_alpha * cos_alpha;
	float cos4_alpha = pow(cos_alpha,4.0);
	float m2 = m*m;
	
	float exponent = -( (1.0 - cos2_alpha) / (cos2_alpha * m2) );
	
	float d = exp(exponent) / ( m2 * cos4_alpha );
	
	return d;
}

/*
float masking_shadowing(vec3 n, vec3 v, vec3 l, vec3 h){
	float shadowing = ( 2.0 * dot(n,h) * dot(n,v) ) / ( dot(v,h) );
	
	float masking = ( 2.0 * dot(n,h) * dot(n,l) ) / ( dot(v,h) );

	//float sam = clamp( min(shadowing,masking) , 0.0, 1.0);
	float sam = min( min(shadowing,masking) , 1.0);
	
	return sam;
}
*/

float masking_shadowing(vec3 n, vec3 v, vec3 l, vec3 h){

	float cos_alpha = max(0.0, dot(n,h));
	float cos_theta_i = max(0.0, dot(n,l));
	float cos_theta_r = max(0.0, dot(n,v));
	float cos_vh = max(0.0, dot(v,h));

	float shadowing = ( 2.0 * cos_alpha * cos_theta_r ) / ( cos_vh );
	
	float masking = ( 2.0 * cos_alpha * cos_theta_i ) / ( cos_vh );

	//float sam = clamp( min(shadowing,masking) , 0.0, 1.0);
	float sam = min( min(shadowing,masking) , 1.0);
	
	return sam;
}

void main(void){
	
	// Specular calculation
	
	vec3 light = normalize(clight);
	vec3 normal = normalize(cvNor);
	vec3 view = normalize( viewf );
	vec3 h = normalize(light+view);

	// Fresnel reflectance
	float cos_theta_i = max(0.0, dot(light,normal) );
	float cos_theta_r = max(0.0, dot(view,normal) );
	vec3 f;
	
	f.r = fresnel(cos_theta_i, n.r, k.r);
	f.g = fresnel(cos_theta_i, n.g, k.g);
	f.b = fresnel(cos_theta_i, n.b, k.b);
	
	// Microfacet distribution
	float cos_alpha = max(0.0, dot(h,normal) );
	float d = pow(cos_alpha,ct_shininess);
	//float d = facet_distribution(cos_alpha, 0.4);
	
	// Geometric attenuation (Masking and Shadowing)
	float g = masking_shadowing(normal, view, light, h);
	
	vec3 fs = f * ( ( g * d ) / (4.0 * cos_theta_i * cos_theta_r ) );
	//vec3 fs = f * g * d / (cos_theta_i);
	
	// Ambient calculation
	vec3 i_amb = vec3(k_ambientf) * i_ambientf;
	
	// Color calculation
	vec3 color = min( i_amb + fs, 1.0);

	gl_FragColor = vec4(color, 1.0);
	//gl_FragColor = vec4(f, 1.0);
	//gl_FragColor = vec4(d,d,d, 1.0);
	//gl_FragColor = vec4(f*g*d, 1.0);
	//gl_FragColor = vec4((4.0 * cos_theta_i * cos_theta_r ),0.0,0.0, 1.0);
	
	//gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	
}
