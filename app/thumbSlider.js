function thumbSlider(bg,thmDiv){
	var bgDiv = bg;

	var handle = document.createElement('img');
	handle.src = src="assets/pngs/vertScrollLever.png";
	handle.className = "slider-handle";
	bgDiv.appendChild(handle);

	var thumbDiv = thmDiv;


	this.changeVal = function(perc){
		handle.style.marginTop =perc*(parseInt(bgDiv.style.height)-handle.height) +"px";
	}

	handle.changePosition = function(posX,posY){
			if(posY>parseInt(bgDiv.clientHeight)-handle.height) posY=parseInt(bgDiv.clientHeight)-handle.height;
			else if(posY<0) posY=0;
			handle.style.marginTop =posY +"px";


			thumbDiv.style.marginTop = -(thumbDiv.scrollHeight-thumbDiv.parentNode.clientHeight)*(posY/(parseFloat(bgDiv.clientHeight)-handle.height))+"px";
	};

	this.clickup = function(){
		bClicked=false;
	};

	bgDiv.onmousedown = function(e){
		handle.changePosition(0,e.clientY-(position(bgDiv).y+handle.height/2));
		drag.setByEventAndObj(e,handle);
		document.onmousemove = OnMouseMove;
		return false;
	};
};

var thmSlider = new thumbSlider($('celebThumbSlider'),$('celebContainer'));
