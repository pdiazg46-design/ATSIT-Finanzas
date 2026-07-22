Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas\public\brand\logo-full.png"
$src = [System.Drawing.Image]::FromFile($imgPath)
$newWidth = 600
$newHeight = [math]::Round($src.Height * ($newWidth / $src.Width))
$bmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, $newWidth, $newHeight)
$g.Dispose()
$src.Dispose()
$bmp.Save("c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas\public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("c:\Users\pdiaz\Desarrollos\ATSIT-Finanzas\public\logo-pdf.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Successfully resized ATSIT logo"
