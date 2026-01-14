@echo off
echo ==========================================
echo INTENTO 27: FIX UI GIGANTE (VIEWPORT)
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Agregando viewport para arreglar escala UI...
call git commit -m "Fix: Add viewport configuration to RootLayout to fix scaling issues"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX VIEWPORT...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora deberia verse normal en el celular y en escritorio. 📱💻
echo ==========================================
pause
