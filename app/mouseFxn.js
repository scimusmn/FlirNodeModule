var drag = new function (){
	var startX = 0;            // mouse starting positions
	var startY = 0;
	var offsetX = 0;           // current element offset
	var offsetY = 0;
	var Element;           // needs to be passed from OnMouseDown to OnMouseMove
	var oldZIndex = 0;         // we temporarily increase the z-index during drag
	//var _debug = $('debug');    // makes life easier

	this.setByEventAndObj = function(e,obj){
		// grab the mouse position
        this.startX = e.clientX;
        this.startY = e.clientY;

        // grab the clicked element's position
        this.offsetX = extractNumber(obj.style.left+obj.style.marginLeft);
        this.offsetY = extractNumber(obj.style.top+obj.style.marginTop);

        // bring the clicked element to the front while it is being dragged
        this.oldZIndex = obj.style.zIndex;
        obj.style.zIndex = 10000;

        // we need to access the element in OnMouseMove
        this.Element = obj;
	}
};

var draggableClass = ["slider-handle"];

InitDragDrop();

function InitDragDrop()
{
    document.onmousedown = OnMouseDown;
    document.onmouseup = OnMouseUp;
}

var refreshTimeout;

function OnMouseDown(e)
{

	if(refreshTimeout){
		clearTimeout(refreshTimeout);
	}
	//refreshTimeout = setTimeout(function(){document.location.reload(true);},360000);


    // IE is silly and doesn't pass the event object
    if (e == null)
        e = window.event;

    // IE uses srcElement, others use target
    var target = e.target != null ? e.target : e.srcElement;

    /*_debug.innerHTML = target.className == 'drag'
        ? 'draggable element clicked'
        : 'NON-draggable element clicked';
	*/

	var draggable = false;
	for(var i=0; i<draggableClass.length; i++){
		if(target.className == draggableClass[i]) draggable=true;
	}

    // for IE, left click == 1
    // for Firefox, left click == 0
    if ((e.button == 1 && window.event != null ||
        e.button == 0) &&
        draggable)
    {
        drag.setByEventAndObj(e,target);

        // tell our code to start moving the element with the mouse
        document.onmousemove = OnMouseMove;

        // cancel out any text selections
        document.body.focus();

        // prevent text selection in IE
        document.onselectstart = function () { return false; };
        // prevent IE from trying to drag an image
        target.ondragstart = function() { return false; };

        // prevent text selection (except IE)
        return false;
    }

	return false;
}

function OnMouseMove(e)
{
    if (e == null)
        var e = window.event;

    // this is the actual "drag code"
    /*_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
    _dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';

    _debug.innerHTML = '(' + _dragElement.style.left + ', ' +
        _dragElement.style.top + ')';
	*/
	(drag.Element).changePosition((drag.offsetX + e.clientX - drag.startX),(drag.offsetY + e.clientY - drag.startY));
}

function OnMouseUp(e)
{
    if (drag.Element != null)
    {
        drag.Element.style.zIndex = drag.oldZIndex;

        // we're done with these events until the next OnMouseDown
        document.onmousemove = null;
        document.onselectstart = null;
        drag.Element.ondragstart = null;

        // this is how we know we're not dragging
        drag.Element = null;

        //_debug.innerHTML = 'mouse up';
    }
}

function fyvClickDown(){
	$('fyv').src="assets/pngs/Button1-active.png";
}

var refreshTimer;
var refreshCount =0;

function refreshZero(){
	refreshCount=0;
}

function fyvClickUp(){
	//if(refreshTimer) clearTimeout(refreshTimer);
	//refreshTimer = setTimeout(refreshZero,10000);
	if(refreshCount>=0) document.location.reload(true);
	else{
		visitorCaps.unload();
		//celebCaps.unload();

		if(window.stop !== undefined) window.stop();
		else if(document.execCommand !== undefined) document.execCommand("Stop", false);

		$('fyv').src="assets/pngs/Button1.png";
		var selEl = $('.select');
		for(var i=0; i<selEl.length; i++){
			selEl[i].style.display = "table-row";
		}
		for(var i=0; i<$('.playback').length; i++){
			$('.playback')[i].style.display="none";
		}
		jyClickUp();
	}
	refreshCount++;
}

function jyClickDown(){
	$('jy').src="assets/pngs/Button2-active.png";
}

function jyClickUp(){
	celebCaps.unload();
	celebCaps.setDrawInterval();

	$('jy').src="assets/pngs/Button2.png";
	var selEl = $('.justYou');
	for(var i=0; i<selEl.length; i++){
		selEl[i].style.display = "table-cell";
	}
	for(var i=0; i<$('.sideBySide').length; i++){
		$('.sideBySide')[i].style.display="none";
	}
}

function sbsClickDown(){
	$('sbs').src="assets/pngs/Button3-active.png";
}

function sbsClickUp(){
	$('sbs').src="assets/pngs/Button3.png";
	var selEl = $('.sideBySide');
	for(var i=0; i<selEl.length; i++){
		selEl[i].style.display = "table-cell";
	}
	for(var i=0; i<$('.justYou').length; i++){
		$('.justYou')[i].style.display="none";
	}

	//celebCaps.loadSet("default_2/");
}

var bothPlaying = false;

function pbClickDown(){
	if(bothPlaying){
		$('playBoth').src = "assets/pngs/playboth-active.png"
		visitorCaps.pause();
		celebCaps.pause();
		bothPlaying=false;
	}
	else {
		bothPlaying=true;
		$('playBoth').src = "assets/pngs/pauseboth.png"
		visitorCaps.play();
		celebCaps.play();
	}
}
