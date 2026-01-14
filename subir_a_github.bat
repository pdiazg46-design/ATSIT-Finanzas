@echo off
echo ==========================================
echo INTENTO 52: EMERGENCIA - MODO CLIENTE
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Cambiando a logout nativo del cliente...
call git commit -m "Fix: Switch to client-side signOut with SessionProvider"

:: 3. Push
echo.
echo ==========================================
echo RECUPERANDO EL CONTROL...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
