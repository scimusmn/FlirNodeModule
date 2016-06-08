
"use strict";

var flir = require('bindings')('flir');
var cam = new flir.camera(10);

cam.begin();
console.log('began');
//var cfg = require('./config.js').config;
