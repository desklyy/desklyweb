Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\noehi\.gemini\antigravity-ide\brain\32d41caf-2dda-4eea-8a6c-1748b1b2eb02\.user_uploaded"
$dstDir = "c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations"

$newLogos = @{
    "sage.png" = "media_1790173476970.png"
    "zendesk.png" = "media_1790173510962.png"
    "zoho.png" = "media_1790173542282.png"
    "factusol.png" = "media_1790173572997.png"
    "slack.png" = "media_1790173586814.png"
}

function ProcessNewLogo($srcFile, $dstFile, $convertDarkToWhite = $false, $threshold = 242) {
    $bmp = [System.Drawing.Bitmap]::FromFile($srcFile)
    $w = $bmp.Width
    $h = $bmp.Height

    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            # If near white or already transparent
            if (($c.A -lt 30) -or ($c.R -gt $threshold -and $c.G -gt $threshold -and $c.B -gt $threshold)) {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $pixelColor = $c
                if ($convertDarkToWhite) {
                    $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
                    $minVal = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
                    $diff = $maxVal - $minVal
                    # If very dark / neutral (black/grey text)
                    if ($maxVal -lt 95 -and $diff -lt 35) {
                        $pixelColor = [System.Drawing.Color]::FromArgb($c.A, 245, 247, 252)
                    }
                }
                $outBmp.SetPixel($x, $y, $pixelColor)
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $bmp.Dispose()

    if ($minX -le $maxX -and $minY -le $maxY) {
        $cropW = $maxX - $minX + 1
        $cropH = $maxY - $minY + 1
        $rect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
        $cropped = $outBmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $cropped.Save($dstFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
    } else {
        $outBmp.Save($dstFile, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $outBmp.Dispose()
    Write-Host "Processed $dstFile ($cropW x $cropH)"
}

ProcessNewLogo (Join-Path $srcDir "media_1790173476970.png") (Join-Path $dstDir "sage.png") $false
ProcessNewLogo (Join-Path $srcDir "media_1790173510962.png") (Join-Path $dstDir "zendesk.png") $true
ProcessNewLogo (Join-Path $srcDir "media_1790173542282.png") (Join-Path $dstDir "zoho.png") $true
ProcessNewLogo (Join-Path $srcDir "media_1790173572997.png") (Join-Path $dstDir "factusol.png") $false
ProcessNewLogo (Join-Path $srcDir "media_1790173586814.png") (Join-Path $dstDir "slack.png") $true
