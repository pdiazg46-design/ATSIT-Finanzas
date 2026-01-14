@echo off
echo ==========================================
echo INTENTO 4: FIX BUILD TIME ERROR
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
echo Agregando archivos modificados...
call git add .

:: 2. Commit
echo Guardando cambios...
call git commit -m "Fix: Force dynamic rendering to avoid build DB connection"

:: 3. Branch
call git branch -M main

:: 4. Remote (ignorando error si existe)
call git remote add origin https://github.com/pdiazg46-design/Tangente-app.git 2>NUL

:: 5. Push
echo.
echo ==========================================
echo ENVIANDO FIX A LA NUBE...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Revisa Vercel. Deberia funcionar ahora.
echo ==========================================
pause
