@echo off
echo ==========================================
echo INTENTO 56: FIX BUILD SETTINGS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Forzando renderizado dinamico en settings...
call git commit -m "Fix: Add force-dynamic to settings page to prevent SSG build error"

:: 3. Push
echo.
echo ==========================================
echo UN CLASICO DE NEXT.JS...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
