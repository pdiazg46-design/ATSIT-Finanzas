@echo off
echo ==========================================
echo INTENTO 41: MOVIL FIX
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo menu movil y espaciados...
call git commit -m "Fix: Mobile sidebar and layout responsiveness"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CAMBIOS VISUALES...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Revisa tu celular en 2 minutos.
echo ==========================================
pause
