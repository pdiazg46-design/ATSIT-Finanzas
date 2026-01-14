@echo off
echo Instalando librerias de Autenticacion...
cd /d "%~dp0"
call npm install next-auth@beta bcryptjs
call npm install -D @types/bcryptjs
echo.
echo ==========================================
echo Instalacion completada exitosamente.
echo Puede cerrar esta ventana.
echo ==========================================
pause
