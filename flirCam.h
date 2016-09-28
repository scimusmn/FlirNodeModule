#ifndef FLIRCAM_H
#define FLIRCAM_H

#define CAM_CTRL 1000

#include "stdafx.h"
#include "lvcam.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dbt.h>
#include <conio.h>

#include "camera.h"

//#include "flirInterfaces.h"

#include <iostream>
#include <nan.h>

//class CLVCam;
using namespace v8;

//#include "FreeImage.h"



class flirCam : public Nan::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);
  void setDefaults();
  void createControl();
  void allocate();
  bool status();
  void open();
  void getScaleFactors(int lw, int hg);
  void doAutoFocus();

 private:
   //CComPtr<_DLVCam> camera;
   CLVCam* camera = NULL;
   HWND mhWnd = NULL;

   //_DLVCamPtr camera;
   UINT width,height,bufferSize,numStored;
   bool ready,bCapturing;
   WORD lowVal, highVal, span;

   Nan::Persistent<v8::Function> cb;

  explicit flirCam();
  ~flirCam();

  static void begin(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setFrameRate(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void listFrameRates(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setScale(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setLowScale(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setHighScale(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void getLowScale(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void useFahrenheit(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void getImage(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void getWidth(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void getHeight(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void autoFocus(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void recalibrate(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void checkImage(const Nan::FunctionCallbackInfo<v8::Value>& info);

  static Nan::Persistent<v8::Function> constructor;
  double value_;
};

#endif
