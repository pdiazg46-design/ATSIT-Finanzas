@echo off
echo ==========================================
echo INTENTO 16: FIX BUILD ERROR (Tipos en Empleados)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipo implicito en map de empleados...
call git commit -m "Fix: Add explicit any type to employee tasks map"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Esperemos que este sea el ultimo error de tipos!
echo ==========================================
pause
