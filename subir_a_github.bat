@echo off
echo ==========================================
echo INTENTO 34: AUTO-MIGRACION
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando creacion automatica de tablas en ruta seed...
call git commit -m "Feat: Update seed route to perform auto-migration (create tables)"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SOLUCION DEFINITIVA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora el link de setup creara las tablas que faltaban.
echo ==========================================
pause
