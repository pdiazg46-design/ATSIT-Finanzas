@echo off
echo ==========================================
echo INTENTO 54: FORZAR RECONSTRUCCION
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Forzando recompilacion limpia en Vercel...
call git commit -m "Chore: Force Vercel rebuild to pick up new API routes"

:: 3. Push
echo.
echo ==========================================
echo LIMPIANDO CAÑERIAS...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Espera unos 3 minutos a que Vercel termine.
echo ==========================================
pause
