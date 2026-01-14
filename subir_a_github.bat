@echo off
echo ==========================================
echo INTENTO 17: FIX BUILD ERROR (Tipos en Empleados II)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo otro tipo implicito en empleados...
call git commit -m "Fix: Add explicit any type to ownedProjects find callback"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Este si que si!
echo ==========================================
pause
