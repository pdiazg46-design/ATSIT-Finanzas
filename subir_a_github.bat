@echo off
echo ==========================================
echo INTENTO 55: FIX BUILD ERROR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo exportacion de handlers en auth.ts...
call git commit -m "Fix: Export handlers from auth.ts to fix build"

:: 3. Push
echo.
echo ==========================================
echo AHORA SI QUE SI (x2)...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Revisa que el 'Error' cambie a verde en Vercel.
echo ==========================================
pause
