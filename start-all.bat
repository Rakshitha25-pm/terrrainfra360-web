@echo off
title TerraInfra360 - Start All
echo ================================================
echo  Starting TerraInfra360 website + portal apps
echo  Website : http://localhost:3000
echo  Vendor  : http://localhost:4001
echo  Admin   : http://localhost:4002
echo  Contractor : http://localhost:4003
echo ================================================
start "TerraInfra360 Website" cmd /k "cd /d C:\Users\Ruchitha\Downloads\TerraInfra360-complete\rakshithapm-new-web && npm run dev"
start "Vendor Portal 4001" cmd /k "cd /d C:\Users\Ruchitha\TI360-Application-\vendor-web && npm run dev"
start "Admin Portal 4002" cmd /k "cd /d C:\Users\Ruchitha\TI360-Application-\admin-web && npm run dev"
start "Contractor Portal 4003" cmd /k "cd /d C:\Users\Ruchitha\TI360-Application-\contractor-web && npm run dev"
echo All four servers are launching in separate windows.
echo Wait until each shows "ready", then open http://localhost:3000
pause
