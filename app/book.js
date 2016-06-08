
'use strict';

	function flipbook(cntnr){

	//Grab the canvas and context in which we are drawing
		var cntDiv = cntnr;
		var canvas = document.createElement("canvas");
		//canvas.width="1680";
		//canvas.height="1050";
		cntDiv.appendChild(canvas);

		var ctx = canvas.getContext("2d");

		var imgSld;

		var tiles = [];			//create the array of images which we flip through
		var nDisp=0;			//stores the value of the current image being displayed
		var bLoaded=false,
			bPlaying=false,
			bLoading = false;		//keeps track of whether or not the images are loaded.
		var imgDir="default/";	//storing the name of the directory which we are currently browsing.
		var numImg = 600;

		var imgPad=20;

		var stopCallback;
		var callbackObj;

		canvas.width= 512+imgPad;
		canvas.height = 576+imgPad;

		var defaultSrc = "assets/pngs/imageFrame.png";
		var notLoadedImg = new Image();
		notLoadedImg.onload = function(){
			canvas.width= notLoadedImg.width+imgPad;
			canvas.height = notLoadedImg.height+imgPad;
		};
		notLoadedImg.src = defaultSrc;


		//this is declaring member functions of the book class. The init function is used to load the images
		// from the disk, and inform the rest of the class when they are loaded. It also clears out old info.

		var imageLoaded = 1;

		var procesImages = () => {
			for (let x = numImg-1; x >=0; x--) {
				if(tiles[x].deleteMe) tiles.pop();
			}
		}

		this.init=function(){
			bLoading = true;
			notLoadedImg.src = "assets/pngs/imageFrame.png";
			tiles = [];
			bLoaded=false;
			imageLoaded = 0;
			canvas.width=canvas.width;			//this clears the html5 canvas, for some reason

			let track =0;

			for (let x = 1; x <= numImg; x++) {
				let imageObj = new Image(); 											// new instance for each image
				tiles.push(imageObj);
				imageObj.src = imgDir+pad(x,3)+".jpg?";					//set the location.

				imageObj.onload = () => {
					track++;
					console.log('load');
					if(track==numImg) procesImages();
				}
				imageObj.onerror = (evt) => {
					evt.preventDefault();
					track++;
					imageObj.deleteMe = true;
					//console.log('oops');
					if(track==numImg) procesImages();
				}

			}
		};

		this.loadFromArray = function(caps){
			tiles = null;
			tiles = caps;
			bLoaded=true;
		}

		this.unload = function(){
			bLoaded=bLoading=bPlaying=false;
			notLoadedImg.src = defaultSrc;
			for(var i=0; i<tiles.length; i++){
				tiles[i].src = null;
			}
			tiles = null;
			tiles = [];
		}

		this.changeNotLoadedImage = function(title){
			defaultSrc = title;
			notLoadedImg.src=title;
		}

		this.drawFrame=function(){			//display image
			/*if(bLoaded){
				canvas.width = canvas.width;
				ctx.fillStyle = "rgb(170,170,170)";
				ctx.fillRect (0,0,canvas.width,canvas.height);
				ctx.drawImage(tiles[nDisp], imgPad/2,imgPad/2);
			}
			else{
				var numComp = 0;
				for(let i=0; i<tiles.length; i++){
					if(tiles[i].complete && tiles[i].naturalWidth !== 0){
						numComp++;
						canvas.width=tiles[i].width+imgPad;
						canvas.height=tiles[i].height+imgPad;
					} else if(tiles[i].naturalWidth === 0){
						tiles.length--;
					}
				}
				if(numComp>=tiles.length/2&&numComp) bLoading=false,bLoaded=true;

				canvas.width = canvas.width;
				ctx.fillStyle = "rgb(170,170,170)";
				ctx.fillRect (0,0,canvas.width,canvas.height);
				ctx.drawImage(notLoadedImg, imgPad/2,imgPad/2);
			}*/
			if(tiles.length&&tiles[nDisp].complete){
				canvas.width=tiles[nDisp].width+imgPad;
				canvas.height=tiles[nDisp].height+imgPad;
				ctx.fillStyle = "rgb(170,170,170)";
				ctx.fillRect (0,0,canvas.width,canvas.height);
				ctx.drawImage(tiles[nDisp], imgPad/2,imgPad/2);

			} else {
				canvas.width=notLoadedImg.width+imgPad;
				canvas.height=notLoadedImg.height+imgPad;
				ctx.fillStyle = "rgb(170,170,170)";
				ctx.fillRect (0,0,canvas.width,canvas.height);
				ctx.drawImage(notLoadedImg, imgPad/2,imgPad/2);
			}
		};

		this.idle=function(){						//increment the image pointer, if we are playing
			if(bPlaying&&nDisp<tiles.length-1&&tiles[nDisp+1].complete){
				//do {nDisp++} while(!tiles[nDisp].loaded||nDisp<tiles.length-1);
				nDisp++;
				imgSld.changeVal(nDisp/tiles.length);
			}
			else if(tiles.length-2<=nDisp){
				bPlaying=false;
			}
		};

		this.connectSlider = function(sld){
			imgSld=sld;
		}

		this.isLoaded = function(){
			return tiles[nDisp].complete;
		}

		this.isLoading = function(){
			return bLoading;
		}

		this.isPlaying = function(){
			return bPlaying;
		}

		this.play = function(){
			bPlaying=true;
		}

		this.stop = function(){
			bPlaying=false;
			stopCallback.call(callbackObj);
		}

		this.togglePlay=function(){
			if(bPlaying) this.stop();
			else this.play();
		};

		this.registerStopCB = function(sCB,cbObj){
			stopCallback=sCB;
			callbackObj=cbObj;
		}

		this.changePosByValue=function(val){
			nDisp=val;
		};

		this.changePosByPercent=function(perc){
			nDisp=Math.round(perc*(tiles.length-1));
		};

		this.reset=function(){
			nDisp=0;
			bPlaying=false;
			if(imgSld) imgSld.changeVal(0);
		};

		this.changeDir=function(dir){
			imgDir=dir;
			this.reset();
			this.init();
		}
	};

	//var book = new flipbook($("visitor-caps"));

	//setInterval(book.drawFrame,50);
	//setInterval(book.idle,50);
	//window.onload = book.init;
