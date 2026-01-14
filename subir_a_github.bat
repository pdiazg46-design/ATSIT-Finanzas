@echo off
echo ==========================================
echo INTENTO 8: RETORNO A NEXT.JS 14 (ESTABILIDAD TOTAL)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios (package.json nuevo)
call git add .

:: 2. Commit
echo Guardando cambios...
call git commit -m "Fix: Downgrade to Next 14 and React 18 for stability"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO VERSION ESTABLE...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Vercel instalara Next.js 14 (A prueba de balas).
echo ==========================================
pause
