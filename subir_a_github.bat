@echo off
echo ==========================================
echo INTENTO 24: FIX MASIVO DE REPORTES
echo ==========================================

:: Configurar identidad
call git config user.email "pdiazg46@gmail.com"
call git config user.name "Patricio Díaz"

:: 1. Agregar cambios
call git add .

:: 2. Commit
echo Corrigiendo tipos implicitos en todos los reportes...
call git commit -m "Fix: Mass update to add explicit any types to reports maps filters and reduces"

:: 3. Push
echo.
echo ==========================================
echo ENVIANDO FIX MASIVO...
echo ==========================================
call git push -u origin main

echo.
echo ==========================================
echo PROCESO COMPLETADO
echo He oido tus plegarias. He predecido y corregido. 🔮
echo ==========================================
pause
