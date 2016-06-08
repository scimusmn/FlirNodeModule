function imgSlider(bg,buk){
	var bgDiv = bg;
	
	var handle = document.createElement('img');
	handle.src = src="assets/pngs/horzScrollLever.png";
	handle.className = "slider-handle";
	bgDiv.appendChild(handle);
	
	var buuk = buk;
	var mouseX=0;
	
	var bClicked = false;
	var value = 0;
	
	this.changeVal = function(perc){
		handle.style.marginLeft =perc*(parseInt(bgDiv.style.width)-handle.width) +"px";
	}
	
	handle.changePosition = function(posX,posY){
			if(posX>parseInt(bgDiv.style.width)-handle.width) posX=parseInt(bgDiv.style.width)-handle.width;
			else if(posX<0) posX=0;
			handle.style.marginLeft =posX +"px";
			
			buuk.changePosByPercent(posX/(parseFloat(bgDiv.style.width)-handle.width));
			buuk.stop();
	};
	
	this.clickup = function(){
		bClicked=false;
	};
	
	bgDiv.onmousedown = function(e){
		console.log(e.clientX+" "+position(bgDiv).x);
		console.log(bgDiv.style.marginLeft);
		handle.changePosition(e.clientX-(position(bgDiv).x+handle.width/2),0);
		drag.setByEventAndObj(e,handle);
		document.onmousemove = OnMouseMove;
		return false;
	};
	
	this.connect = function(){
		buuk.connectSlider(this);
	}
};
