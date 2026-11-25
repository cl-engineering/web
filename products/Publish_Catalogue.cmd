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
echo  CIRCLE LINE - PUBLISH CATALOGUE AND UPDATE SITEMAP
echo ========================================================
echo.
echo Updates THIS website folder: generates product pages with index,follow
echo and updates the REAL sitemap.xml in the parent website folder.
echo.
echo WARNING: This is NOT an isolated test.
echo If CL-DEMO products are found, an extra confirmation is required.
echo If the website folder is already live, these changes can become public.
echo This command does NOT transfer files to a separate web host.
echo.
set /p "CONFIRM=Type PUBLISH to continue: "
if /I not "%CONFIRM%"=="PUBLISH" (
  echo Cancelled. No files were changed.
  popd
  pause
  exit /b 1
)
where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: Windows PowerShell was not found on this computer.
  popd
  pause
  exit /b 1
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File ".\generate_seo.ps1" -Publish
set "STATUS=%ERRORLEVEL%"
echo.
if "%STATUS%"=="0" echo SUCCESS: Product pages and REAL root sitemap were updated with index,follow.
if not "%STATUS%"=="0" echo ERROR: Publication preparation failed. Check the error above.
popd
pause
exit /b %STATUS%
