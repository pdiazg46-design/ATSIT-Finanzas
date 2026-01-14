@echo off
echo ==========================================
echo INTENTO 39: LOGIN FINAL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo manejo de redireccion exitosa en login...
call git commit -m "Fix: Allow NEXT_REDIRECT to bubble up in login action"

:: 3. Push
echo.
echo ==========================================
echo FINALIZANDO ARREGLOS...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora el login deberia dejarte pasar.
echo ==========================================
pause
