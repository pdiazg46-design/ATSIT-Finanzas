@echo off
echo ==========================================
echo INTENTO 35: CONFIG CHECK
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando reporte de variables de entorno en seed...
call git commit -m "Fix: Return DB config details in seed error for debugging"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SONDA DE CONFIGURACION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora veremos si Vercel tiene la variable correcta.
echo ==========================================
pause
