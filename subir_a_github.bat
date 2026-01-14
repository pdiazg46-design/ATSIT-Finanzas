@echo off
echo ==========================================
echo INTENTO 15: FIX BUILD ERROR (React 18 & TS)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo hooks de React y tipos Typescript...
call git commit -m "Fix: Replace useActionState with useFormState and fix implicit any type"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO CORRECCION...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora si deberia compilar sin warnings.
echo ==========================================
pause
