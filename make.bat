@echo off

if "%1"=="" goto start
if "%1"=="start" goto start
if "%1"=="compile" goto compile
if "%1"=="dist" goto compile

:compile
  winrar a -r -afzip bin/app.nw index.html package.json app lib css node_modules
goto exit

:start
  nw .
goto exit

:dist
  call :compile
  copy /b nw.exe+bin/app.nw bin/app.exe 
goto exit

:exit