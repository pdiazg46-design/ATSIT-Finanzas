@echo off
echo ==========================================
echo INTENTO 18: FIX BUILD ERROR (Tipos en Empleados III)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo error de overload en eq()...
call git commit -m "Fix: Cast pid to number in employee projects query"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo A la tercera la vencida?
echo ==========================================
pause
