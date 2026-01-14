@echo off
echo ==========================================
echo INTENTO 60: MEDIDA DE EMERGENCIA
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Desactivando logic de Settings temporalmente...
call git commit -m "Fix: Temporarily comment out Settings logic to unblock deployment"

:: 3. Push
echo.
echo ==========================================
echo ESTO TIENE QUE PASAR SI O SI...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Revisa Deployment.
echo ==========================================
pause
