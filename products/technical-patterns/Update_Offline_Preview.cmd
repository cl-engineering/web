@echo off
setlocal EnableExtensions
pushd "%~dp0" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Could not access the technical-patterns folder.
  pause
  exit /b 1
)
echo Rebuilding the offline SVG preview data...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File ".ebuild_offline_preview.ps1"
set "STATUS=%ERRORLEVEL%"
if not "%STATUS%"=="0" echo ERROR: SVG preview rebuild failed.
if "%STATUS%"=="0" echo SUCCESS: Offline SVG preview updated.
popd
pause
exit /b %STATUS%
