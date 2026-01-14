@echo off
echo ==========================================
echo INTENTO 32: DETECTOR DE ERRORES REALES
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Modificando auth.ts para lanzar errores legibles...
call git commit -m "Fix: Wrap authorize in try-catch to propagate internal errors to UI"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SONDAS NIVEL 2...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora el error deberia gritar cual es el problema.
echo ==========================================
pause
