
/* flags indicating which fields in an rgbe_header_info are valid */
var flags={
	RGBE_VALID_PROGRAMTYPE : 0x01,
	RGBE_VALID_GAMMA : 0x02,
	RGBE_VALID_EXPOSURE : 0x04
}

/* return codes for rgbe routines */
var RGBE_RETURN_SUCCESS = 0;
var RGBE_RETURN_FAILURE =-1;

function HDRimage(){
	this.readFile=function(path, flipFlag) 
	{
		var img={};
		var xhr = new XMLHttpRequest();
		xhr.open('GET', path, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
			function rgbe2float(r,g,b,e){
				if (e) {   /*nonzero pixel*/
					f = Math.pow(2,e-(128+8));
					return[r * f, g * f, b * f];
				}
				else
					return [0,0,0];
			}
			function readPixels(index,n){
				for (var i=0; i<n; i++, offset+=4, index+=3){
					rgbe=rgbe2float(data[offset],data[offset+1],data[offset+2],data[offset+3]);
					imagedata[index]=rgbe[0];imagedata[index+1]=rgbe[1];imagedata[index+2]=rgbe[2];
				}
			}
			
			function readPixelsRLE(){
				var index = 0,i,j,ptr,ptr_end,count;
				if ((width < 8)||(width > 0x7fff)){// run length encoding is not allowed so read flat
					console.log("Not Runlength encoded");
					readPixels(index,width*height);
					return;
				}
				var scanline_buffer = [];
				var num_scanlines = height;
				/* read in each successive scanline */
				while(num_scanlines > 0) {
					if ((data[offset] != 2)||(data[offset+1] != 2)||(data[offset+2] & 0x80)) {
						// this file is not run length encoded 
						console.log("Not Runlength encoded");
						readPixels(index,width*num_scanlines);
						return;
					}
					if ((data[offset+2]<<8 | data[offset+3]) != width) {
						alert("rgbe_format_error: wrong scanline width");
						return;
					}
					offset+=4;
					// read each of the four channels for the scanline into the buffer
					for(i=0;i<4;i++) {
						scanline_buffer[i]=[];
						ptr_end = width;
						ptr = 0;
						while(ptr < ptr_end) {
							if (data[offset] > 128) {
								// a run of the same value
								count = data[offset]-128;
								if ((count == 0)||(count > width - ptr)) {
									alert("rgbe_format_error: bad scanline data 1:"+count+" "+(width-ptr));
									return;
								}
								while(count-- > 0)
									scanline_buffer[i][ptr++] = data[offset+1];
								offset+=2;
							}
							else {
							  // a non-run 
							  count = data[offset];
							  if ((count == 0)||(count > ptr_end - ptr)) {
								alert("rgbe_format_error: bad scanline data 2");
							  }
							  scanline_buffer[i][ptr++] = data[offset+1];
							  offset+=2;
							  if (--count > 0) {
								for (j=0;j<count;j++,ptr++,offset++)
									scanline_buffer[i][ptr]=data[offset];
							  }
							}
						}
					}
					// now convert data from buffer into floats 
					for(i=0;i<width;i++,index+=3) {
						rgbe=rgbe2float(scanline_buffer[0][i],scanline_buffer[1][i],scanline_buffer[2][i],scanline_buffer[3][i]);
						imagedata[index]=rgbe[0];imagedata[index+1]=rgbe[1];imagedata[index+2]=rgbe[2];
					}
					num_scanlines--;
				}
			}
			function readHeader(){
				var line = [];
				//Magic number: 23 3f 52 41 44 49 41 4e 43 45 0a
				if (data[offset]==0x23){
					for (i=0; i<11; i++) line[i]=data[offset+i].toString(16);
					//console.log("Magic Number: "+line);
					offset += 11;
				}
				else alert("missing magic number in the header.");
				while (data[offset]!=0x2D){ // 0x2D = "-".loop till -Y height +X width found
					line=[]; i = 0;
					while(data[offset]!=0x0A){
						line[i] = String.fromCharCode(data[offset]); i++; offset++;
					}
					offset++;
					//console.log(line.join(""));
				}
				offset+=3;
				line=[];
				while(data[offset]!=0x20){line[i] = String.fromCharCode(data[offset]); i++; offset++;}
				width = parseInt(line.join(""));
				offset+=3;
				line=[];
				while(data[offset]!=0x0A){line[i] = String.fromCharCode(data[offset]); i++; offset++;}
				offset++
				height = parseInt(line.join(""));
			}
			function flipIt(){
				var topRowData=[];
				var bottomRowData=[];
				function memcpy(dst,dIndex,src,sIndex,n){
					for (var i=0; i <n; i++){
						dst[dIndex+i] = src[sIndex+i];
					}
				}
				for (var i=0; i < Math.floor(height/2); i++){
					//void * memcpy ( void * destination, const void * source, size_t num );
					//topRowData = imagedata.slice((i*width*3),((i+1)*width*3));
					memcpy(topRowData,0,imagedata,(i*width*3),(width*3));
					//memcpy(topRowData, data+i*width*3, width*3*sizeof(float));
					//bottomRowData = imagedata.slice((height-1-i)*width*3,(height-i)*width*3);
					memcpy(bottomRowData,0,imagedata,(height-1-i)*width*3,(width*3));
					//memcpy(bottomRowData,data+(height-1-i)*width*3,width*3*sizeof(float));
					//imagedata.splice.apply(imagedata,[(height-1-i)*width*3,width*3].concat(topRowData));
					memcpy(imagedata,(height-1-i)*width*3,topRowData,0,(width*3));
					//memcpy(data+(height-1-i)*width*3, topRowData, width*3*sizeof(float));
					//imagedata.splice.apply(imagedata,[i*width*3,width*3].concat(bottomRowData));
					memcpy(imagedata,i*width*3,bottomRowData,0,(width*3));
					//memcpy(data+i*width*3,bottomRowData,width*3*sizeof(float));
				}
			}
			var data = new Uint8Array(this.response); 
			var i, offset = 0;
			var width,height;
			readHeader();
			//console.log("width: "+width+" height: "+height+" offset: "+offset);
			var imagedata = new Float32Array(width*height*3);
			readPixelsRLE();
			if (flipFlag == 1)flipIt();
			img.data = imagedata; img.width = width; img.height = height;
			//console.log("Done: "+ img.width + " " +img.height);
		}
		xhr.send();
		return img;
	}
}