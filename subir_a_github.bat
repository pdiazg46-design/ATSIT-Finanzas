@echo off
echo ==========================================
echo INTENTO 31: DEEP DEBUG
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Exponiendo la causa raiz del error de login...
call git commit -m "Fix: Unwrap specific error cause in login for better debugging"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SONDAS DE DEBUG...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora veremos que hay debajo de la mascara del error.
echo ==========================================
pause
