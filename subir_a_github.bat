@echo off
echo ==========================================
echo INTENTO 20: FIX BUILD ERROR (Tipos en Historial)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipo implicito en historial...
call git commit -m "Fix: Add explicit any type to archivedProjects map"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Este tiene que ser el ultimo, por favor!
echo ==========================================
pause
