@echo off
echo ==========================================
echo INTENTO 19: FIX FINAL - TIPOS EN EMPLEADOS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo ultimos errores de TypeScript...
call git commit -m "Fix: Add explicit any types to filter p and map task to solve build error"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION FINAL...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si esto no funciona, me hago monje tibetano.
echo ==========================================
pause
