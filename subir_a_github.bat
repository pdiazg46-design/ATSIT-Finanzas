@echo off
echo ==========================================
echo INTENTO 63: SISTEMA DE DIAGNOSTICO NASA
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Incorporando panel de telemetria en Login...
call git commit -m "Feat: Add Diagnostic HUD to Login Page"

:: 3. Push
echo.
echo ==========================================
echo HOUSTON, TENEMOS UNA SOLUCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Revisa el Login y dime QUE VES en el cuadro de Estado.
echo ==========================================
pause
