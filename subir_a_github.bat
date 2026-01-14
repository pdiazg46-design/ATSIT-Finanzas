@echo off
echo ==========================================
echo INTENTO 6: DOWNGRADE A NEXT.JS ESTABLE
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
echo Agregando package.json corregido...
call git add .

:: 2. Commit
echo Guardando cambios...
call git commit -m "Fix: Downgrade to Next.js 15.1.3 for stability"

:: 3. Branch
call git branch -M main

:: 4. Push
echo.
echo ==========================================
echo ENVIANDO FIX DE VERSIONES...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Vercel instalara la version CORRECTA esta vez.
echo ==========================================
pause
