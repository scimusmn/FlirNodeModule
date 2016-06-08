#include "stdafx.h"
#include <nan.h>
#include "flirCam.h"


void InitAll(v8::Local<v8::Object> exports) {
  flirCam::Init(exports);
}

NODE_MODULE(flirCamera, InitAll)
