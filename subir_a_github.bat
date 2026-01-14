@echo off
echo ==========================================
echo INTENTO 38: LIMPIEZA DE COMILLAS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Eliminando comillas accidentales en el token de autenticacion...
call git commit -m "Fix: Strip trimming quotes from env variables to prevent auth errors"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX DE CONFIGURACION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si pegaste el token con comillas, esto lo arregla.
echo ==========================================
pause
