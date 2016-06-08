function setPointer(setName,flp){
	var flipPlr = flp;
	var folderName = setName;
	var thumb = document.createElement('img');
	var visitorMode = true;
	var celebCallback;

	var bClicked = false;

	var caps;

	thumb.src = folderName+"/thumb.jpg?"+Math.random();
	thumb.id = folderName;
	thumb.className = "thumbnail";

	thumb.onmousedown = function(){
		bClicked=true;
		thumb.src = "assets/pngs/thumbBG.png";
		if(visitorMode){
			thumb.style.border = "5px solid #cccc00"
		}
		else {
			celebCallback.resetSelected();
			thumb.style.border = "5px solid #cccc00"
		}
	};

	thumb.onmouseout = function(){
		thumb.style.border = "5px solid #cccccc"
		thumb.src = folderName+"/thumb.jpg?"+Math.random();
	}

	thumb.onmouseup = function(){
		if(bClicked){
			if(visitorMode){
				thumb.style.border = "5px solid #cccccc"

				thumbClick();
				flipPlr.loadSet(folderName+"/");
			}
			else if(caps) flipPlr.loadFromArray(caps);
			thumb.src = folderName+"/thumb.jpg?"+Math.random();

			bClicked = false;
		}
	}

	this.bindThumb = function(thm){
		thumb = thm;

		thumb.onmousedown = function(){
		bClicked=true;
		thumb.src = "assets/pngs/thumbBG.png";
		if(visitorMode){
			thumb.style.border = "5px solid #cccc00"
		}
		else {
			celebCallback.resetSelected();
			thumb.style.border = "5px solid #cccc00"
		}
	};

	thumb.onmouseout = function(){
		thumb.style.border = "5px solid #cccccc"
		thumb.src = folderName+"/thumb.jpg?"+Math.random();
	}

	thumb.onmouseup = function(){
		if(bClicked){
			if(visitorMode){
				thumb.style.border = "5px solid #cccccc"

				thumbClick();
				flipPlr.loadSet(folderName+"/");
			}
			else if(caps) flipPlr.loadFromArray(caps);
			thumb.src = folderName+"/thumb.jpg?"+Math.random();

			bClicked = false;
		}
	}
	}

	this.resetBorderColor = function(){
		thumb.style.border = "5px solid #cccccc"
	}

	this.reset = function(){
		thumb.style.border = "5px solid #cccccc"
		thumb.src = folderName+"/thumb.jpg?"+Math.random();
	}

	this.setCelebMode = function(celebCB){
		visitorMode=false;
		celebCallback = celebCB;
		caps = [];

		for (x = 1; x <= 600; x++) {
			var imageObj = new Image(); 											// new instance for each image
			imageObj.src = folderName+"/"+pad(x,3)+".jpg";					//generate a unique name for each image, so it doesn't cache
			caps.push(imageObj);													//push the new image into the array of images.
		}
	}

	this.getFolderName = function(){
		return folderName;
	}

	this.getElement = function(){
		return thumb;
	}
}

function thumbClick(){
	var selEl = $('.playback');
	for(var i=0; i<selEl.length; i++){
		selEl[i].style.display = "table-row";
	}
	for(var i=0; i<$('.select').length; i++){
		$('.select')[i].style.display="none";
	}
}

function setGroup(flp,parent,rws,clm,asTable){
	var flipPlr = flp;
	var sets = [];
	var elements = [];

	var rows = rws;
	var columns = clm;
	var visitorMode = true;
	var tableMode = asTable;

	if(asTable){
		var thumbTable = document.createElement('table');


		for(var i=0; i<rows; i++){
			var newRow = document.createElement('tr');
			for(var j=0; j<columns; j++){
				var newCell = document.createElement('td');
				newRow.appendChild(newCell);
				elements.push(newCell);
			}
			thumbTable.appendChild(newRow);
		}

		parent.appendChild(thumbTable);
	}
	else {
		var topDiv = document.createElement('div');
		var secondDiv = document.createElement('div');
		topDiv.appendChild(secondDiv);
		for(var i=0; i<rows; i++){
			var newRow = document.createElement('div');
			for(var j=0; j<columns; j++){
				var newCell = document.createElement('span');
				newRow.appendChild(newCell);
				elements.push(newCell);
			}
			secondDiv.appendChild(newRow);
		}

		parent.appendChild(topDiv);
	};

	this.setCelebMode = function(){
		visitorMode=false;
		flipPlr.celebMode();
		for(var i=0; i<sets.length; i++){
			sets[i].setCelebMode(this.resetSelected());
		}
	}

	this.resetSelected = function(){
		for(var i=0; i<sets.length; i++){
			sets[i].resetBorderColor();
		}
	}

	this.rebindByElementChild = function(element){
		var imgs = element.getElementsByTagName('img');
		if(imgs.length){
			var img = imgs[0];
			for(var i=0; i<sets.length; i++){
				console.log(img.id);
				if(img.id==sets[i].getFolderName()) sets[i].bindThumb(img);
			}
		}
	}

	this.addOrChangeSet = function(setName){
		console.log(setName);
		//var setFol = setName.split('/');
		//var set = setFol[setFol.length-1]
		if($(setName)){
			$(setName).src = setName+"/thumb.jpg?"+Math.random();
			for(var i=elements.length-1; i>1&&elements.length>1; i--){
				elements[i].innerHTML=elements[i-1].innerHTML;
				this.rebindByElementChild(elements[i]);
			}
			elements[0].innerHTML='';
			elements[0].appendChild($(setName));
		}
		else{
			console.log(flipPlr);
			var newSet = new setPointer(setName,flipPlr);
			if(!visitorMode) newSet.setCelebMode(this);
			var curNum = sets.length;
			sets.push(newSet);
			//var curCell = elements[curNum];
			//curCell.appendChild(newSet.getElement());

			for(var i=elements.length-1; i>=1&&elements.length>1; i--){
				elements[i].innerHTML=elements[i-1].innerHTML;
				this.rebindByElementChild(elements[i]);
			}
			elements[0].innerHTML='';
			elements[0].appendChild(newSet.getElement());
		}
	}


}

console.log(visitorCaps);

var visGroup = new setGroup(visitorCaps,$('thumbs'),3,7,true);
var celebGroup = new setGroup(celebCaps,$('celebThumbs'),20,1,false);

celebGroup.setCelebMode();
