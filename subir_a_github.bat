@echo off
echo ==========================================
echo INTENTO 67: BOTON VISIBLE SIEMPRE
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Haciendo visible el boton de seed aunque existan usuarios...
call git commit -m "Fix: Make seed/reset button always visible for password recovery"

:: 3. Push
echo.
echo ==========================================
echo ULTIMO EMPUJON...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Ahora si te aparecera el boton.
echo ==========================================
pause
