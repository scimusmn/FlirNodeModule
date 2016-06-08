"use strict";

var com = require('serialport');

var serial = function() {
  let bufSize = 512;

  let _this = this;
  let ser = null;
  _this.isOpen = false;
  _this.onConnect = () => {};

  _this.onMessage = () => {};

  _this.send = (arr) => {
    arr.push(124);
    if (_this.isOpen) ser.write(new Buffer(arr));
  };

  _this.open = (name, fxn) => {
    console.log(name);
    if (name[0] != '/')
      com.list(function(err, ports) {
        ports.forEach(function(port) {
          if (port.comName.indexOf(name) > -1) {
            name = port.comName;
            _this.openByName(name, fxn);
          }
        });
      });

    else _this.openByName(name, fxn);
  };

  _this.openByName = (portName, fxn) => {
    if (fxn) _this.onMessage = fxn;
    console.log('Opening serialport ' + portName);
    ser = new com.SerialPort(portName, {
      baudrate: 115200,
      parser: com.parsers.readline('\r\n', 'binary'),
      buffersize:bufSize,
    });

    ser.on('open', function() {
      _this.isOpen = true;
      ser.on('data', function(data) {
        if (data == 'init') _this.onConnect();
        _this.onMessage(data);
      });

    });

    ser.on('error', function() {
      console.log('Error from SerialPort');
      sp = null;
    });
  };
};

exports.serial = new serial();
var sp = exports.serial;

////////////////////////////////////////////////////////

var Arduino = function() {
  this.ready = false;
  var _this = this;
  this.digiHandlers = [];
  this.anaHandlers = [];

  //////////////////////////////////////////
  // variables for bit-banging the commands
  //////////////////////////////////////////

  var START = 128;
  var DIGI_READ = 0;
  var DIGI_WRITE = 32;  //pins 2-13
  var ANA_READ = 64;
  var DIGI_WATCH_2 = 72; //pins 14-19
  var ANA_REPORT = 80;
  var ANA_WRITE = 96;    //pins 3,5,6,9,10,11
  var DIGI_WATCH = 112;  //pins 2-13

  /*****************************************************
   * explanation of bit packages to arduino

   0 and 1 represent actual bits, letters are described below

   For Digital Read:
                      Byte 1
           _______________________________
          | 1 | 0 | 0 | D | D | 2 | 1 | 0 |
           -------------------------------

           D: bits representing pin number to read

  For Digital Watch Pin on pins 2-13
                      Byte 1
           _______________________________
          | 1 | 1 | 1 | 1 | D | D | D | D |
           -------------------------------

           D: bits representing the pin number (2-13) to watch

      OR, for pins 14-19

                      Byte 1
           _______________________________
          | 1 | 1 | 0 | 0 | 1 | D | D | D |
           -------------------------------

          D: bits representing the pin number (14-19 [but minus 14]) to watch

  For Digital Write on pins 2-13:
                     Byte 1
           _______________________________
          | 1 | 0 | 1 | P | P | P | P | S |
           -------------------------------

          P: bits representing pin number to read
          S: bit indicating pin state

  For Analog Read on pins 0-5:
                     Byte 1
           _______________________________
          | 1 | 1 | 0 | 0 | 0 | P | P | P |
           -------------------------------

          P: bits representing pin number to read

  For Analog Report on pins 0-5:
                 Byte 1                                   Byte 2
       _______________________________        _______________________________
      | 1 | 1 | 0 | 1 | P | P | P | T |      | 0 | T | T | T | T | T | T | T |
       -------------------------------        -------------------------------

      P: bits representing pin number to read
      T: bits representing half of the interval time between reports

  For Analog Write on pins 3,5,6,9,10,11:
                 Byte 1                                   Byte 2
       _______________________________        _______________________________
      | 1 | 1 | 1 | 0 | P | P | P | V |      | 0 | V | V | V | V | V | V | V |
       -------------------------------        -------------------------------

      P: bits representing pin number to write 3=0,5=1,6=2,9=3,10=4,11=5
      V: bits representing the value to write to the pin

  /*****************************************************
   * explanation of bit packages from arduino
   *****************************************************

  For Analog Read:
                  Byte 1                                   Byte 2
       _______________________________        _______________________________
      | 1 | 1 | P | P | P | V | V | V |      | 0 | V | V | V | V | V | V | V |
       -------------------------------        -------------------------------

      P: bits representing pin number to read 3=0,5=1,6=2,9=3,10=4,11=5
      V: bits representing the value read from the pin

  For Digital Read:
                  Byte 1
       _______________________________
      | 1 | 1 | P | P | P | P | P | V |
       -------------------------------

      P: bits representing the pin being reported 0-32
      V: bit representing the value read from the pin 0 or 1

  */

  this.ws = null;

  this.onMessage = function(data) {
    let msg = data;
    if (msg.length >= 1) {
      for (var i = 0; i < msg.length; i++) {
        var chr = msg.charCodeAt(i);
        if (chr & ANA_READ) {  //if the packet is analogRead
          var pin = ((chr & 56) >> 3);        //extract the pin number
          var val = ((chr & 7) << 7) + (msg.charCodeAt(++i) & 127); //extract the value
          if (typeof _this.anaHandlers[pin] == 'function') _this.anaHandlers[pin](pin, val);
        } else if (chr & (START + DIGI_READ)) {      //if the packet is digitalRead
          //extract the pin number
          var pin = ((chr & 62) >> 1);
          var val = chr & 1;
          if (typeof _this.digiHandlers[pin] == 'function') _this.digiHandlers[pin](pin, val);
        }
      }
    }
  };

  this.digitalWrite = function(pin, state) {
    if (pin <= 13) sp.send([START + DIGI_WRITE + ((pin & 15) << 1) + (state & 1)]);
    else console.log('Pin must be less than or equal to 13');
  };

  this.digitalRead = function(pin) {
    sp.send([START + DIGI_READ + (pin & 31)]);
  };

  this.analogWrite = function(pin, val) {
    if (val >= 0 && val < 256)
      sp.send([START + ANA_WRITE + ((pin & 7) << 1) + (val >> 7), val & 127]);
  };

  this.watchPin = function(pin, handler) {
    console.log('set up watch on pin ' + pin);
    if (pin <= 13) sp.send([START + DIGI_WATCH + (pin & 15)]);
    else sp.send([START + DIGI_WATCH_2 + ((pin - 13) & 7)]);
    this.digiHandlers[pin] = handler;
  };

  this.analogReport = function(pin, interval, handler) {
    interval /= 2;
    if (interval < 256) {
      sp.send([START + ANA_REPORT + ((pin & 7) << 1) + (interval >> 7), interval & 127]);
      this.anaHandlers[pin] = handler;
    } else console.log('interval must be less than 512');
  };

  this.setAnalogHandler = function(pin, handler) {
    this.anaHandlers[pin] = handler;
  };

  this.setHandler = function(pin, handler) {
    this.digiHandlers[pin] = handler;
  };

  this.analogRead = function(pin) {
    sp.send([START + ANA_READ + ((pin & 7) << 1)]);
  };

  this.stopReport = function(pin) {
    sp.send([START + ANA_REPORT + ((pin & 7) << 1), 0]);
  };

  this.wireSend = function(adr, dataArr) {
    dataArr.unshift(128, 192, adr);
    dataArr.push(192);
    dataArr.push(129);
    sp.send(dataArr);
  };

  this.onReady = function() {};

  this.serialOpenCB = function() {
    this.ready = true;
    this.onReady();
  };

  this.connect = function(portname, fxn) {
    //onSerialOpen = fxn;
    //openSerial(portname, _this.onMessage);
    exports.serial.onConnect = fxn;
    exports.serial.open(portname, _this.onMessage);
  };

  this.createdCallback = function() {
  };
};

exports.arduino = new Arduino();
