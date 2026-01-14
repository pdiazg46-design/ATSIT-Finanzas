@echo off
echo ==========================================
echo INTENTO 43: GESTION DE USUARIOS
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando panel de usuarios y permisos...
call git commit -m "Feat: User Management System and Role Permissions"

:: 3. Push
echo.
echo ==========================================
echo SUBIENDO CAMBIOS...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo LISTO. Ve a Configuracion para crear usuarios.
echo ==========================================
pause
