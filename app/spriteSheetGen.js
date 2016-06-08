/********************************************
// To handle interfacing with the file system, require 'fs'
********************************************/

console.log(process.argv.length);

var fs = require('fs');
var gm = require('gm');

function readDir(path){
	var files = fs.readdirSync(path);
	for(var i=0; i<files.length; i++){
		files[i]=path+files[i];
	}
	
	return files;
}

var fls = readDir(process.argv[2]);

//var sprite = gm.subClass({ imageMagick: true });
//var firstName = null;

var names = [];
names.push(new Array());
var curArray = 0;

for(var i=0; i<fls.length; i++){
	var pat = /\d{3}.jpg/g;
	if(pat.test(fls[i])){
		console.log(fls[i]);
		//sprite(firstName).append(fls[i]);
		if(names[curArray].length>=50) curArray=names.length, names.push(new Array());
		names[curArray].push(fls[i]);
	}
}

var terminal = require('child_process').spawn('cmd');

terminal.stdout.on('data', function (data) {
    //console.log(data);
});

terminal.on('exit', defaultExit);

function defaultExit(code){
	console.log('child process exited with code ' + code);
}

for(var i=0; i<names.length; i++){
	var command = "convert ";

	for(var j=0; j<names[i].length; j++){
		command+=names[i][j]+" ";
	}

	command+=" +append spriteSheet"+i+".jpg\n"

	terminal.stdin.write(command);
	terminal.stdin.end();
}

/*var command = "convert ";

for(var i=0; i<names.length; i++){
	command+=" spriteSheet"+i+".jpg";
}

command+=" +append spriteSheet.jpg\n"

terminal.stdin.write(command);
terminal.stdin.end();*/

//sprite(firstName).write("./sequences/", function (err) {
//  if (!err) console.log(' hooray! ');
//});

/*var sprite = require('node-sprite');

sprite.sprite('pngs', {path: './assets'}, function(err, globalSprite) {
  console.log(globalSprite.filename());
});*/