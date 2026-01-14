@echo off
echo ==========================================
echo INTENTO 61: HABILITAR SEED
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Rehabilitando enlace de seed para inicializar DB...
call git commit -m "Fix: Re-enable seed link in login page for production initialization"

:: 3. Push
echo.
echo ==========================================
echo CREANDO LA LLAVE MAESTRA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
