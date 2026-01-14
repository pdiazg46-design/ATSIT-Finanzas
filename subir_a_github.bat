@echo off
echo ==========================================
echo INTENTO 3: SUBIENDO CORRECCIONES A GITHUB
echo ==========================================

:: Configurar identidad por si acaso
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios nuevos (package.json)
echo Agregando archivos modificados...
call git add .

:: 2. Guardar los cambios (Commit)
echo Creando paquete de correccion...
call git commit -m "Eliminando better-sqlite3 incompatible"

:: 3. Asegurar rama main
call git branch -M main

:: 4. Conectar remoto (Si da error "ya existe", es normal e ignoramos)
call git remote add origin https://github.com/pdiazg46-design/Tangente-app.git 2>NUL

:: 5. Subir a la nube
echo.
echo ==========================================
echo ENVIANDO A LA NUBE...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo Ahora revisa Vercel. Deberias ver "Eliminando better-sqlite3 incompatible"
echo ==========================================
pause
