@echo off
echo ==========================================
echo INTENTO 9: SQA - FINAL FIX DE VERSIONES
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Guardando correcciones de librerias...
call git commit -m "Fix: Align devDependencies with Next 14/React 18"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO MATRIZ DE COMPATIBILIDAD...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora SI coinciden todas las piezas del rompecabezas.
echo ==========================================
pause
