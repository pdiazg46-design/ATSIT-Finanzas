@echo off
echo ==========================================
echo INTENTO 53: FIX DEFINITIVO (Manejador de Ruta)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando ruta API de auth faltante...
call git commit -m "Fix: Add missing NextAuth API route"

:: 3. Push
echo.
echo ==========================================
echo ESTO ERA LO QUE FALTABA (99% SEGURO)...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
