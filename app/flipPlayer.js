'use strict';

function flipPlayer(containerID){
	var _this = this;
	var cntnr = $(containerID);

	var flip = new flipbook(cntnr);

	var playImg = "assets/pngs/playButton.png";
	var pauseImg = "assets/pngs/pauseButton.png";

	let drawTimer;
	let idleTimer;

	var controls = document.createElement("div");
	controls.className = "controls";
	cntnr.appendChild(controls);

	var playBut = document.createElement("img");
	playBut.src = playImg;
	playBut.className = "button";
	controls.appendChild(playBut);

	var bgDiv = document.createElement("div");
	bgDiv.style.width = 512+"px";
	bgDiv.className = "slider-background";
	controls.appendChild(bgDiv);

	var slide = new imgSlider(bgDiv,flip);

	flip.registerStopCB(function(){
		playBut.src = playImg;
	},this);

	this.init = function(){
		slide.connect();

	}

	this.changeSet = function(dirName){
		flip.changeDir(dirName);
	}

	this.play = function(){
		flip.play();
		playBut.src = pauseImg;
	}

	this.pause = function(){
		flip.stop();
		playBut.src = playImg;
	}

	this.togglePlay = function(){
		if(flip.isLoaded()){
			if(flip.isPlaying()) playBut.src = playImg;
			else playBut.src = pauseImg;
			flip.togglePlay();
		}
		return false;
	}

	this.loadSet = function(setName){
		if(!flip.isLoading()){
			playBut.src = playImg;
			flip.changeDir(setName);
			flip.reset();
			flip.init();

			drawTimer = setInterval(flip.drawFrame,50);
			idleTimer = setInterval(flip.idle,50);
		}
	}

	this.loadFromArray = function(caps){
		if(!flip.isLoading()){
			playBut.src = playImg;
			flip.loadFromArray(caps);
			flip.reset();

			if(drawTimer){
				clearInterval(drawTimer);
				clearInterval(idleTimer);
			}
			drawTimer = setInterval(flip.drawFrame,50);
			idleTimer = setInterval(flip.idle,50);
		}
	}

	this.celebMode = function(){
		flip.changeNotLoadedImage("assets/pngs/compare-text.png");
	}

	this.setDrawInterval = function(){
			drawTimer = setInterval(flip.drawFrame,50);
			idleTimer = setInterval(flip.idle,50);
	}

	this.unload = function(){
		clearInterval(drawTimer);
		clearInterval(idleTimer);

		flip.unload();
		flip.reset();
	}

	playBut.onmousedown = _this.togglePlay;
};

var visitorCaps = new flipPlayer("visitor-caps");
var celebCaps = new flipPlayer("celeb-caps");


window.onload = function(){
	//visitorCaps.loadSet("default/");
	visitorCaps.init();
	celebCaps.init();
}
