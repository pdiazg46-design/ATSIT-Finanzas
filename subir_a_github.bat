@echo off
echo ==========================================
echo INTENTO 42: MOVIL + LOGIN SIMPLE
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Aplicando mejoras de movil y login por nombre...
call git commit -m "Feat: Mobile UI + Username based Login"

:: 3. Push
echo.
echo ==========================================
echo SUBIENDO ACTUALIZACION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Recuerda que tu usuario ahora es 'Patricio'
echo ==========================================
pause
