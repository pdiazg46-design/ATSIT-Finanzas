@echo off
echo ==========================================
echo INTENTO 66: RESET PASS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Forzando actualizacion de contraseña en seed...
call git commit -m "Fix: Force password reset in seed script to ensure login access"

:: 3. Push
echo.
echo ==========================================
echo ESTA ES LA DEFINITIVA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Dale al botón de INICIALIZAR una ÚLTIMA vez.
echo ==========================================
pause
