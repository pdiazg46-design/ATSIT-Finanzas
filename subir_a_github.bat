@echo off
echo ==========================================
echo INTENTO 57: FIX BUILD FINAL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Evitando crash de DB en tiempo de build...
call git commit -m "Fix: Remove DB connection strict check to allow build to pass"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI QUE NO HAY EXCUSA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
