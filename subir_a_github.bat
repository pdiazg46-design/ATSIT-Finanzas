@echo off
echo ==========================================
echo INTENTO 5: CORRECCION DE TIPO DE ID
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
echo Agregando archivos modificados...
call git add .

:: 2. Commit
echo Guardando cambios...
call git commit -m "Fix: Convert user ID to string for NextAuth"

:: 3. Branch
call git branch -M main

:: 4. Remote (ignorando error si existe)
call git remote add origin https://github.com/pdiazg46-design/Tangente-app.git 2>NUL

:: 5. Push
echo.
echo ==========================================
echo ENVIANDO FIX FINAL A LA NUBE...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Este error era de TIPOS (TypeScript). Ahora deberia compilar bien.
echo ==========================================
pause
