@echo off
echo ==========================================
echo INTENTO 64: FIX SYNTAX ERROR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo error de sintaxis en Login page...
call git commit -m "Fix: Escape arrow char in login page to fix build"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI... NASA MODE ON 🚀
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Revisa el Login.
echo ==========================================
pause
