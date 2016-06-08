#include "flirCam.h"

//#include "lvcam.h"
#include "camera.h"
#include <iostream>

using namespace std;
// for Flir
//#include "vendor/flir/lvcam.h"

Nan::Persistent<v8::Function> flirCam::constructor;

flirCam::flirCam(double value) : value_(value) {
}

flirCam::~flirCam() {
}

void flirCam::Init(v8::Local<v8::Object> exports) {
  Nan::HandleScope scope;

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("camera").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  Nan::SetPrototypeMethod(tpl, "output", output);
  Nan::SetPrototypeMethod(tpl, "allocateBuffer", allocateBuffer);
  Nan::SetPrototypeMethod(tpl, "begin", begin);
  Nan::SetPrototypeMethod(tpl, "setImageGain", setImageGain);
  Nan::SetPrototypeMethod(tpl, "setFrameRate", setFrameRate);
  Nan::SetPrototypeMethod(tpl, "start", start);
  Nan::SetPrototypeMethod(tpl, "stop", stop);
  Nan::SetPrototypeMethod(tpl, "save", save);
  Nan::SetPrototypeMethod(tpl, "capture", capture);
  Nan::SetPrototypeMethod(tpl, "stopCapture", stopCapture);
  Nan::SetPrototypeMethod(tpl, "isCapturing", isCapturing);

  constructor.Reset(tpl->GetFunction());
  exports->Set(Nan::New("camera").ToLocalChecked(), tpl->GetFunction());
}

void flirCam::setDefaults(){
  HRESULT hr = CoInitializeEx(NULL,COINIT_MULTITHREADED);
  //hr = camera.CreateInstance(CLSID_LVCam);
  if(S_OK == hr) cout << "initialized thread\n";
  hr = camera.CreateInstance(CLSID_LVCam);
  if(S_OK == hr) cout << "Created instance of _DLVCam" << endl;

  IClassFactory2 * fac;
  CoGetClassObject(CLSID_LVCam,CLSCTX_ALL,NULL, IID_IClassFactory2, reinterpret_cast<void**>(&fac));
  BSTR key = L"FLIR Systems AB :-) Cam Control. @$ ";
  //fac->RequestLicKey(0,&key);
  hr = fac->CreateInstanceLic(NULL, NULL, DIID__DLVCam, key, reinterpret_cast<void**>(&camera));
     //reinterpret_cast<void**>(&camera));
  //if(S_OK == hr) cout << "joined" << endl;

  //cout  << "Version is " << camera->GetVersion() << endl;

  //CoUninitialize();
  //hr =  RequestLicKey(NULL,&key);

  //cout << key << *key << endl;
}

void flirCam::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new flirCam(...)`
    double value = info[0]->IsUndefined() ? 0 : info[0]->NumberValue();
    flirCam* obj = new flirCam(value);
    obj->Wrap(info.This());
    obj->setDefaults();
    //obj->open();
    info.GetReturnValue().Set(info.This());
  } else {
    // Invoked as plain function `flirCam(...)`, turn into construct call.
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = { info[0] };
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
    info.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void flirCam::begin(const Nan::FunctionCallbackInfo<v8::Value>& info){
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  short result = 0;
  cout << "attempt connection to camera" << endl;
  HRESULT hr = CoInitializeEx(NULL,COINIT_MULTITHREADED);
  if(S_OK == hr) cout << "Created instance of _DLVCam" << endl;
  else if(S_FALSE ==hr) cout << "already initialized\n";
  result = obj->camera->Connect(CAM_A320S, 0, DEVICE_IPORT, CAM_INTF_PLEORA, "169.254.140.32");
  cout << result << " is the result\n";
  //VARIANT result2 = obj->camera->GetCameraProperty(PROP_CAMERA_TYPE);
  //cout << result2.iVal << "  = result" << endl;
  if(EV_CONNECTED == result){
    cout << "Connected to camera" << endl;
  } else {
    cout << "Error connecting to camera: " << result << endl;
  }
}

void flirCam::output(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New("Test").ToLocalChecked());
}

void flirCam::capture(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
}

void flirCam::stopCapture(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
}

void flirCam::setFrameRate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
}

void flirCam::isCapturing(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New((int)1));
}

void flirCam::setImageGain(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
}

void flirCam::start(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  /*RESULT result = RESULT_ERROR;
  if(obj->bReady){
    result = obj->camera->Grab();
    info.GetReturnValue().Set(Nan::New((int)result));
	  if(!result) cout << "Started camera. "<<endl;
	  else cout << "Error while starting: "<< result << endl;
  } else {
    info.GetReturnValue().Set(Nan::New((int)RESULT_ERROR));
    cout << "Must open camera first" << endl;
  }*/
}

void flirCam::allocateBuffer(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  /*double numFrames = info[0]->IsUndefined() ? 1 : info[0]->NumberValue();
  RESULT result = RESULT_ERROR;
  if(obj->bReady){
    obj->buffer.allocate(numFrames,obj->bufferSize);
    info.GetReturnValue().Set(Nan::New(obj->buffer.maxFrames()));
	  if(obj->buffer.maxFrames() == numFrames) cout << "Allocated " << numFrames << " frames. "<<endl;
	  else cout << "Error while allocating: "<< result << endl;
  } else {
    info.GetReturnValue().Set(Nan::New((int)RESULT_ERROR));
    cout << "Must open camera first" << endl;
  }*/
}

void flirCam::stop(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
}

void flirCam::save(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  //String::Utf8Value cmd(info[0]);
  //string dir = (string(*cmd).length() ? string(*cmd) : "temp");

  //v8::Local<v8::Function> callb = info[1].As<v8::Function>();
}
