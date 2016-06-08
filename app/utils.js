function position(elem){
	var offset = {x:0,y:0};
	while (elem)
	{
		offset.x += elem.offsetLeft;
		offset.y += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return offset;
}

var $ = function( id ) { 

	switch(id.charAt(0)){
		case '#':
			return document.getElementById( id.substr(1) );
			break;
		case '.':
			return document.getElementsByClassName( id.substr(1) );
			break;
		case '$': 
			return document.getElementsByTagName( id.substr(1) );
			break;
		default:
			return document.getElementById( id );
			break;
	}

};

function degToRad(d) {
    // Converts degrees to radians
    return d * 0.0174532925199432957;
}

function extractNumber(value)
{
    var n = parseInt(value);
	
    return n == null || isNaN(n) ? 0 : n;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function constrain(num, a, b){
	num = Math.min(Math.max(parseInt(num), a), b);
}

