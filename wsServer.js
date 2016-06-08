/*********************************************************
/ You should not have to edit below this point
/*********************************************************/

var arduino = require('./arduino.js').arduino;
var serial = require('./arduino.js').serial;

var cArr = [0,1,3,4,5,6];
var cCount = 0;

arduino.connect('COM11', function() {
  var i = 0;
  var green = 1;
  setInterval(function() {
    arduino.digitalWrite(11, green);
    arduino.digitalWrite(10, !green);
    green = !green;
    arduino.wireSend(8, [1<<cArr[cCount++]]);
    if(cCount>=6) cCount = 0;
    if (i >= 10) i = 0;
  }, 100);
});

/*******************************************
// For websockets, require 'ws'.Server
********************************************/

/*var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 8080});

//Tell the wsServer what to do on connnection to a client;

var webSock = null;

wss.on('connection', function(ws) {

  webSock = ws;
       console.log("connected");

    ws.on('message', function(message) {
      var spl = message.split("|");
      switch(spl[0]){
        case "sp":
            if(!sp||!sp.isOpen()){
              openSerial(spl[1]);
            }
          break;
        case"r":
          console.log(spl[1].charCodeAt(0));
          if(sp) sp.write(spl[1]+"|");
          break;
        }
    });

  ws.on('close',function(){
    console.log("disconnected");
    webSock=null;

    if(sp) sp.close();
  });

  ws.on('error',function(error){
    webSock=null;
    console.log("Error: "+error);
  });

});*/

//////////////////////////////////////////
