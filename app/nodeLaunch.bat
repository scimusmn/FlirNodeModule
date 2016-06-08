cd %~dp0
start /min node nodeJS_filewatcher.js
start chrome --user-data-dir=$(mktemp -d) --kiosk "%~dp0\index.html"