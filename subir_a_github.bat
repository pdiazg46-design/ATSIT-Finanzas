@echo off
echo ==========================================
echo FIX: PERMISOS DE ADMIN
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo script de Seed para asignar PERMISOS de verdad...
call git commit -m "Fix: Seed script now enforces permissions for admin user (insert/update)"

:: 3. Push
echo.
echo ==========================================
echo SUBIENDO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO.
echo ==========================================
pause
