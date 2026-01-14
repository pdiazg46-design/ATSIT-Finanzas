@echo off
echo ==========================================
echo INTENTO 10: FIX CONFIGURACION (TS - MJS)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Eliminar archivo incompatible
echo Eliminando next.config.ts...
if exist next.config.ts del next.config.ts

:: 2. Agregar cambios (incluye el nuevo next.config.mjs y el borrado)
call git add .

:: 3. Commit
echo Guardando cambio de formato de configuracion...
call git commit -m "Fix: Replace next.config.ts with next.config.mjs"

:: 4. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION DE CONFIG...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Vercel ahora si deberia estar feliz.
echo ==========================================
pause
