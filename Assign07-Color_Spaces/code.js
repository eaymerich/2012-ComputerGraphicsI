/********************************************************************
University of Central Florida
Department of Electric Engineering & Computer Science
Fall 2012

CAP 5725 - Computer Graphics I
Prof.: Sumanta Pattanaik.

Assignment 7

Student: Edward Aymerich.
PID: 3167485

Copyright 2012 UCF.
********************************************************************/

var spectrum_index = 0;

var spectrum_context;
var temp_context;
var rgb_context;
var fcolor_contex;

var apply_constrain_rgb = true;
var apply_gamma_correction = true;

//Black body radiator temperature approximation of various illuminants.
var bb_name = [
	"Candle flame", "Sunlight at sunset", "Tungsten bulb--60 watt", "Tungsten bulb--200 watt", "Tungsten/halogen lamp",
	"Carbon arc lamp", "Sunlight plus skylight", "Xenon strobe light", "Overcast sky", "North sky light"
	];
var bb_temp = [
	1900, 2000, 2800, 2900, 3300,
	3780, 5500, 6000, 6500, 7500
	];
var bb_index = 0;
	
// CIE color matching functions are available as a discrete array of [x(lamba), y(lambda), z(lambda)] values. 
// Lambda discretized at 5nm interval. Starting at 380nm.
var cie_colour_match=[ 
		[0.0014,0.0000,0.0065], [0.0022,0.0001,0.0105], [0.0042,0.0001,0.0201],
		[0.0076,0.0002,0.0362], [0.0143,0.0004,0.0679], [0.0232,0.0006,0.1102],
		[0.0435,0.0012,0.2074], [0.0776,0.0022,0.3713], [0.1344,0.0040,0.6456],
		[0.2148,0.0073,1.0391], [0.2839,0.0116,1.3856], [0.3285,0.0168,1.6230],
		[0.3483,0.0230,1.7471], [0.3481,0.0298,1.7826], [0.3362,0.0380,1.7721],
		[0.3187,0.0480,1.7441], [0.2908,0.0600,1.6692], [0.2511,0.0739,1.5281],
		[0.1954,0.0910,1.2876], [0.1421,0.1126,1.0419], [0.0956,0.1390,0.8130],
		[0.0580,0.1693,0.6162], [0.0320,0.2080,0.4652], [0.0147,0.2586,0.3533],
		[0.0049,0.3230,0.2720], [0.0024,0.4073,0.2123], [0.0093,0.5030,0.1582],
		[0.0291,0.6082,0.1117], [0.0633,0.7100,0.0782], [0.1096,0.7932,0.0573],
		[0.1655,0.8620,0.0422], [0.2257,0.9149,0.0298], [0.2904,0.9540,0.0203],
		[0.3597,0.9803,0.0134], [0.4334,0.9950,0.0087], [0.5121,1.0000,0.0057],
		[0.5945,0.9950,0.0039], [0.6784,0.9786,0.0027], [0.7621,0.9520,0.0021],
		[0.8425,0.9154,0.0018], [0.9163,0.8700,0.0017], [0.9786,0.8163,0.0014],
		[1.0263,0.7570,0.0011], [1.0567,0.6949,0.0010], [1.0622,0.6310,0.0008],
		[1.0456,0.5668,0.0006], [1.0026,0.5030,0.0003], [0.9384,0.4412,0.0002],
		[0.8544,0.3810,0.0002], [0.7514,0.3210,0.0001], [0.6424,0.2650,0.0000],
		[0.5419,0.2170,0.0000], [0.4479,0.1750,0.0000], [0.3608,0.1382,0.0000],
		[0.2835,0.1070,0.0000], [0.2187,0.0816,0.0000], [0.1649,0.0610,0.0000],
		[0.1212,0.0446,0.0000], [0.0874,0.0320,0.0000], [0.0636,0.0232,0.0000],
		[0.0468,0.0170,0.0000], [0.0329,0.0119,0.0000], [0.0227,0.0082,0.0000],
		[0.0158,0.0057,0.0000], [0.0114,0.0041,0.0000], [0.0081,0.0029,0.0000],
		[0.0058,0.0021,0.0000], [0.0041,0.0015,0.0000], [0.0029,0.0010,0.0000],
		[0.0020,0.0007,0.0000], [0.0014,0.0005,0.0000], [0.0010,0.0004,0.0000],
		[0.0007,0.0002,0.0000], [0.0005,0.0002,0.0000], [0.0003,0.0001,0.0000],
		[0.0002,0.0001,0.0000], [0.0002,0.0001,0.0000], [0.0001,0.0000,0.0000],
		[0.0001,0.0000,0.0000], [0.0001,0.0000,0.0000], [0.0000,0.0000,0.0000]
];

// Spectral reflectance data for Macbeth colorchecker at 10 nm interval, starting from 380nm. 
var colorChecker=[ 
[0.055,0.058,0.061,0.062,0.062,0.062,0.062,0.062,0.062,0.062,0.062,0.063,0.065,0.070,0.076,0.079,0.081,0.084,0.091,0.103,0.119,0.134,0.143,0.147,0.151,0.158,0.168,0.179,0.188,0.190,0.186,0.181,0.182,0.187,0.196,0.209],
[0.117,0.143,0.175,0.191,0.196,0.199,0.204,0.213,0.228,0.251,0.280,0.309,0.329,0.333,0.315,0.286,0.273,0.276,0.277,0.289,0.339,0.420,0.488,0.525,0.546,0.562,0.578,0.595,0.612,0.625,0.638,0.656,0.678,0.700,0.717,0.734],
[0.130,0.177,0.251,0.306,0.324,0.330,0.333,0.331,0.323,0.311,0.298,0.285,0.269,0.250,0.231,0.214,0.199,0.185,0.169,0.157,0.149,0.145,0.142,0.141,0.141,0.141,0.143,0.147,0.152,0.154,0.150,0.144,0.136,0.132,0.135,0.147],
[0.051,0.054,0.056,0.057,0.058,0.059,0.060,0.061,0.062,0.063,0.065,0.067,0.075,0.101,0.145,0.178,0.184,0.170,0.149,0.133,0.122,0.115,0.109,0.105,0.104,0.106,0.109,0.112,0.114,0.114,0.112,0.112,0.115,0.120,0.125,0.130],
[0.144,0.198,0.294,0.375,0.408,0.421,0.426,0.426,0.419,0.403,0.379,0.346,0.311,0.281,0.254,0.229,0.214,0.208,0.202,0.194,0.193,0.200,0.214,0.230,0.241,0.254,0.279,0.313,0.348,0.366,0.366,0.359,0.358,0.365,0.377,0.398],
[0.136,0.179,0.247,0.297,0.320,0.337,0.355,0.381,0.419,0.466,0.510,0.546,0.567,0.574,0.569,0.551,0.524,0.488,0.445,0.400,0.350,0.299,0.252,0.221,0.204,0.196,0.191,0.188,0.191,0.199,0.212,0.223,0.232,0.233,0.229,0.229],
[0.054,0.054,0.053,0.054,0.054,0.055,0.055,0.055,0.056,0.057,0.058,0.061,0.068,0.089,0.125,0.154,0.174,0.199,0.248,0.335,0.444,0.538,0.587,0.595,0.591,0.587,0.584,0.584,0.590,0.603,0.620,0.639,0.655,0.663,0.663,0.667],
[0.122,0.164,0.229,0.286,0.327,0.361,0.388,0.400,0.392,0.362,0.316,0.260,0.209,0.168,0.138,0.117,0.104,0.096,0.090,0.086,0.084,0.084,0.084,0.084,0.084,0.085,0.090,0.098,0.109,0.123,0.143,0.169,0.205,0.244,0.287,0.332],
[0.096,0.115,0.131,0.135,0.133,0.132,0.130,0.128,0.125,0.120,0.115,0.110,0.105,0.100,0.095,0.093,0.092,0.093,0.096,0.108,0.156,0.265,0.399,0.500,0.556,0.579,0.588,0.591,0.593,0.594,0.598,0.602,0.607,0.609,0.609,0.610],
[0.092,0.116,0.146,0.169,0.178,0.173,0.158,0.139,0.119,0.101,0.087,0.075,0.066,0.060,0.056,0.053,0.051,0.051,0.052,0.052,0.051,0.052,0.058,0.073,0.096,0.119,0.141,0.166,0.194,0.227,0.265,0.309,0.355,0.396,0.436,0.478],
[0.061,0.061,0.062,0.063,0.064,0.066,0.069,0.075,0.085,0.105,0.139,0.192,0.271,0.376,0.476,0.531,0.549,0.546,0.528,0.504,0.471,0.428,0.381,0.347,0.327,0.318,0.312,0.310,0.314,0.327,0.345,0.363,0.376,0.381,0.378,0.379],
[0.063,0.063,0.063,0.064,0.064,0.064,0.065,0.066,0.067,0.068,0.071,0.076,0.087,0.125,0.206,0.305,0.383,0.431,0.469,0.518,0.568,0.607,0.628,0.637,0.640,0.642,0.645,0.648,0.651,0.653,0.657,0.664,0.673,0.680,0.684,0.688],
[0.066,0.079,0.102,0.146,0.200,0.244,0.282,0.309,0.308,0.278,0.231,0.178,0.130,0.094,0.070,0.054,0.046,0.042,0.039,0.038,0.038,0.038,0.038,0.039,0.039,0.040,0.041,0.042,0.044,0.045,0.046,0.046,0.048,0.052,0.057,0.065],
[0.052,0.053,0.054,0.055,0.057,0.059,0.061,0.066,0.075,0.093,0.125,0.178,0.246,0.307,0.337,0.334,0.317,0.293,0.262,0.230,0.198,0.165,0.135,0.115,0.104,0.098,0.094,0.092,0.093,0.097,0.102,0.108,0.113,0.115,0.114,0.114],
[0.050,0.049,0.048,0.047,0.047,0.047,0.047,0.047,0.046,0.045,0.044,0.044,0.045,0.046,0.047,0.048,0.049,0.050,0.054,0.060,0.072,0.104,0.178,0.312,0.467,0.581,0.644,0.675,0.690,0.698,0.706,0.715,0.724,0.730,0.734,0.738],
[0.058,0.054,0.052,0.052,0.053,0.054,0.056,0.059,0.067,0.081,0.107,0.152,0.225,0.336,0.462,0.559,0.616,0.650,0.672,0.694,0.710,0.723,0.731,0.739,0.746,0.752,0.758,0.764,0.769,0.771,0.776,0.782,0.790,0.796,0.799,0.804],
[0.145,0.195,0.283,0.346,0.362,0.354,0.334,0.306,0.276,0.248,0.218,0.190,0.168,0.149,0.127,0.107,0.100,0.102,0.104,0.109,0.137,0.200,0.290,0.400,0.516,0.615,0.687,0.732,0.760,0.774,0.783,0.793,0.803,0.812,0.817,0.825],
[0.108,0.141,0.192,0.236,0.261,0.286,0.317,0.353,0.390,0.426,0.446,0.444,0.423,0.385,0.337,0.283,0.231,0.185,0.146,0.118,0.101,0.090,0.082,0.076,0.074,0.073,0.073,0.074,0.076,0.077,0.076,0.075,0.073,0.072,0.074,0.079],
[0.189,0.255,0.423,0.660,0.811,0.862,0.877,0.884,0.891,0.896,0.899,0.904,0.907,0.909,0.911,0.910,0.911,0.914,0.913,0.916,0.915,0.916,0.914,0.915,0.918,0.919,0.921,0.923,0.924,0.922,0.922,0.925,0.927,0.930,0.930,0.933],
[0.171,0.232,0.365,0.507,0.567,0.583,0.588,0.590,0.591,0.590,0.588,0.588,0.589,0.589,0.591,0.590,0.590,0.590,0.589,0.591,0.590,0.590,0.587,0.585,0.583,0.580,0.578,0.576,0.574,0.572,0.571,0.569,0.568,0.568,0.566,0.566],
[0.144,0.192,0.272,0.331,0.350,0.357,0.361,0.363,0.363,0.361,0.359,0.358,0.358,0.359,0.360,0.360,0.361,0.361,0.360,0.362,0.362,0.361,0.359,0.358,0.355,0.352,0.350,0.348,0.345,0.343,0.340,0.338,0.335,0.334,0.332,0.331],
[0.105,0.131,0.163,0.180,0.186,0.190,0.193,0.194,0.194,0.192,0.191,0.191,0.191,0.192,0.192,0.192,0.192,0.192,0.192,0.193,0.192,0.192,0.191,0.189,0.188,0.186,0.184,0.182,0.181,0.179,0.178,0.176,0.174,0.173,0.172,0.171],
[0.068,0.077,0.084,0.087,0.089,0.090,0.092,0.092,0.091,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.090,0.089,0.089,0.088,0.087,0.086,0.086,0.085,0.084,0.084,0.083,0.083,0.082,0.081,0.081,0.081],
[0.031,0.032,0.032,0.033,0.033,0.033,0.033,0.033,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.032,0.033]
];

// Part of the information is from http://www.fourmilab.ch/documents/specrend/

var IlluminantC =[0.3101, 0.3162],	    	/* For NTSC television */
IlluminantD65  =[0.3127, 0.3291],	    	/* Medium White: For EBU and SMPTE */
IlluminantD50  =[0.34567, 0.3585],	    	/* Warm White: For wide gamut */
IlluminantD75  =[0.29902, 0.31485],	    /* Cool White: Day Light*/
I9300K			=[0.2848, 0.2932],			/* High efficiency blue phospor monitor*/
IlluminantE 	=[0.33333333, 0.33333333];  /* CIE equal-energy illuminant */
var GAMMA_REC709 =	0;		/* Rec. 709 */

// Data From http://www.brucelindbloom.com
// Name xRed yRed xGreen yGreen xBlue yBlue White point Gamma 
function ColourSystem(name,xR,yR,xG,yG,xB,yB,wp,g) {
	this.name=name;     	   	/* Colour system name */
	this.xRed=xR;	    	    /* Red x, y */
	this.yRed=yR;
	this.xGreen=xG;  	    /* Green x, y */
	this.yGreen=yG;
	this.xBlue=xB;		/* Blue x, y */
	this.yBlue=yB;
	this.xWhite=wp[0]; /* White point x, y */
	this.yWhite=wp[1];  	    
	this.gamma=g;  /* Gamma correction for system */
};

var colorSystems = [
	new ColourSystem("Adobe", 0.64,  0.33,   0.21,   0.71,  0.15,  0.06,   IlluminantD65,  GAMMA_REC709),
	new ColourSystem("Apple", 0.625,  0.34,   0.28,   0.595,  0.155,  0.07,   IlluminantD65, GAMMA_REC709),
	new ColourSystem("BestRGB", 0.7347,  0.2653,   0.215,   0.775,  0.13,  0.035,   IlluminantD50, GAMMA_REC709),
	new ColourSystem("BetaRGB", 0.6888,  0.3112,   0.1985,   0.7551,  0.1265,  0.0352,   IlluminantD50, GAMMA_REC709),
	new ColourSystem("BruceRGB", 0.64,   0.33,   0.28,   0.65,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("CIE", 0.735, 0.265, 0.274, 0.717, 0.167, 0.009, IlluminantE,    GAMMA_REC709 ),
	new ColourSystem("ColorMatch",0.630, 0.340, 0.295, 0.605, 0.150, 0.075, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("DonRGB4",0.696, 0.300, 0.215, 0.765, 0.130, 0.035, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("ECI v2",0.670, 0.330, 0.210, 0.710, 0.140, 0.080, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("Ekta space PS5",0.695, 0.305, 0.260, 0.700, 0.110, 0.005, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("HDTV", 0.670,  0.330,  0.210,  0.710,  0.150,  0.060,  IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("NTSC", 0.67,   0.33,   0.21,   0.71,   0.14,   0.08,   IlluminantC,    GAMMA_REC709 ),
	new ColourSystem("EBU (PAL/SECAM)",0.64,   0.33,   0.29,   0.60,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("Pro Photo",0.7347, 0.2653, 0.1596, 0.8404, 0.0366, 0.0001, IlluminantD50,    GAMMA_REC709 ),
	new ColourSystem("CIE REC 709", 0.64,   0.33,   0.30,   0.60,   0.15,   0.06,   IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("SMPTE", 0.630,  0.340,  0.310,  0.595,  0.155,  0.070,  IlluminantD65,  GAMMA_REC709 ),
	new ColourSystem("sRGB", 0.640,  0.330,  0.300,  0.600,  0.150,  0.060,  IlluminantD65,  2.2 ),
	new ColourSystem("700/525/450nm", 0.7347, 0.2653, 0.1152, 0.0584, 0.1566, 0.0177, IlluminantD50,  2.2 )
	];
var colorSystem = colorSystems[0];

/*                          GAMMA_CORRECT_RGB

	Transform linear RGB values to nonlinear RGB values. Rec.
	709 is ITU-R Recommendation BT. 709 (1990) ``Basic
	Parameter Values for the HDTV Standard for the Studio and
	for International Programme Exchange'', formerly CCIR Rec.
	709. For details see
	
	   http://www.poynton.com/ColorFAQ.writeln
	   http://www.poynton.com/GammaFAQ.writeln
*/

function gamma_correct(gamma,c)
{
	if (gamma === GAMMA_REC709) {
		/* Rec. 709 gamma correction. */
		var cc = 0.018;
		
		if (c < cc) {
			c *= ((1.099 * Math.pow(cc, 0.45)) - 0.099) / cc;
		} else {
			c = (1.099 * Math.pow(c, 0.45)) - 0.099;
		}
	} else {
		/* Nonlinear colour = (Linear colour)^(1/gamma) */
		c = Math.pow(c, 1.0/gamma);
	}
	return c;
}

function gamma_correct_rgb(gamma, r, g, b) // Apply gamma function at the final step.
{	
	if(apply_gamma_correction){
		r = gamma_correct(gamma, r);
		g = gamma_correct(gamma, g);
		b = gamma_correct(gamma, b);
	}
	return [r,g,b];
}

/*
	If the required RGB shade contains a negative weight for
	one of the primaries, it lies outside the colour gamut 
	accessible from the given triple of primaries.  Desaturate
	it by adding white, equal quantities of R, G, and B, enough
	to make RGB all positive.  The function returns 1 if the
	components were modified, zero otherwise.	
*/
function constrain_rgb( r,  g,  b)
{	
	if(apply_constrain_rgb){
		var w;

		// Amount of white needed is w = - min(0, r, g, b) 
		w = - Math.min(0, r, g, b);
		var cr=r, cg=g, cb=b;
		
		// Add just enough white to make r, g, b all positive. 
		if (w > 0) {
			/* Colour modified to fit RGB gamut */
			cr += w;  cg += w; cb += w;
		}
		
		/* Colour within RGB gamut */
		return [cr,cg,cb];
	}else{
		// Do nothing
		return [r,g,b];
	}
}

/*
	If some RGB component is greater than 1.0,
	normalizes RGB.
*/
function normalize_rgb(r,g,b){
	var max = Math.max(Math.max(r,g),b);
	var nr = r;
	var ng = g;
	var nb = b;
	if(max > 1.0){
		nr = r / max;
		ng = g / max;
		nb = b / max;
	}
	return [nr,ng,nb];
}

function clearContext(context,r,g,b){
	var css_r = parseInt(r * 255);
	var css_g = parseInt(g * 255);
	var css_b = parseInt(b * 255);
	
	var css_color = "rgb(" + css_r + "," + css_g + "," + css_b + ")";
	
	context.fillStyle = css_color;
	context.fillRect(0,0,context.width, context.height);
}

/*
function xyz_to_sRGB(x,y,z){
	var r = ( 3.2405 * x) + (-1.5371 * y) + (-0.4985 * z);
	var g = (-0.9693 * x) + ( 1.8706 * y) + ( 0.0416 * z);
	var b = ( 0.0556 * x) + (-0.2040 * y) + ( 1.0572 * z);
	
	return [r,g,b];
}*/

function xyz_to_rgb(x,y,z){
	
	// Get RGB->XYZ matriz
	var xr = colorSystem.xRed;
	var yr = colorSystem.yRed;
	var zr = 1.0 - xr - yr;
	var xg = colorSystem.xGreen;
	var yg = colorSystem.yGreen;
	var zg = 1.0 - xg - yg;
	var xb = colorSystem.xBlue;
	var yb = colorSystem.yBlue;
	var zb = 1.0 - xb - yb;
	var xw = colorSystem.xWhite;
	var yw = colorSystem.yWhite;
	var zw = 1.0 - xw - yw;
	
	var Xw = xw / yw;
	var Yw = 1.0;
	var Zw = zw / yw;
	
	// Calculate Cr, Cg, Cb
	var det   = (xr*yg*zb + yr*zg*xb + zr*xg*yb) - (xb*yg*zr + yb*zg*xr + zb*xg*yr);
	var detCr = (Xw*yg*zb + Yw*zg*xb + Zw*xg*yb) - (xb*yg*Zw + yb*zg*Xw + zb*xg*Yw);
	var detCg = (xr*Yw*zb + yr*Zw*xb + zr*Xw*yb) - (xb*Yw*zr + yb*Zw*xr + zb*Xw*yr);
	var detCb = (xr*yg*Zw + yr*zg*Xw + zr*xg*Yw) - (Xw*yg*zr + Yw*zg*xr + Zw*xg*yr);
	
	var Cr = detCr / det;
	var Cg = detCg / det;
	var Cb = detCb / det;
	
	// Multiply Cr,Cg,Cb
	xr *= Cr; yr *= Cr; zr *= Cr;
	xg *= Cg; yg *= Cg; zg *= Cg;
	xb *= Cb; yb *= Cb; zb *= Cb;
	
	//alert(""+xr+","+xg+","+xb + "\n" +yr+","+yg+","+yb +"\n"+zr+","+zg+","+zb);
	
	// Calculate XYZ->RGB matrix (by inverting RGB->XYZ matriz)
	
	var detM = xr*(yg*zb - yb*zg) - xg*(yr*zb - yb*zr) + xb*(yr*zg - yg*zr);
	
	var rx = (yg*zb - yb*zg) / detM;
	var ry = (xb*zg - xg*zb) / detM;
	var rz = (xg*yb - xb*yg) / detM;
	var gx = (yb*zr - yr*zb) / detM;
	var gy = (xr*zb - xb*zr) / detM;
	var gz = (xb*yr - xr*yb) / detM;
	var bx = (yr*zg - yg*zr) / detM;
	var by = (xg*zr - xr*zg) / detM;
	var bz = (xr*yg - xg*yr) / detM;
	
	//alert(""+rx+","+ry+","+rz + "\n" +gx+","+gy+","+gz +"\n"+bx+","+by+","+bz);
	
	// Get RGB (...at last!)
	var r = (rx * x) + (ry * y) + (rz * z);
	var g = (gx * x) + (gy * y) + (gz * z);
	var b = (bx * x) + (by * y) + (bz * z);
	
	//return [r,g,b];
	
	// Constrain RGB
	var crgb =  constrain_rgb(r,g,b);
	
	// Gamma correction
	var gamma_rgb = gamma_correct_rgb(colorSystem.gamma,crgb[0],crgb[1],crgb[2]);
	
	return gamma_rgb;
	//var fcol = constrain_rgb(gamma_rgb[0],gamma_rgb[1],gamma_rgb[2]);
	//return fcol;
}

// Calculates the XYZ coordinates of a spectrum,
// assuming it is iluminated by a light source emitting at full power
// in all wavelengths.
function spectrum_to_xyz(spectrum){
	
	var bigX = 0.0;
	var bigY = 0.0;
	var bigZ = 0.0;
	var maxY = 0.0;
	
	for(var i = 0; i < spectrum.length; i++){ // for each emission in spectrum
		bigX += ( cie_colour_match[i*2][0] * spectrum[i] );
		bigY += ( cie_colour_match[i*2][1] * spectrum[i] );
		maxY += ( cie_colour_match[i*2][1] * 1.0);
		bigZ += ( cie_colour_match[i*2][2] * spectrum[i] );
	}
	return [bigX/maxY,bigY/maxY,bigZ/maxY];
	/*
	// get cromacity coordinates
	var x = bigX / (bigX + bigY + bigZ);
	var y = bigY / (bigX + bigY + bigZ);
	var z = bigZ / (bigX + bigY + bigZ);
	*/
	//return 	[x,y,z];
}

// Calculates the XYZ coordinates of a spectrum, iluminated by a
// a black body radiator.
function spectrum_to_xyz_temp(spectrum){
	var bigX = 0.0;
	var bigY = 0.0;
	var bigZ = 0.0;
	var maxY = 0.0;
	
	for(var i = 0; i < spectrum.length; i++){ // for each emission in spectrum
		var wavelength = 380 + (i*10);
		var p_lambda = bb_spectrum(bb_temp[bb_index], wavelength);
		
		bigX += ( cie_colour_match[i*2][0] * spectrum[i] * p_lambda);
		bigY += ( cie_colour_match[i*2][1] * spectrum[i] * p_lambda);
		maxY += ( cie_colour_match[i*2][1] * p_lambda);
		bigZ += ( cie_colour_match[i*2][2] * spectrum[i] * p_lambda);
	}
	
	return [bigX/maxY,bigY/maxY,bigZ/maxY];
}

// Calculates and draws the color of a black body radiator.
function colorTemp(){
	
	var bigX = 0.0;
	var bigY = 0.0;
	var bigZ = 0.0;
	
	for(var i = 0; i < cie_colour_match.length; i++){	// For all cie intervals
		var wavelength = 380 + (i*5);
		var x_lambda = cie_colour_match[i][0];
		var y_lambda = cie_colour_match[i][1];
		var z_lambda = cie_colour_match[i][2];
		var p_lambda = bb_spectrum(bb_temp[bb_index], wavelength);
		
		bigX += x_lambda * p_lambda;
		bigY += y_lambda * p_lambda;
		bigZ += z_lambda * p_lambda;
	}
	
	// Normalize to brightness
	var x = bigX / bigY;
	var y = bigY / bigY;
	var z = bigZ / bigY;
	
	// Show xyz in user interface
	var text = document.getElementById("tempXText");
	text.value = x;
	text = document.getElementById("tempYText");
	text.value = y;
	text = document.getElementById("tempZText");
	text.value = z;
	
	// Convert to RGB
	var rgb = xyz_to_rgb(x,y,z);
	rgb = normalize_rgb(rgb[0],rgb[1],rgb[2]);
	
	text = document.getElementById("tempRText");
	text.value = rgb[0];
	text = document.getElementById("tempGText");
	text.value = rgb[1];
	text = document.getElementById("tempBText");
	text.value = rgb[2];
	
	clearContext(temp_context,rgb[0],rgb[1],rgb[2]);
}

// Calculate, by Planck's radiation law, the emitted power of a black body
// of temperature bbTemp at the given wavelength (in nano metres).
// (taken from spectrumdata..txt, given by professor Pattanaik Sumanta).
function bb_spectrum(bbTemp,wavelength)
{
	var wlm = wavelength * 1e-9;   /* Wavelength in meters */
	return (3.74183e-16 * Math.pow(wlm, -5.0)) / (Math.exp(1.4388e-2 / (wlm * bbTemp)) - 1.0);
}

function drawSpectrum(spectrum){
	
	// Clear context
	spectrum_context.fillStyle = "#000000";
	spectrum_context.fillRect(0,0,spectrum_context.width, spectrum_context.height);
	
	spectrum_context.fillStyle = "#FFFFFF";
	//alert("spectrum.length=" + spectrum.length);
	for(var i = 0; i < spectrum.length; i++){
		var x = i * (spectrum_context.width-1) / spectrum.length;
		var y = spectrum_context.height - (spectrum[i] * spectrum_context.height);
		
		spectrum_context.fillRect(x,y,2,2);
	}

}

function drawRGB(spectrum){
	var xyz = spectrum_to_xyz(spectrum);
	var rgb = xyz_to_rgb(xyz[0],xyz[1],xyz[2]);
	clearContext(rgb_context,rgb[0],rgb[1],rgb[2]);
	
	//show numbers in user interface
	var text = document.getElementById("rgbXText");
	text.value = xyz[0];
	text = document.getElementById("rgbYText");
	text.value = xyz[1];
	text = document.getElementById("rgbZText");
	text.value = xyz[2];
	
	text = document.getElementById("rgbRText");
	text.value = rgb[0];
	text = document.getElementById("rgbGText");
	text.value = rgb[1];
	text = document.getElementById("rgbBText");
	text.value = rgb[2];
}

function drawFinalColor(spectrum){
	var xyz = spectrum_to_xyz_temp(spectrum);
	var rgb = xyz_to_rgb(xyz[0],xyz[1],xyz[2]);
	clearContext(fcolor_context, rgb[0],rgb[1],rgb[2]);
	
	// show numbers in user interface
	var text = document.getElementById("fcolorXText");
	text.value = xyz[0];
	text = document.getElementById("fcolorYText");
	text.value = xyz[1];
	text = document.getElementById("fcolorZText");
	text.value = xyz[2];
	
	text = document.getElementById("fcolorRText");
	text.value = rgb[0];
	text = document.getElementById("fcolorGText");
	text.value = rgb[1];
	text = document.getElementById("fcolorBText");
	text.value = rgb[2];
}

function changeSpectrum(){
	var select = document.getElementById("spectrumSelect");
	spectrum_index = parseInt(select.options[select.selectedIndex].value);
	drawSpectrum(colorChecker[spectrum_index]);
	drawRGB(colorChecker[spectrum_index]);
	drawFinalColor(colorChecker[spectrum_index]);
}

function changeTemp(){
	var select = document.getElementById("tempSelect");
	bb_index = select.selectedIndex;
	var text = document.getElementById("tempText");
	text.value = bb_temp[bb_index];
	colorTemp();
	drawFinalColor(colorChecker[spectrum_index]);
}

function changeColor(){
	var select = document.getElementById("colorSelect");
	//alert(select.selectedIndex);
	colorSystem = colorSystems[select.selectedIndex];
	//alert(colorSystem.name);
	
	// Updates colors
	changeTemp();
	changeSpectrum();
}

function changeConstrainRGB(){
	apply_constrain_rgb = !apply_constrain_rgb;
	// Updates colors
	changeTemp();
	changeSpectrum();
}

function changeGammaCorrection(){
	apply_gamma_correction = !apply_gamma_correction;
	// Updates colors
	changeTemp();
	changeSpectrum();
}

function fillSpectrumSelect(){
	var select = document.getElementById("spectrumSelect");
	for(var i = 0; i < colorChecker.length; i++){
		var option = document.createElement("option");
		option.text = i;
		option.value = i;
		select.options.add(option);
	}
}

function fillTempSelect(){
	var select = document.getElementById("tempSelect");
	for(var i = 0; i < bb_name.length; i++){
		var option = document.createElement("option");
		option.text = bb_name[i];
		option.value = bb_temp[i];
		select.options.add(option);
	}
}

function fillColorSelect(){
	var select = document.getElementById("colorSelect");
	for(var i = 0; i < colorSystems.length; i++){
		var option = document.createElement("option");
		option.text = colorSystems[i].name;
		option.value = i;
		select.options.add(option);
	}
}

// Main
function main(){
	
	fillSpectrumSelect();
	fillTempSelect();
	fillColorSelect();
	
	var canvas = document.getElementById("spectrumCanvas");
	spectrum_context = canvas.getContext("2d");
	spectrum_context.height = canvas.height;
	spectrum_context.width = canvas.width;
	
	canvas = document.getElementById("tempCanvas");
	temp_context = canvas.getContext("2d");
	temp_context.height = canvas.height;
	temp_context.width = canvas.width;
	
	canvas = document.getElementById("rgbCanvas");
	rgb_context = canvas.getContext("2d");
	rgb_context.height = canvas.height;
	rgb_context.width = canvas.width;
	
	canvas = document.getElementById("fcolorCanvas");
	fcolor_context = canvas.getContext("2d");
	fcolor_context.height = canvas.height;
	fcolor_context.width = canvas.width;

	changeSpectrum();
	changeTemp();
	changeColor();
}
