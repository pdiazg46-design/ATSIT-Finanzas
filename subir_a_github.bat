@echo off
echo ==========================================
echo INTENTO 62: LLAVE DEL SEED
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando clave secreta al enlace de seed...
call git commit -m "Fix: Add secret param to seed link"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI ABRE LA PUERTA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
