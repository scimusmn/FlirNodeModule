function wsClient(){
	var ws;
	var connectInterval;

	this.connect = function(){
		if ("WebSocket" in window) ws = new WebSocket("ws://localhost:8080/"); //ws://echo.websocket.org is the default testing server
	}

	this.connect();

    ws.onopen = function()
    {
       // Web Socket is connected, send data using send()
       ws.send("Message to send");
	   clearInterval(connectInterval);
    };

	ws.onerror = function ( error ) {
		if ("WebSocket" in window) connectInterval = setInterval(this.connect(),2000);
	}

    ws.onmessage = function (evt) {
		//var received_msg = evt.data;
		//alert("Message is received... " + received_msg);

		switch(evt.data.split("=")[0]){
			case "seq":
				visGroup.addOrChangeSet(evt.data.split("=")[1]);
				break;
			case "cel":
				celebGroup.addOrChangeSet(evt.data.split("=")[1]);
				break;
			default:
				break;
		}
    };

	this.setMsgCallback = function(cb){
		ws.onmessage = cb;
	}

    ws.onclose = function(){
       // websocket is closed.
       alert("Connection is closed...");
	   connectInterval = setInterval(this.connect(),2000);
    };

}

var webSockClient = new wsClient();
