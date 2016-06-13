"use strict";

var leg = document.getElementById('legend');
var cntx = leg.getContext('2d');
cntx.rect(0, 0, leg.width, leg.height);

window.palette = (i) => {
  var r = Math.round(Math.pow(i/255,2)*255);
  var g = (i<128)?i:256-i;
  var b = Math.round((255-i)/2);
  return {r: r, g: g, b: b};
}

// add linear gradient
var grd = cntx.createLinearGradient(0, 0, 0, leg.height);
for(var i=0; i< 256; i++){
  var p = palette(i);
  grd.addColorStop((255-i)/255, 'rgba('+p.r+','+p.g+','+p.b+',1)');
}


cntx.fillStyle = grd;
cntx.fill();

setTimeout(()=>{
  var flir = require('bindings')('flir');
  //var cfg = require('./config.js').config;
  window.cam = new flir.camera(10);

  cam.begin("169.254.201.34");
  console.log('began');
  cam.autoFocus();

  //cam.listFrameRates();
  //cam.useFahrenheit();
  //cam.setFrameRate(30);

  //cam.setScalingMethod(1);
  //cam.setLowScale(300);
  //console.log(cam.getLowScale()+" is the low scale");
  //cam.setHighScale(320);

  cam.setScale(295,320);

  //var tem = new Uint16Array(im.length/2);
  //var t = Uint16Array.from({length: 20}, function(v,k){ k;});
  //var t = tem.from(tem, function(v,i){im[i*2]+(im[i*2]+1<<8)});
  //var t = Int16Array.from(tem, function(v,i){im[i*2]+(im[i*2]+1<<8)});

  var can = document.querySelector('#display');
  var ctx = can.getContext('2d');

  var w = Math.ceil(cam.getWidth());
  var h = Math.ceil(cam.getHeight());

  console.log('width is '+w+' and height is '+h);

  setInterval(()=>{
    var t = cam.getImage();
    if(t.length>10000){
      var im = ctx.createImageData(w,h);
      for(var i=0; i< t.length; i+=4){
        var p = palette(t[i]);
        t[i] = p.r;
        t[i+1] = p.g;
        t[i+2] = p.b;
      }
      im.data.set(t);
      ctx.putImageData(im,0,0);
    }

  },50);
},2000);
