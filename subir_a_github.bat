@echo off
echo ==========================================
echo INTENTO 69: BLINDAJE SETTINGS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Reforzando manejo de errores en pagina de configuracion...
call git commit -m "Fix: Enhance error handling in Settings page to prevent build failure"

:: 3. Push
echo.
echo ==========================================
echo OTRA VEZ A LA CARGA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Revisa Deployment.
echo ==========================================
pause
