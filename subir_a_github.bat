@echo off
echo ==========================================
echo INTENTO 73: SEPARACIÓN DE PODERES
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Separando constantes de Server Actions (Fix use server export violation)...
call git commit -m "Fix: Extract PERMISSIONS constant to separate file to resolve 'use server' export restrictions"

:: 3. Push
echo.
echo ==========================================
echo ESTO TIENE QUE SER.
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo Si esto falla, me corto un cable.
echo ==========================================
pause
