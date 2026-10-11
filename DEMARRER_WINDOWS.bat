@echo off
cd /d "%~dp0"
echo.
echo ---------------------------------------------
echo  LIFEQUEST V3 - MVP local mode PORTRAIT
echo ---------------------------------------------
echo Ouvrez http://localhost:8000 dans votre navigateur.
echo Pour fermer le serveur : Ctrl+C dans cette fenetre.
echo.
where node >nul 2>nul
if not %errorlevel%==0 (
  echo Node.js est requis. Installez Node.js 20 ou plus recent, puis reessayez.
  pause
  exit /b 1
)
node tools\serve.mjs
