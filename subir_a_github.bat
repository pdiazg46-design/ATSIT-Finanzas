@echo off
echo ==========================================
echo INTENTO 45: FIX LOGOUT FINAL
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando import faltante para logout...
call git commit -m "Fix: Missing signOut import in actions"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX REAL...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Ahora si, prueba cerrar sesion.
echo ==========================================
pause
