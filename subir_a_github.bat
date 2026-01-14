@echo off
echo ==========================================
echo INTENTO 49: FIX IMPORT LOGOUT
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando import faltante de LogoutButton...
call git commit -m "Fix: Add missing LogoutButton import"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI QUE SI...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
