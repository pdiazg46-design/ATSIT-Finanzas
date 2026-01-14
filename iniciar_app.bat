@echo off
echo Iniciando ATSIT Finance...
cd /d "%~dp0"
start http://localhost:3000
npm run dev
