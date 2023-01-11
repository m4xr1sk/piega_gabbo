@echo off
echo Countdown to application launch...
timeout /t 2
start "NODEMON" /MIN nodemon
"C:\Program Files\Google\Chrome\Application\chrome.exe" --start-fullscreen --guest --kiosk http://localhost:3000/index.html
exit