@echo off
echo ==========================================
echo INTENTO 25: FIX IMPORT Y TIPOS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo import faltante en db.ts y tipos en balance...
call git commit -m "Fix: Add missing createClient import and fix balance report type error"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX FINAL (ESPERO)...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si esto no funciona, reinicio el router.
echo ==========================================
pause
