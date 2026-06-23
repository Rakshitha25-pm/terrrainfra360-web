@echo off
title Contractor Portal - localhost:4003
cd /d C:\Users\Ruchitha\TI360-Application-\contractor-web
echo ================================================
echo   Starting CONTRACTOR portal
echo   Opens at: http://localhost:4003
echo   KEEP THIS WINDOW OPEN while you use it.
echo ================================================
echo.
call npm run dev
echo.
echo ------------------------------------------------
echo  If the server stopped or you see an error above,
echo  copy the red text and send it to me.
echo ------------------------------------------------
pause
