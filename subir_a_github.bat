@echo off
echo ==========================================
echo INTENTO 74: LIMPIEZA DE DUPLICADOS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Eliminando imports duplicados en user-actions.ts (Error mio)...
call git commit -m "Fix: Remove duplicate PERMISSIONS import in user-actions.ts"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI. 
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo Rezando...
echo ==========================================
pause
