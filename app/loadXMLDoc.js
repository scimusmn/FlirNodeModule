function loadXMLDoc(dname){
	if (window.XMLHttpRequest)
	  {
	  xhttp=new XMLHttpRequest();
	  }
	else
	  {
	  xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

var config = new function(){
	var xml = loadXMLDoc("config.xml");
	var config = xml.getElementsByTagName("config");
	var maxImages = config.getElementsByTagName("maxImages");
	
	var rows = parseInt(maxImages[0].getAttribute("rows"));
	var columns = parseInt(maxImages[0].getAttribute("columns"));
	
	console.log(rows+","+columns);
}