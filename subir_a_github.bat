@echo off
echo ==========================================
echo INTENTO 72: FIX TYPESCRIPT
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipo de variable error para satisfacer a TypeScript...
call git commit -m "Fix: Type error in Settings page (unknown not assignable to ReactNode)"

:: 3. Push
echo.
echo ==========================================
echo SI ESTO NO FUNCIONA, LE PEGO A LA PANTALLA
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
