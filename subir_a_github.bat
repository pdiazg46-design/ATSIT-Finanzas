@echo off
echo ==========================================
echo INTENTO 28: SEED USER API
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando ruta API para crear usuario admin...
call git commit -m "Feat: Add seed API route to create admin user"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO RUTINA DE CREACION DE USUARIO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Sigue las instrucciones que te dare a continuacion.
echo ==========================================
pause
