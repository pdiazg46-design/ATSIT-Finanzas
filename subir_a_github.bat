@echo off
echo ==========================================
echo INTENTO 71: CORRECCION SINTAXIS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo error de sintaxis en settings page...
call git commit -m "Fix: Restore missing function declaration in settings page"

:: 3. Push
echo.
echo ==========================================
echo VALIDANDO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo ESPEREMOS QUE SEA LA VENCIDA.
echo ==========================================
pause
