@echo off
echo ==========================================
echo INTENTO 46: FORM LOGOUT
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Usando formulario nativo para logout...
call git commit -m "Fix: Replace logout click handler with form action"

:: 3. Push
echo.
echo ==========================================
echo ESTE SI QUE SI...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Prueba de fuego.
echo ==========================================
pause
