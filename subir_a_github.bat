@echo off
echo ==========================================
echo INTENTO 14: FIX CLIENTE (FRAMER MOTION)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Guardando version estable de animaciones...
call git commit -m "Fix: Downgrade framer-motion to v11 and disable fs write in prod"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SOLUCION DEFINITIVA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Cruzando los dedos!
echo ==========================================
pause
