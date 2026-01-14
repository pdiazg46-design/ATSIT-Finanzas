@echo off
echo ==========================================
echo INTENTO 37: SONDA CRUDA + CHECK DE TOKEN
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando prueba de conexion cruda para aislar Drizzle...
call git commit -m "Fix: Add raw Turso client probe in seed error handler"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SONDA DE NIVEL 4...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Veremos si el problema es Drizzle o el Cliente.
echo ==========================================
pause
