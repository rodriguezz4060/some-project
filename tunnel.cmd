@echo off
powershell -NoProfile -Command "ssh -i \"$HOME\.ssh\serveo_key\" -o StrictHostKeyChecking=accept-new -R 23ombr:80:localhost:3000 serveo.net"
pause
