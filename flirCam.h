#ifndef FLIRCAM_H
#define FLIRCAM_H

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
  void allocate();
  void open();

 private:
   //CComPtr<_DLVCam> camera;
   CLVCam* camera = NULL;
   HWND mhWnd = NULL;

   //_DLVCamPtr camera;
   UINT width,height,bufferSize,numStored;
   bool bReady,bCapturing;

   Nan::Persistent<v8::Function> cb;

  explicit flirCam(double value = 0);
  ~flirCam();

  static void begin(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void allocateBuffer(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void GetValue(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void PlusOne(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void Multiply(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void output(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setFrameRate(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void setImageGain(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void start(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void stop(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void save(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void capture(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void isCapturing(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void stopCapture(const Nan::FunctionCallbackInfo<v8::Value>& info);

  static Nan::Persistent<v8::Function> constructor;
  double value_;
};

#endif