@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22.13+ or 24 LTS.
  pause
  exit /b 1
)
if not exist "node_modules\vite" (
  echo Installing locked dependencies...
  call npm.cmd ci
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
echo Opening local preview at http://127.0.0.1:4174
echo If this port is already in use, open the existing preview or close its console first.
call npm.cmd run preview:local
if errorlevel 1 (
  echo Preview could not start. Check the error above.
  pause
)
endlocal
