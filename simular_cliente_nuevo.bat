@echo off
title Simular Instalacion de Cliente Nuevo - ATSIT Finanzas
cd /d "%~dp0"

echo ====================================================
echo   SIMULADOR DE INSTALACION LIMPIA PARA CLIENTE NUEVO
echo ====================================================
echo.
echo Cerrando instancias activas de ATSIT Finanzas...
taskkill /F /IM "ATSIT Finanzas.exe" >nul 2>&1
taskkill /F /IM "Control de Proyectos.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo Limpiando datos almacenados en %%APPDATA%%\ATSIT-Finanzas-Data...
if exist "%APPDATA%\ATSIT-Finanzas-Data" (
    rmdir /S /Q "%APPDATA%\ATSIT-Finanzas-Data"
)

echo.
echo ¡Listo! Los datos de tu equipo han sido restablecidos a estado de Fabrica.
echo.
echo Iniciando ATSIT Finanzas Setup como un Cliente Nuevo...
start "" "dist\ATSIT Finanzas Setup 1.0.0.exe"
