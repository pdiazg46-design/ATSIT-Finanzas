@echo off
echo ==========================================
echo INTENTO 30: MODIFICAR MENSAJE DE ERROR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Modificando actions.ts para mostrar errores detallados...
call git commit -m "Fix: Expose detailed error message in login action for debugging"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX DE DEBUGGING...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora el login nos dira QUE esta fallando exactamente.
echo ==========================================
pause
