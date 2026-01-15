@echo off
echo ==========================================
echo AJUSTES VISUALES MOVIL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Ajustando tamanos de fuente y padding en Dashboard para movil...
call git commit -m "UI: Reduce padding and font sizes on mobile dashboard"

:: 3. Push
echo.
echo ==========================================
echo SUBIENDO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
