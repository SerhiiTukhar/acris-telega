@echo off
setlocal

set "ROOT=%~dp0"
set "APP_DIR=%ROOT%telegram-app"
set "BUNDLED_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

where node >nul 2>nul
if %errorlevel%==0 (
  set "NODE=node"
) else if exist "%BUNDLED_NODE%" (
  set "NODE=%BUNDLED_NODE%"
) else (
  echo Node.js not found.
  echo Install Node.js or run the app from Codex.
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
"%NODE%" server.mjs --open

