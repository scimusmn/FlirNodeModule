#include "flirCam.h"

//#include "lvcam.h"
//#include "camera.h"
#include <iostream>

using namespace std;
// for Flir
//#include "vendor/flir/lvcam.h"

Nan::Persistent<v8::Function> flirCam::constructor;


flirCam::flirCam() {
  camera=NULL;
  width = 0;
  height = 0;
  lowVal = 0;
  span = 0;
}

flirCam::~flirCam() {
  if(camera&&ready) camera->Disconnect();
  CoUninitialize( );
}

void flirCam::Init(v8::Local<v8::Object> exports) {
  Nan::HandleScope scope;

  // Prepare constructor template
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("camera").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  Nan::SetPrototypeMethod(tpl, "begin", begin);
  Nan::SetPrototypeMethod(tpl, "setFrameRate", setFrameRate);
  Nan::SetPrototypeMethod(tpl, "listFrameRates", listFrameRates);
  Nan::SetPrototypeMethod(tpl, "getLowScale", getLowScale);
  Nan::SetPrototypeMethod(tpl, "setLowScale", setLowScale);
  Nan::SetPrototypeMethod(tpl, "setHighScale", setHighScale);
  Nan::SetPrototypeMethod(tpl, "useFahrenheit", useFahrenheit);
  Nan::SetPrototypeMethod(tpl, "getImage", getImage);
  Nan::SetPrototypeMethod(tpl, "getWidth", getWidth);
  Nan::SetPrototypeMethod(tpl, "getHeight", getHeight);
  Nan::SetPrototypeMethod(tpl, "getMinTemp", getMinTemp);
  Nan::SetPrototypeMethod(tpl, "getMaxTemp", getMaxTemp);
  Nan::SetPrototypeMethod(tpl, "autoFocus", autoFocus);
  Nan::SetPrototypeMethod(tpl, "setScale", setScale);
  Nan::SetPrototypeMethod(tpl, "recalibrate", recalibrate);
  Nan::SetPrototypeMethod(tpl, "checkImage", checkImage);

  constructor.Reset(tpl->GetFunction());
  exports->Set(Nan::New("camera").ToLocalChecked(), tpl->GetFunction());
}

bool flirCam::status(){
  VARIANT va = camera->GetCameraProperty(PROP_CAMERA_STATUS);
	int status = va.iVal;
	VariantClear(&va);
	return status == CAM_CONNECTED;
}

// main window procedure
static LRESULT WINAPI WndProc (
    HWND    hWnd,
    UINT    uMsg,
    WPARAM  wParam,
    LPARAM  lParam)
{
    LRESULT    lRet = 1;

    switch (uMsg)
    {
        case WM_CREATE:
            lRet = DefWindowProc (hWnd, uMsg, wParam, lParam);
            break;

	    default:
            // pass all unhandled messages to DefWindowProc
            lRet = DefWindowProc (hWnd, uMsg, wParam, lParam);
            break;
    }

    /* return 1 if handled message, 0 if not */
    return lRet;
}

void flirCam::createControl()
{
    if ((mhWnd) && (camera == NULL))
    {
        CRect rect = CRect(0, 0, 100, 100);
        BSTR sKey = SysAllocString(L"FLIR Systems AB :-) Cam Control. @$ ");
        camera = new CLVCam;
        camera->CreateControl(camera->GetClsid(), NULL, WS_VISIBLE, rect, CWnd::FromHandle(mhWnd), CAM_CTRL/*ID*/, NULL, FALSE, sKey);
        ::SysFreeString(sKey);
    }
}

void flirCam::setDefaults(){
  CoInitialize(NULL);

  WNDCLASSEX	wc = {};
	HINSTANCE	hInstance;
	MSG			msg;
	static char szAppName[16]="mywindow";

    AfxEnableControlContainer();
	// Find our root instance
    hInstance = GetModuleHandle(NULL);

    ::SetThreadPriority(::GetCurrentThread(), THREAD_PRIORITY_HIGHEST);

    // Register the frame class
    wc.cbSize = sizeof(WNDCLASSEX);
    wc.style         = CS_VREDRAW | CS_HREDRAW;
    wc.lpfnWndProc   = (WNDPROC) WndProc;
    wc.cbClsExtra    = 0;
    wc.cbWndExtra    = 0;
    wc.hInstance     = hInstance;
    wc.hIcon         = LoadIcon(0,IDI_APPLICATION); //NULL;
    wc.hCursor       = LoadCursor (NULL,IDC_ARROW);
    wc.hbrBackground = (HBRUSH) GetStockObject(BLACK_BRUSH);
    wc.lpszMenuName  = NULL;
    wc.lpszClassName = szAppName;

	if (!RegisterClassEx (&wc) ) {
        volatile DWORD err = GetLastError();
        printf("RegisterClass failed x%x\n",err);
        return;
    }

	// Create the window, invisible to avoid clutter
    mhWnd = CreateWindowEx (0, //WS_EX_NOACTIVATE,
                            szAppName,
                            szAppName,
                            0,
                            CW_USEDEFAULT,
                            CW_USEDEFAULT,
                            CW_USEDEFAULT,
                            CW_USEDEFAULT,
                            NULL,
                            NULL,
                            hInstance,
                            NULL);

    // make sure window was created
    if (!mhWnd) {
        volatile DWORD err = GetLastError();
        printf("CreateWindow failed x%x\n",err);
        return;
    }

	// Pump messages and check console until the end
    // This must be done in the main thread and all call to
    // the control component must also be done from the main thread

    ShowWindow(mhWnd, SW_HIDE);
    UpdateWindow(mhWnd);
    createControl();

    ready = false;
    lowVal = 30000;
    highVal = 32000;
    span = 2000;
    minTemp = 65000;
    maxTemp = 0;
}

void flirCam::New(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new flirCam(...)`
    flirCam* obj = new flirCam();
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
  String::Utf8Value addr(info[0]);
  std::string address= std::string(*addr);
  short result = 0;
  cout << obj->camera->GetVersion() << endl;

  VARIANT va;
  va.vt = VT_I2;   // 4-byte real.
  va.iVal = 0;

  //override scaling
  result = obj->camera->SetCameraProperty(PROP_OVERRIDE_LS,va);

  result = obj->camera->SetCameraProperty(PROP_OVERRIDE_OP,va);

  cout << "attempt connection to camera" << endl;
  result = obj->camera->Connect(CAM_A320R, 0, DEVICE_IPORT, CAM_INTF_PLEORA, address.c_str());
  if (IS_OK != result) {
    printf("Failed to connect (%d)\n", obj->camera->GetError(result));
  } else {
    cout << "Connected to camera" << endl;

    VARIANT va = obj->camera->GetCameraProperty(PROP_IMAGE_WIDTH);
    obj->width = (int)va.iVal;
    VariantClear(&va);

    va = obj->camera->GetCameraProperty(PROP_IMAGE_HEIGHT);
    obj->height = (int)va.iVal;
    VariantClear(&va);

    //set image type to 2 (0.01 K per unit)
    COleVariant prop = COleVariant((short)(2));
    obj->camera->SetCameraProperty(PROP_IMAGE_MODE, prop);
    obj->ready = true;
  }
}

void flirCam::recalibrate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  obj->camera->DoCameraAction(8);
}

//set the scaling factors used in grabbing the image; for imageType 2 (set in
// the begin function above) the scale factors are for 0.01 K scaling.
void flirCam::setScale(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  obj->lowVal = (info[0]->IsUndefined() ? 0 : info[0]->NumberValue())*100;
  obj->highVal = (info[1]->IsUndefined() ? 0 : info[1]->NumberValue())*100;
  obj->span = obj->highVal-obj->lowVal;
  //obj->getScaleFactors(low,high);
}

void flirCam::doAutoFocus(){
  if(status()){
    camera->DoCameraAction(CAM_ACTION_AUTO_FOCUS);
  }
}

void flirCam::autoFocus(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  obj->doAutoFocus();
}

//TODO: make it so the setScale function converts from F to K when this has been
//called; not necessary, since

void flirCam::useFahrenheit(const Nan::FunctionCallbackInfo<v8::Value>& info){
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  if(obj->status()){
    COleVariant prop = COleVariant((short)(1));
    short result = obj->camera->SetCameraProperty(PROP_TUNIT,prop);
    if(!result) {
      cout << "Using Fahrenheit units."<< endl;
    } else {
      cout << "Error setting temperature units: " << result << endl;
    }
  } else {
    cout << "Camera not opened" << endl;
  }
}

void flirCam::listFrameRates(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  if(obj->status()){
    VARIANT va = obj->camera->GetCameraProperty(PROP_FRAME_RATE_LIST);
  	CString s, s1;
  	COleSafeArray sa;

  	sa.Attach(va);

  	DWORD numRates = sa.GetOneDimSize();
  	s.Format("Found %u frame rates\n", numRates);

  	for (int i = 0; i < (int)numRates; i++)
  	{
  		long ix = i;
  		double pvData;
  		sa.GetElement(&ix, &pvData);
  		s1.Format(_T("%.2f\n"), pvData);
  		s += s1;
  	}

    cout << s;
  } else {
    cout << "Camera not opened" << endl;
  }
}

void flirCam::setFrameRate(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  if(obj->status()){
    VARIANT va;
    va.vt = VT_R8;   // 4-byte real.
    va.dblVal = info[0]->IsUndefined() ? 1 : info[0]->NumberValue();
    short result = obj->camera->SetCameraProperty(PROP_FRAME_RATE,va);
    VariantClear(&va);
    if(!result) {
      VARIANT va2 = obj->camera->GetCameraProperty(PROP_FRAME_RATE);
      cout << "Frame rate successfully set to " << va2.dblVal << endl;
    } else {
      cout << "Error setting frame rate: " << result << endl;
    }
  } else {
    cout << "Camera not opened" << endl;
  }
}


//I don't think that these should be used; use setScale instead

void flirCam::setLowScale(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  if(obj->status()){
    //VARIANT va;
  //  va.vt = VT_R4;   // 4-byte real.
    float val  = float(info[0]->IsUndefined() ? 1 : info[0]->NumberValue());
    COleVariant prop = COleVariant((float)(val));
    short result = obj->camera->SetCameraProperty(PROP_SCLO,prop);
    //cout << result << " is the low scale return value\n";
    if(!result) {
      VARIANT va2 = obj->camera->GetCameraProperty(PROP_SCLO);
      cout << "Low temperature successfully set to " << va2.fltVal << endl;
    } else {
      cout << "Error setting low temperature: " << result << endl;
    }
  }
}

void flirCam::setHighScale(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  if(obj->status()){
    VARIANT va;
    va.vt = VT_R4;   // 4-byte real.
    va.fltVal = float(info[0]->IsUndefined() ? 1 : info[0]->NumberValue());
    short result = obj->camera->SetCameraProperty(PROP_SCHI,va);
    if(!result) {
      cout << "High temperature successfully set to " << va.fltVal << endl;
    } else {
      cout << "Error setting high temperature: " << result << endl;
    }
  }
}

void flirCam::getLowScale(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  VARIANT va = obj->camera->GetCameraProperty(PROP_SCLO);
  info.GetReturnValue().Set(Nan::New((double)va.fltVal));
}

//this function is used to clear memory on garbage collection, if
// the buffer is passed directly, not copied.
static void FreeCallback(char* data, void* message) {
   //free(message);
   //VARIANT* va = static_cast<VARIANT*>(message);
   GlobalUnlock(data);
   GlobalFree(data);
   //VariantClear(va);
}

//returns a 0-255 grayscale image from the camera; the camera is
// actually spitting out an array of value 0-65535, with each step representing
// 0.01 K

void flirCam::getImage(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  COleVariant va;
  int imageType = 0;
  va = obj->camera->GetImage(20 + imageType);
  if (va.vt == VT_I2) { // Error
		cout << "Problems: " << va.iVal << endl;
    info.GetReturnValue().Set(Nan::Null());
    VariantClear(&va);
    return;
	}
	else if (va.vt != VT_I4) {
		VariantClear(&va);
		cout << "Problems!"<<endl;
	}

  HGLOBAL hMem = (HGLOBAL)va.lVal;

  int pixSize = (imageType < 2 ? 2 : (imageType < 4 ? 4 : 1));
  int trueWidth = ((obj->width + 3) & ~3); //must be sized for 4 byte pixels
  int length = trueWidth * obj->height;

  //Buffer *slowBuffer = Buffer::New(length);
  //memcpy(Buffer::Data(slowBuffer), h, length);

  HGLOBAL out = GlobalAlloc(GMEM_MOVEABLE | GMEM_DISCARDABLE, trueWidth*obj->height*4);

  WORD * pSrc = (WORD*)GlobalLock(hMem);
  BYTE * pOut = (BYTE*)GlobalLock(out);
  int sz = length;
  WORD smin = 65535, smax = 0;
  WORD * tSrc = pSrc;
  BYTE * tOut = pOut;
	/*while (sz--) {
		smin = __min(*tSrc, smin);
		smax = __max(*tSrc, smax);
		tSrc++;
	}
  tSrc = pSrc;
  sz=length;*/
  WORD span = smax-smin;
  while (sz--) {
    smin = __min(*tSrc, smin);
		smax = __max(*tSrc, smax);
    long sample = ((*tSrc++ - obj->lowVal) * 256 / obj->span );
    if(sample>255) sample = 255;
    else if(sample<0) sample = 0;
		*tOut++ = (BYTE)sample;
    *tOut++ = (BYTE)sample;
    *tOut++ = (BYTE)sample;
    *tOut++ = 255;
	}

  obj->minTemp = smin;
  obj->maxTemp = smax;

  //Nan::MaybeLocal<Object> ret = Nan::NewBuffer((char*)pOut,(size_t)(length*4),FreeCallback,NULL);
  Nan::MaybeLocal<Object> ret =Nan::CopyBuffer((char*)pOut,(size_t)(length*4));
  info.GetReturnValue().Set(ret.ToLocalChecked());
	GlobalUnlock(hMem);
  GlobalUnlock(out);
  GlobalFree(hMem);
  GlobalFree(out);
	VariantClear(&va);
  //info.GetReturnValue().Set(Nan::New((int)1));
}

void flirCam::checkImage(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  int sz = info[0]->IsUndefined() ? 1 : info[0]->NumberValue();
  int trueWidth = ((obj->width + 3) & ~3);
  info.GetReturnValue().Set(Nan::New((bool)sz==trueWidth*obj->height*4));
}

void flirCam::getWidth(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New((int)obj->width));
}

void flirCam::getHeight(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New((int)obj->height));
}

void flirCam::getMinTemp(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New((int)obj->minTemp));
}

void flirCam::getMaxTemp(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  flirCam* obj = ObjectWrap::Unwrap<flirCam>(info.Holder());
  info.GetReturnValue().Set(Nan::New((int)obj->maxTemp));
}
