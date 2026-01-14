@echo off
echo ==========================================
echo Configurando e Iniciando subida a GitHub
echo ==========================================

:: Iniciamos Git (si no estaba iniciado)
call git init

:: Configuramos tu identidad (SOLUCION AL ERROR ANTERIOR)
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: Agregamos todos los archivos
call git add .

:: Hacemos el "paquete" (Commit)
call git commit -m "Primera subida desde Tangente App"

:: Configuramos la rama principal
call git branch -M main

:: Conectamos con tu repositorio
call git remote remove origin
call git remote add origin https://github.com/pdiazg46-design/Tangente-app.git

echo.
echo ==========================================
echo SUBIENDO ARCHIVOS...
echo (Si aparece una ventana pidiendo usuario/clave, ingresalos)
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO FINALIZADO
echo Si dice "Success" o ves porcentajes de carga, ¡lo logramos!
echo ==========================================
pause
