// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 8

// Student: Edward Aymerich.
// PID: 3167485

// Copyright 2012 UCF.

#define SPECTRUM_LENGTH 40 
#define WAVELENGTH_STEP 10

#define GAMMA_REC709 0.0

precision mediump float;

uniform samplerCube envCube;
uniform vec3 eye;
uniform mat3 xyzTOrgb;
uniform float gamma;
uniform float nf[SPECTRUM_LENGTH];
uniform float kf[SPECTRUM_LENGTH];
uniform vec3 cie_colour_match[81];

varying vec3 vNorf;
varying vec3 vPosf;


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

vec3 constrain_rgb(vec3 rgb_color){	

	// Amount of white needed is w = - min(0, r, g, b) 
	float w = - min(0.0, min(rgb_color.r, min(rgb_color.g, rgb_color.b)));
	
	vec3 crgb = vec3(rgb_color.r+w, rgb_color.g+w, rgb_color.b+w);
	
	// Colour within RGB gamut
	return crgb;
	//return vec3(0.0);
}

float gamma_correct(float gamma, float c){
	if (gamma == GAMMA_REC709) {
		// Rec. 709 gamma correction. 
		float cc = 0.018;
		
		if (c < cc) {
			c *= ((1.099 * pow(cc, 0.45)) - 0.099) / cc;
		} else {
			c = (1.099 * pow(c, 0.45)) - 0.099;
		}
	} else {
		// Nonlinear colour = (Linear colour)^(1/gamma) 
		c = pow(c, 1.0/gamma);
	}
	return c;
}

vec3 getXYZ(float cos_theta){
	vec3 color = vec3(0.0,0.0,0.0);
	float maxY = 0.0;
	
	for(int i = 0; i < SPECTRUM_LENGTH; i++){
		float f = fresnel(cos_theta, nf[i], kf[i]);
		color.x += cie_colour_match[i*2].x * f;
		color.y += cie_colour_match[i*2].y * f;
		color.z += cie_colour_match[i*2].z * f;
		maxY += ( cie_colour_match[i*2].y * 1.0);
	}
	
	color /= maxY;
	
	return color;
}


vec3 toRGB(vec3 xyz_color){
	vec3 rgb_color = xyzTOrgb * xyz_color;
	
	// Constrain RGB value to be inside RGB gamut color
	vec3 crgb = constrain_rgb(rgb_color);
	
	// Apply gamma_correction
	float r = gamma_correct(GAMMA_REC709,crgb.r);
	float g = gamma_correct(GAMMA_REC709,crgb.g);
	float b = gamma_correct(GAMMA_REC709,crgb.b);
	
	return vec3(r,g,b);
	//return crgb;
}

void main(void){
	vec3 normal = normalize(vNorf);
	vec3 view = normalize(vPosf - eye);
	
	vec3 refView = reflect(view,normal);
	vec3 env_color = textureCube(envCube,refView).rgb;
	
	float cos_theta_i = max(0.0, dot(refView,normal) );
	
	vec3 xyz_color = getXYZ(cos_theta_i);
	vec3 rgb_color = toRGB(xyz_color);
	
	gl_FragColor = vec4(rgb_color,1.0);
}
