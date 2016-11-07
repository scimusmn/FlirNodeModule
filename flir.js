"use strict";

var leg = document.getElementById('legend');
var cntx = leg.getContext('2d');
cntx.rect(0, 0, leg.width, leg.height);

window.palette = (i) => {
  var r = Math.round(Math.pow(i/255,2)*255);
  var g = (i<128)?i*2:511-i*2;
  var b = Math.round((255-i)/2);
  return {r: r, g: g, b: b};
}

// add linear gradient
var grd = cntx.createLinearGradient(0, 0, leg.width, 0 );
for(var i=0; i< 256; i++){
  var p = palette(i);
  grd.addColorStop(i/255, 'rgba('+p.r+','+p.g+','+p.b+',1)');
}


cntx.fillStyle = grd;
cntx.fill();

setTimeout(()=>{
  var flir = require('bindings')('flir');
  //var cfg = require('./config.js').config;
  window.cam = new flir.camera(10);

  cam.begin("169.254.224.254");
  console.log('began');
  cam.autoFocus();

  //cam.listFrameRates();
  //cam.useFahrenheit();
  //cam.setFrameRate(30);
  cam.setScale(300,312);

  function autoScale() {
    var min = cam.getMinTemp()/100;
    var max = cam.getMaxTemp()/100;
    var span = max-min;
    cam.setScale(min+.25*span,max-.25*span);
  }

  setTimeout(autoScale,1000);
  setInterval(()=>{
    autoScale();
    cam.autoFocus();
  },60000);



  var can = document.querySelector('#display');
  var ctx = can.getContext('2d');

  var w = Math.ceil(cam.getWidth());
  var h = Math.ceil(cam.getHeight());

  console.log('width is '+w+' and height is '+h);
  console.log('width is ' + can.width + ' and heigth is ' + can.height);
  can.width = 320;
  can.height = 240;

  var mWid = parseInt()

  setInterval(()=>{
    var t = cam.getImage();
    if(t&&t.length>10000){
      var im = ctx.createImageData(w,h);
      for(var i=0; i< t.length; i+=4){
        var p = palette(t[i]);
        t[i] = p.r;
        t[i+1] = p.g;
        t[i+2] = p.b;
      }
      im.data.set(t);

      //note: to mirror this, draw to intermediate canvas, and then drawImage
      // the intermediate into the display canvas
      ctx.putImageData(im,0,0);
    }

  },50);
},2000);
