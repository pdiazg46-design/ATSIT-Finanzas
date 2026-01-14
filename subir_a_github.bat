@echo off
echo ==========================================
echo INTENTO 68: LA VICTORIA FINAL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Limpiando herramientas de diagnostico y reactivando pagina de configuracion...
call git commit -m "Chore: Cleanup diagnostics and re-enable settings page logic"

:: 3. Push
echo.
echo ==========================================
echo MISIÓN CUMPLIDA.
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo GRACIAS POR VOLAR CON NASA AIRLINES. 🚀
echo ==========================================
pause
