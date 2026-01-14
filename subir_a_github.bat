@echo off
echo ==========================================
echo INTENTO 50: LOGOUT FORZADO
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Forzando redireccion en logout...
call git commit -m "Fix: Force redirect on logout"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI, POR LAS BUENAS O POR LAS MALAS...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
