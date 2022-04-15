
var Paint = {};

Paint.setCanvas = function(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
};

Paint.Canvas = function(width, height){
	var image = width;
	var new_canvas = document.createElement("canvas");
	var new_ctx = new_canvas.getContext("2d");
	new_canvas.ctx = new_ctx;
	new_ctx.disable_image_smoothing = function(image){
		new_ctx.mozImageSmoothingEnabled = false;
		new_ctx.webkitImageSmoothingEnabled = false;
		new_ctx.msImageSmoothingEnabled = false;
		new_ctx.imageSmoothingEnabled = false;
	};
	new_ctx.copy = function(image){
		new_canvas.width = image.naturalWidth || image.width;
		new_canvas.height = image.naturalHeight || image.height;
		new_ctx.disable_image_smoothing();
		if (image instanceof ImageData) {
			new_ctx.putImageData(image, 0, 0);
		} else {
			new_ctx.drawImage(image, 0, 0);
		}
	};
	
	if(width && height){
		new_canvas.width = width;
		new_canvas.height = height;
		new_ctx.disable_image_smoothing();
	}else if(image){
		new_ctx.copy(image);
	}
	return new_canvas;
}

Paint.getImageData = function() {
	return this.canvas.toDataURL("image/png");
};

Paint.clearAll = function(color) {
	this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
	if (color) this.paintCanvas(0,0,this.canvas.width,this.canvas.height,color);
};

Paint.paintCanvas = function(x,y,w,h,color) {
	this.ctx.fillStyle = (color?color:this.color) + "";
	this.ctx.fillRect(x,y,w,h);
};

Paint.resizeCanvas = function(w,h) {
	var imgData = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
	this.canvas.width = w;
	this.canvas.height = h;
	this.canvas.style.width = w + "px";
	this.canvas.style.height = h + "px";
	this.ctx.putImageData(imgData,0,0);
};

Paint.getPixelColor = function(x,y) {
	var data = this.ctx.getImageData(x, y, 1, 1).data;
	var col = new Color();
	col._r = data[0]/255;
	col._g = data[1]/255;
	col._b = data[2]/255;
	col._a = data[3]/255;
	return col;
};

Paint.setPixelColor = function(x,y,color) {
	this.paintCanvas(x,y,1,1,color);
};

Paint.drawLine = function(x0,y0,x1,y1,color,lheight) {
	this.ctx.beginPath();
	this.ctx.lineWidth = lheight?lheight:1;
	this.ctx.lineTo(x0,y0);
	this.ctx.lineTo(x1,y1);
	this.ctx.strokeStyle = color?color:this.color;
	this.ctx.stroke();
};

// Color prototype
function Color(r,g,b,a) { // 1,1,1,1
	if (Color.Colors) if ((""+r).toUpperCase() in Color.Colors) {
		return Color.Colors[r.toUpperCase()];
	}
	this._r = r?r:0;
	this._g = g?g:0;
	this._b = b?b:0;
	this._a = a?a:1;
	this.set(r,g,b,a);
}

Color._getHex = function(onum) {
	if (onum > 254) return "FF";
	else if (onum < 1) return "00";
	var hexx = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
	var F0 = onum%16;
	var F1 = (onum-F0)/16;
	return ""+hexx[F1]+hexx[F0];
};

Color.prototype.toString = function() {
	return "#"
	 + Color._getHex(Math.floor(255*this._r))
	 + Color._getHex(Math.floor(255*this._g))
	 + Color._getHex(Math.floor(255*this._b))
	 + (this._a==1?"":Color._getHex(Math.floor(255*this._a)));
}

Color.prototype.toRGBA = function() {
	return [Math.floor(255*this._r),Math.floor(255*this._g),Math.floor(255*this._b),Math.floor(255*this._a)];
};

Color.prototype.set = function(oHex,g,b,a) {
	if (!oHex) { // reset
		this._r = 0;
		this._g = 0;
		this._b = 0;
		this._a = 1;
	} else if ((/^#[0-9a-f]{8}/i).test(oHex)) { // #rrggbbaa
		this._r = eval("0x"+oHex.substr(1,2))/255;
		this._g = eval("0x"+oHex.substr(3,2))/255;
		this._b = eval("0x"+oHex.substr(5,2))/255;
		this._a = eval("0x"+oHex.substr(7,2))/255;
	} else if ((/^#[0-9a-f]{6}/i).test(oHex)) { // #rrggbb
		this._r = eval("0x"+oHex.substr(1,2))/255;
		this._g = eval("0x"+oHex.substr(3,2))/255;
		this._b = eval("0x"+oHex.substr(5,2))/255;
		this._a = 1;
	} else if ((/^#[0-9a-f]{3}/i).test(oHex)) { // #rgb
		this._r = eval("0x"+oHex.substr(1,1))/15;
		this._g = eval("0x"+oHex.substr(2,1))/15;
		this._b = eval("0x"+oHex.substr(3,1))/15;
		this._a = 1;
	} else if (g&&b) {
		if ((oHex+g+b) < 3 && (oHex+g+b) > 0 && Math.max(oHex,g,b) <=1 && Math.min(oHex,g,b) >= 0) {
			this._r = oHex;
			this._g = g;
			this._b = b;
			this._a = a?a:1;
		} else if (Math.max(oHex,g,b) <=255 && Math.min(oHex,g,b) >= 0) {
			this._r = oHex/255;
			this._g = g/255;
			this._b = b/255;
			this._a = a?a:1;
		}
	}
};

Color.prototype.getReverse = function() {
	return new Color(1-this._r,1-this._g,1-this._b);
};

Color.Colors = {
	"WHITE"		:new Color(1,1,1),
	"BLACK"		:new Color(0,0,0),
	"GRAY"		:new Color(0.5,0.5,0.5),

	"RED"		:new Color(1,0,0),
	"GREEN"		:new Color(0,1,0),
	"BLUE"		:new Color(0,0,1),

	"YELLOW"	:new Color(1,1,0),
	"PURPLE"	:new Color(1,0,1),
	"CYAN"		:new Color(0,1,1),
 
	"DARKRED"	:new Color(0.5,0,0),
	"DARKGREEN"	:new Color(0,0.5,0),
	"DARKBLUE"	:new Color(0,0,0.5),

	"DARKYELLOW":new Color(0.5,0.5,0),
	"DARKPURPLE":new Color(0.5,0,0.5),
	"DARKCYAN"	:new Color(0,0.5,0.5)
};

Color.ColorsTR = function(oText) {
	switch (oText.toUpperCase()) {
		case "AK":
		case "BEYAZ": return this.Colors["WHITE"];
		case "SİYAH":
		case "SIYAH": return "#000000";
		case "GRI":
		case "GRİ":
		case "BOZ": return "#808080";
		case "AL":
		case "KIRMIZI":
		case "KİRMİZİ": return "#FF0000";
		case "YESİL":
		case "YEŞİL":
		case "YESIL":
		case "YEŞIL": return "#00FF00";
		case "MAVİ":
		case "MAVI": return "#0000FF";
		case "SARI":
		case "SARİ": return "#FFFF00";
		case "MOR": return "#FF00FF";
		case "TURKUAZ": return "#00FFFF";
		default: return this.color;
	}
};

Paint.Pencil = {
	x:0,
	y:0,
	_ex:0,
	_ey:0,
	_ix:0,
	_iy:0,
	_lh:1,
	_am:10,
	_m:false,
	_e:false,
	_eh:null,
	_ir:new Color("#00000000"),
	Type:"PEN"
};

Paint.Pencil.Start = function(x,y) {
	this.x = x;
	this.y = y;
	this._ex = x;
	this._ey = y;
	this._ix = x;
	this._iy = y;
	this._e = true;
	this._m = false;
	this._eh = Paint.ctx.getImageData(0,0,Paint.canvas.width,Paint.canvas.height);
};

Paint.Pencil.Stop = function(x,y) {
	this.x = x;
	this.y = y;
	this._m = false;
	this._e = false;
	this.Types[this.Type](x,y);
};

Paint.Pencil.UnDo = function() {
	this._m = false;
	this._e = false;
	Paint.ctx.putImageData(this._eh,0,0);
	this._eh = null;
};

Paint.Pencil.Move = function(x,y) {
	if (!this._e) return false;
	this._ex = this.x;
	this._ey = this.y;
	this.x = x;
	this.y = y;
	this._m = true;
	this.Types[this.Type](x,y);
};

Paint.Pencil.Types = {
	"PEN":function(x,y) {
		Paint.drawLine(Paint.Pencil._ex,Paint.Pencil._ey,Paint.Pencil.x,Paint.Pencil.y,false,Paint.Pencil._lh);
	},
	"SPRAY":function(x,y) {
		for (var i=0;i<Paint.Pencil._am;i++) {
			var anc = Math.random()*2*Math.PI;
			var are = (Math.random()**0.66)*Paint.Pencil._lh*15;
			Paint.setPixelColor(Paint.Pencil.x+are*Math.cos(anc),Paint.Pencil.y+are*Math.sin(anc),false);
		}
	},
	"ERASE":function(x,y) {
		Paint.ctx.clearRect(x-Paint.Pencil._lh*15,y-Paint.Pencil._lh*15,Paint.Pencil._lh*30,Paint.Pencil._lh*30);
		Paint.paintCanvas(x-Paint.Pencil._lh*15,y-Paint.Pencil._lh*15,Paint.Pencil._lh*30,Paint.Pencil._lh*30,""+Paint.Pencil._ir);
	},
	"FILL":function(x,y) {
		if (Paint.Pencil._m) return;
		function write(poo) {
			imgData.data[poo] = coA[0];
			imgData.data[poo+1] = coA[1];
			imgData.data[poo+2] = coA[2];
			imgData.data[poo+3] = coA[3];
		}
		function verify(poo) {
			return (imgData.data[poo] === coB[0] &&
			imgData.data[poo+1] === coB[1] &&
			imgData.data[poo+2] === coB[2] &&
			imgData.data[poo+3] === coB[3]);
		}
		var pixels = [[x,y]];
		var wi = Paint.canvas.width;
		var he = Paint.canvas.height;
		var po = 0;
		var npos;
		var coA = Paint.color.toRGBA();
		var imgData = Paint.ctx.getImageData(0,0,Paint.canvas.width,Paint.canvas.height);
		var coB = [imgData.data[(y*wi + x)*4],imgData.data[(y*wi + x)*4+1],imgData.data[(y*wi + x)*4+2],imgData.data[(y*wi + x)*4+3]];
		while (pixels.length) {
			npos = pixels.pop()
			x = npos[0];
			y = npos[1];
			po = (y*wi + x) * 4;
			write(po);
			if (x > 0) if (verify(po-4)) pixels.push([x-1,y]);
			if (y > 0) if (verify(po-wi*4)) pixels.push([x,y-1]);
			if (x < wi-1) if (verify(po+4)) pixels.push([x+1,y]);
			if (y < he-1) if (verify(po+wi*4)) pixels.push([x,y+1]);
		}
		Paint.ctx.putImageData(imgData,0,0);
	}
};


Paint.color = new Color("black");
//////////////////////


Paint.loadImg = function(url) {
	var img = new Image();
	//img.crossOrigin = "Anonymous";
	img.onload = function() {
		Paint.ctx.drawImage(this,0,0);
	};
	img.src = url;
};