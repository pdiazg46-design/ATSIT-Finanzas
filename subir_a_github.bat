@echo off
echo ==========================================
echo INTENTO 33: SONDA DE BASE DE DATOS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando prueba de conexion directa antes de auth...
call git commit -m "Fix: Add direct DB connectivity probe in login action"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SONDA DE NIVEL 3...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si falla la conexion, ahora lo sabremos seguro.
echo ==========================================
pause
