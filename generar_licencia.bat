@echo off
title Generador de Licencias ATSIT Finanzas
cd /d "%~dp0"
set /p HWID="Ingresa el HWID del cliente (ej: HWID-A4F8-92B1-4812): "
echo.
node scratch/generar_licencia.js %HWID%
echo.
pause
