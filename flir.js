"use strict";

var leg = document.getElementById('legend');
var cntx = leg.getContext('2d');
cntx.rect(0, 0, leg.width, leg.height);

// add linear gradient
var grd = cntx.createLinearGradient(0, 0, 0, leg.height);
// light blue
grd.addColorStop(1, 'rgba(0,0,0,1)');
grd.addColorStop(7/8, 'rgba(128,32,128,1)');
grd.addColorStop(1/2, 'rgba(255,64,0,1)');
grd.addColorStop(1/4, 'rgba(255,192,0,1)');
grd.addColorStop(0, 'rgba(255,255,255,1)');
cntx.fillStyle = grd;
cntx.fill();

setTimeout(()=>{
  var flir = require('bindings')('flir');
  //var cfg = require('./config.js').config;
  window.cam = new flir.camera(10);

  cam.begin("169.254.140.32");
  console.log('began');

  //cam.listFrameRates();
  //cam.useFahrenheit();
  cam.setFrameRate(30);

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
        var b = t[i+2];
        t[i+2] = (b <= 64) ? b * 2 : ((b > 64 && b < 128) ? -2 * b + 256 : ((b > 192) ? (b - 192) * 4 : 0));
        var r = t[i];
        t[i] = (r * 2 >= 255) ? 255 : r * 2;
      }
      im.data.set(t);
      ctx.putImageData(im,0,0);
    }

  },50);
},2000);
