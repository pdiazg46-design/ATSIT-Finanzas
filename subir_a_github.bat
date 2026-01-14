@echo off
echo ==========================================
echo INTENTO 23: FIX BUILD ERROR (Tipos en Lista Proyectos)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipos implicitos en pagina de proyectos...
call git commit -m "Fix: Add explicit any types to project list calculations"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Si sale otro error de tipos, invito las cervezas. 🍺
echo ==========================================
pause
