// University of Central Florida
// Department of Electric Engineering & Computer Science
// Fall 2012

// CAP 5725 - Computer Graphics I
// Prof.: Sumanta Pattanaik.

// Assignment 5

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
uniform vec4 k_ambient;		// Ambient material property.
uniform float i_ambient;	// Ambient intensity.
uniform vec4 light_src;		// Light direction or position, in world space.

attribute vec3 vPos;		// Vertex position.
attribute vec3 vNor;		// Vertex color.

varying mediump vec3 color;	// Color for fragment shader.

void main(void){

	// Convert position to camera space
	vec4 cvPos = viewM*modelM*vec4(vPos,1.0);

	// Convert to camera space
	vec3 light;
	if(light_src.w == 0.0){
		// Light_src is a direction
		light = vec3(viewM * light_src);
	} else {
		// Light_src is a position;
		light = vec3((viewM * light_src) - cvPos);
	}
	light = normalize(light); 
	
	// Diffuse calculation
	//vec3 normal_c = normalize(normalM * vec3(vNor.x,vNor.y,vNor.z));
	vec3 normal_c = normalize(normalM * vNor);
	float doti = dot(light,normal_c);
	float cos_theta = max( doti, 0.0);
	vec3 i_diff = cos_theta * vec3(diffuse);
	
	// Specular calculation
	vec3 cPos = vec3(cvPos);
	vec3 view = normalize( (-cPos) );
	vec3 refl = (2.0 * ( doti ) * normal_c) - light;
	float cos_alpha = max( dot(refl,view), 0.0);
	vec3 i_spec = pow(cos_alpha, shininess) * vec3(specular);
	//i_spec = vec3(0.0);
	// Color calculation
	color = min( (vec3(k_ambient) * i_ambient) + i_diff + i_spec, 1.0);
	
	gl_Position = projM*cvPos;
}
