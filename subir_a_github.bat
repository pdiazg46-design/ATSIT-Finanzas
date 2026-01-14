@echo off
echo ==========================================
echo INTENTO 51: REPARACION TOTAL LOGOUT
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Reparando archivo de acciones corrupto...
call git commit -m "Fix: Rewrite corrupted actions.ts file"

:: 3. Push
echo.
echo ==========================================
echo ESTA ES LA DEFINITIVA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
