@echo off
echo ==========================================
echo INTENTO 58: FIX TYPE ERROR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipos en settings page...
call git commit -m "Fix: Update settings initialization to match CompanySettings interface"

:: 3. Push
echo.
echo ==========================================
echo EL ULTIMO CLAVO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
