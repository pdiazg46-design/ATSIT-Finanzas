@echo off
title ATSIT Finanzas - Aplicacion Financiera
echo ========================================================
echo         Iniciando ATSIT Finanzas (Modo Local)
echo ========================================================
echo.
echo Limpiando procesos Node.exe anteriores...
taskkill /F /IM node.exe >nul 2>&1
cd /d "%~dp0"
echo Abriendo aplicacion en el navegador...
start http://localhost:3000
echo Servidor iniciado en http://localhost:3000
npm start
