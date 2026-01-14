@echo off
echo ==========================================
echo INTENTO 59: FIX BUILD ACTIONS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Protegiendo acciones de usuario contra build sin DB...
call git commit -m "Fix: Add guard clauses to user actions to prevent build crash"

:: 3. Push
echo.
echo ==========================================
echo BLINDAJE COMPLETO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
