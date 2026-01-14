@echo off
echo ==========================================
echo INTENTO 29: BOTON SETUP
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando boton de setup en login...
call git commit -m "Feat: Add convenient seed database link to login page"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO ACTUALIZACION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora sera mas facil configurar la base de datos.
echo ==========================================
pause
