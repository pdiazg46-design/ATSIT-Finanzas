@echo off
echo ==========================================
echo INTENTO 22: FIX BUILD - DETALLE PROYECTO
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipos implicitos en detalle de proyecto...
call git commit -m "Fix: Add explicit any types to project detail page calculations"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo TypeScript vs Developer: Round 22
echo ==========================================
pause
