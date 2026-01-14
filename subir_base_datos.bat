@echo off
echo Sincronizando la Base de Datos con la Nube (Turso)...
echo Asegurate de haber puesto la URL y el TOKEN en el archivo .env primero.
echo.
pause
call npx drizzle-kit push
echo.
echo ==========================================
echo Sincronizacion completada.
echo Ahora la base de datos en la nube tiene tus tablas.
echo ==========================================
pause
