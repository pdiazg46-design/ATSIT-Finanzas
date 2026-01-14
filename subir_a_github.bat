@echo off
echo ==========================================
echo INTENTO 21: FIX BUILD ERROR (Tipos en Dashboard)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipo implicito en dashboard...
call git commit -m "Fix: Add explicit any type to activeProjects map"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Este juego de Whac-A-Mole con TypeScript debe terminar pronto.
echo ==========================================
pause
