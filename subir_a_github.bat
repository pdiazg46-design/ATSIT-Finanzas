@echo off
echo ==========================================
echo INTENTO 70: MODO SEGURO
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Implementando Modo Seguro en Pagina de Configuracion...
call git commit -m "Fix: Add Safe Mode wrap to settings page to survive build errors"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Si esto no compila, me retiro y me hago granjero.
echo ==========================================
pause
