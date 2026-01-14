@echo off
echo ==========================================
echo INTENTO 26: FIX IMPORTS DB Y TIPOS BALANCE
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo imports perdidos en db.ts y tipos en balance...
call git commit -m "Fix: Add missing drizzle and schema imports and fix balance report build error"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX 26...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si falta algo mas, me como el teclado.
echo ==========================================
pause
