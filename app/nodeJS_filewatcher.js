// Set the address and port of the Camera control computer server
var HOST = '10.75.135.37';
var PORT = 11999;
var userName = "perotmuseum.local\\exhibit"
var password = "Changeme.1"
var seqFolderPath = __dirname+"\\sequences\\";
var folderToWatch = "sequences";
var pathToWatch = "Users\\Public\\Pictures\\highSpeed";

/*********************************************************
/ You should not have to edit below this point 
/*********************************************************/


/********************************************
// To handle interfacing with the file system, require 'fs'
********************************************/

var fs = require('fs');

function readDir(path){
	var files = fs.readdirSync(path);
	
	files.sort(function(a,b){
		return fs.statSync("./"+path+a).mtime.getTime()-fs.statSync("./"+path+b).mtime.getTime();
	});
	for(var i=0; i<files.length; i++){
		files[i]=path+files[i];
	}
	
	
	
	return files;
}

var changedFile;

/*fs.watch(folderToWatch,{persistent: true},function(event,filename){
	if(changedFile!=filename){
		//console.log(event+" "+filename);
		//changedFile=filename;
		if(webSock) webSock.send("seq="+filename);
	}
});*/

/*******************************************
// For websockets, require 'ws'.Server
********************************************/


var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 8080});

//Tell the wsServer what to do on connnection to a client; 

var webSock = null;

wss.on('connection', function(ws) {
	
	webSock = ws;
	
	onOpen();
	
    ws.on('message', function(message) {
        console.log('received: %s', message);
		//ws.send('something');
    });
	
	ws.on('close',function(){
		webSock=null;
	});

	ws.on('error',function(error){
		webSock=null;
		console.log("Error: "+error);
	});
});

function onOpen(){
	var files = readDir("sequences/");
	var celFiles = readDir("celeb_seq/");
	if(webSock){
		for(var i=0; i<files.length; i++){
			webSock.send("seq="+files[i]);
		}
		for(var i=0; i<celFiles.length; i++){
			webSock.send("cel="+celFiles[i]);
		}
	}
}

/***********************************************************
/ To interface with command line objects, we require ('childProcess')
************************************************************/

/*var terminal = require('child_process').spawn('cmd');

terminal.stdout.on('data', function (data) {
    console.log(data.toString());
});

terminal.on('exit', defaultExit);

function defaultExit(code){
	console.log('child process exited with code ' + code);
}

var transferredFolder;

function fileTransferExit(code){
	if(webSock){
		websock.send("seq="+transferredFolder);
	}
	terminal.on('exit', defaultExit);
}

function fileServerConnect(path){
	//setTimeout(function() {
		console.log('Connecting to fileserver');
		terminal.stdin.write("net use Z: \\\\" + HOST + "\\" + path.substr(0,path.length) + " " + password + " /user:" + userName+"\n");
		//terminal.stdin.end();
	//}, 1000);
}

//fileServerConnect(pathToWatch);

function transferFileFromServer(folder){
	transferredFolder=folder;
	terminal.on('exit', fileTransferExit);
	//setTimeout(function() {
		console.log('Transferring set '+folder);
		terminal.stdin.write('xcopy /I /E /D /Y "Z:\\'+folder+'" "'+seqFolderPath+folder+'"\n' );
		//terminal.stdin.end();
	//}, 10000);
}*/

/*setTimeout(function() {
    console.log('Sending stdin to terminal');
    terminal.stdin.write('echo "Hello $USER"');
    terminal.stdin.end();
}, 1000);*/

function fileServerConnect(path){
	var terminal = require('child_process').spawn('cmd');

	terminal.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	terminal.on('exit', function(code){
		
	});

	console.log('Connecting to fileserver');
	terminal.stdin.write("net use Z: \\\\" + HOST + "\\" + path.substr(0,path.length-1) + " " + password + " /user:" + userName+" /y\n");
	terminal.stdin.end();
}

var transferredFolder;

function transferFileFromServer(folder){
	transferredFolder=folder;
	var terminal = require('child_process').spawn('cmd');

	terminal.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	terminal.on('exit', function(code){
		if(webSock) webSock.send("seq="+"sequences/"+transferredFolder);
	});
		
	console.log('Transferring set '+folder);
	terminal.stdin.write('xcopy /I /E /D /Y "Z:\\'+folder+'" "'+seqFolderPath+folder+'"\n' );
	terminal.stdin.end();
}

/*************************************************************************
//For a basic TcP/ip connection to the camera control computer, require 'net'
**************************************************************************/
var net = require('net');

var client = new net.Socket();

//connectToTCPServer();

// Connect to the TCP server on the address and port specified, and execute the function on connect
function connectToTCPServer(){
	client.connect(PORT, HOST, function() {
		if(connectInterval) clearInterval(connectInterval);
		console.log('CONNECTED TO: ' + HOST + ':' + PORT);
		// Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
		client.write('<mapRequest />[/TCP]');
	});
}

connectToTCPServer();


var connectInterval;

client.on('error',function(error){ 
	console.log("ERROR: "+error);
	connectInterval = setInterval(connectToTCPServer,1000)
});


////////////////////////////////////////////////////////////////
//Specify what to do on receipt of data from the server.
//Here, data is the information received.
//TODO: add parser to handle the packet. This should include how to transfer files
// from the server, and handling new files. Involves sending new addresses through the wsServer.
//////////////////////////////////////////////////////////////////


client.on('data', function(data) {
	
	data = data.toString();

	var tcpData = data.split("[/TCP]");
	for(var i=0; i<tcpData.length; i++){
		console.log(tcpData[i]);
    		switch(tcpData[i].split("=")[0]){
			case "map_root":
				fileServerConnect(tcpData[i].split("=")[1]);
				break;
			case "set":
				transferFileFromServer(tcpData[i].split("=")[1]);
				break;
			default:
				break;
		}
	}
    //console.log('DATA: ' + data);
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    //console.log('Connection closed');
});