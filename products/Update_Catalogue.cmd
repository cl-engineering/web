@echo off
setlocal EnableExtensions
pushd "%~dp0" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Could not access the products folder. Check network access and permissions.
  pause
  exit /b 1
)
echo.
echo ========================================================
echo  CIRCLE LINE - UPDATE CATALOGUE ^(PREVIEW / NOINDEX^)
echo ========================================================
echo.
echo Generating product pages from catalog.json.
echo Removing outdated product pages and updating the root sitemap.xml.
echo Product pages will remain noindex in PREVIEW mode.
echo This command does NOT upload or deploy the website.
echo.
where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: Windows PowerShell was not found on this computer.
  popd
  pause
  exit /b 1
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File ".\generate_seo.ps1"
set "STATUS=%ERRORLEVEL%"
echo.
if not "%STATUS%"=="0" echo ERROR: Catalogue update failed. Review the error above.
if "%STATUS%"=="0" echo SUCCESS: Preview pages and local sitemap updated.
popd
pause
exit /b %STATUS%
