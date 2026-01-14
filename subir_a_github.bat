@echo off
echo ==========================================
echo INTENTO 48: BOTON AISLADO
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Usando componente de boton dedicado para debug...
call git commit -m "Refactor: Extract LogoutButton component"

:: 3. Push
echo.
echo ==========================================
echo AHORA VEREMOS QUE PASA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
