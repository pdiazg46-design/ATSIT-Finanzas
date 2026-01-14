@echo off
echo ==========================================
echo INTENTO 44: FIX LOGOUT
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Arreglando boton cerrar sesion...
call git commit -m "Fix: Logout button not working"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO SOLUCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Ahora el boton Cerrar Sesion funcionara.
echo ==========================================
pause
