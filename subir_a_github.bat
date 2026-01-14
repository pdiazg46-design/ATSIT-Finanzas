@echo off
echo ==========================================
echo INTENTO 12: CONFIGURACION DE ESTILOS (Tailwind v3)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios (archivos de config nuevos)
call git add .

:: 2. Commit
echo Guardando configuracion de estilos...
call git commit -m "Fix: Configure Tailwind v3 properly (globals.css, config, postcss)"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX DE DISEÑO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora el CSS deberia compilar sin errores.
echo ==========================================
pause
