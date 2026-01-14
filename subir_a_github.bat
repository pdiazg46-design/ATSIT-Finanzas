@echo off
echo ==========================================
echo INTENTO 47: FIX SYNTAX SIDEBAR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Reparando error de sintaxis en Sidebar...
call git commit -m "Fix: Sidebar JSX syntax errors"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
