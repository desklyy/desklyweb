Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\noehi\.gemini\antigravity-ide\brain\32d41caf-2dda-4eea-8a6c-1748b1b2eb02\.user_uploaded"
$dstDir = "c:\Users\noehi\OneDrive\Escritorio\desklyweb\assets\integrations"

if (!(Test-Path $dstDir)) {
    New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
}

$mapping = @{
    "sap.png" = "media_1790173004977.png"
    "salesforce.png" = "media_1790173025013.png"
    "dynamics.png" = "media_1790173049251.png"
    "odoo.png" = "media_1790173065551.png"
    "hubspot.png" = "media_1790173089567.png"
    "netsuite.png" = "media_1790173199209.png"
    "microsoft.png" = "media_1790173253891.png"
    "google.png" = "media_1790173282764.png"
    "holded.png" = "media_1790173298904.png"
    "outlook.png" = "media_1790173378848.png"
}

function MakeTransparentAndCrop($srcFile, $dstFile, $threshold = 245) {
    $bmp = [System.Drawing.Bitmap]::FromFile($srcFile)
    $w = $bmp.Width
    $h = $bmp.Height

    # Check bounds of non-white / non-transparent pixels
    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0

    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            # If pixel is near white (R>threshold and G>threshold and B>threshold) or transparent
            if (($c.A -lt 30) -or ($c.R -gt $threshold -and $c.G -gt $threshold -and $c.B -gt $threshold)) {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                # Keep color with full or existing alpha
                $outBmp.SetPixel($x, $y, $c)
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $bmp.Dispose()

    # If valid bounding box found, crop to it with small padding
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

foreach ($key in $mapping.Keys) {
    $src = Join-Path $srcDir $mapping[$key]
    $dst = Join-Path $dstDir $key
    MakeTransparentAndCrop $src $dst 242
}
