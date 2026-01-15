@echo off
echo ==========================================
echo AJUSTES LISTA PROYECTOS MOVIL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Transformando filas de tabla en tarjetas apiladas para movil...
call git commit -m "UI: Responsive fonts/tables for Financial Reports"

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
