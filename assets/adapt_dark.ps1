Add-Type -AssemblyName System.Drawing

function AdaptDarkThemeText($path) {
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    $w = $bmp.Width
    $h = $bmp.Height
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.A -gt 25) {
                $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
                $minVal = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
                $diff = $maxVal - $minVal

                if ($maxVal -lt 100 -and $diff -lt 35) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 245, 247, 252))
                } elseif ($maxVal -lt 75) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 245, 247, 252))
                } else {
                    $outBmp.SetPixel($x, $y, $c)
                }
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    $bmp.Dispose()
    $tmpPath = $path + '.tmp.png'
    $outBmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Move-Item -Force $tmpPath $path
    Write-Host "Optimized for dark theme: $path"
}

AdaptDarkThemeText 'c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations\holded.png'
AdaptDarkThemeText 'c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations\netsuite.png'
AdaptDarkThemeText 'c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations\dynamics.png'
AdaptDarkThemeText 'c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations\hubspot.png'
