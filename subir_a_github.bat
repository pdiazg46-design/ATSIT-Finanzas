@echo off
echo ==========================================
echo INTENTO 7: LIMPIEZA TOTAL DE DEPENDENCIAS
echo ==========================================

:: Configurar identidad (por seguridad)
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Borrar el archivo que causa conflictos
echo Eliminando package-lock.json antiguo...
del package-lock.json

:: 2. Agregar cambios
call git add .

:: 3. Commit
echo Guardando cambios...
call git commit -m "Fix: Remove package-lock to force clean install"

:: 4. Push
echo.
echo ==========================================
echo ENVIANDO LIMPIEZA...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Vercel ahora instalara todo desde cero.
echo ==========================================
pause
