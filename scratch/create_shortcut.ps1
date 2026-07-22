$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$ShortcutPath = Join-Path $DesktopPath "ATSIT Finanzas.lnk"
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas\iniciar_app.bat"
$Shortcut.WorkingDirectory = "c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas"
$Shortcut.IconLocation = "c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas\public\brand\icon.ico"
$Shortcut.Description = "ATSIT Finanzas - Aplicación de Control Financiero"
$Shortcut.Save()
Write-Host "Acceso directo creado correctamente en el Escritorio: $ShortcutPath"
