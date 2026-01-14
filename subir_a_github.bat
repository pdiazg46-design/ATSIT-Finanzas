@echo off
echo ==========================================
echo INTENTO 11: AGREGAR LIBRERIA FALTANTE (ZOD)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Guardando la pieza perdida...
call git commit -m "Fix: Add missing zod dependency"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX ZOD...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Zod ha sido agregado. Vercel deberia compilar.
echo ==========================================
pause
