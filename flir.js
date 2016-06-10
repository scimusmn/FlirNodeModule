"use strict";

var flir = require('bindings')('flir');
//var cfg = require('./config.js').config;
var cam = new flir.camera(10);

cam.begin("169.254.140.32");
console.log('began');

cam.listFrameRates();
cam.useFahrenheit();
cam.setFrameRate(30);

cam.setScalingMethod(1);
cam.setLowScale(300);
//console.log(cam.getLowScale()+" is the low scale");
cam.setHighScale(320);


//var tem = new Uint16Array(im.length/2);
//var t = Uint16Array.from({length: 20}, function(v,k){ k;});
//var t = tem.from(tem, function(v,i){im[i*2]+(im[i*2]+1<<8)});
//var t = Int16Array.from(tem, function(v,i){im[i*2]+(im[i*2]+1<<8)});
/*for(var i=0; i<200; i++){
  var im = cam.getImage();
  //console.log(im[0] + " is the first element");
}*/
var can = document.querySelector('#display');
var ctx = can.getContext('2d');

var w = Math.ceil(cam.getWidth());
var h = Math.ceil(cam.getHeight());

console.log('width is '+w+' and height is '+h);

setInterval(()=>{
  var t = cam.getImage();

  var im = ctx.createImageData(w,h);
  im.data.set(t);
  ctx.putImageData(im,0,0);
},100);
