@echo off
echo ==========================================
echo INTENTO 36: PROTOCOLO HTTPS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Cambiando protocolo de conexion a HTTPS para compatibilidad Vercel...
call git commit -m "Fix: Force HTTPS protocol for Turso connection in production"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO AJUSTE DE PROTOCOLO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Esto deberia solucionar el 'Failed query'.
echo ==========================================
pause
