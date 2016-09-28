ping -n 15 192.168.1.254
start "" "C:\Program Files\FLIR Systems\ATS-US\ResearchIR\ResearchIR.exe"
ping -n 15 192.168.1.254
TASKKILL /IM ResearchIR.exe
ping -n 15 192.168.1.254
npm start
