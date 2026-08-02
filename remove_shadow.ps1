Add-Type -AssemblyName System.Drawing
$file = 'C:\Users\balli\Desktop\RD-game\apps\games\game-one\src\assets\game\characters\learner\luffy-walk.png'
$img = [System.Drawing.Bitmap]::new($file)

$destImg = [System.Drawing.Bitmap]::new(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.Clear([System.Drawing.Color]::Transparent)

for ($y = 0; $y -lt 1024; $y++) {
    $cellY = $y % 256
    for ($x = 0; $x -lt 1024; $x++) {
        $p = $img.GetPixel($x, $y)
        if ($p.A -gt 0) {
            # Check if it's a shadow pixel
            $isShadow = $false
            if ($cellY -gt 190) {
                # Gray check: R, G, B are similar and not too dark/bright
                $diffRG = [Math]::Abs($p.R - $p.G)
                $diffRB = [Math]::Abs($p.R - $p.B)
                $diffGB = [Math]::Abs($p.G - $p.B)
                if ($diffRG -lt 20 -and $diffRB -lt 20 -and $diffGB -lt 20) {
                    # mostly colorless
                    if ($p.R -gt 80 -and $p.R -lt 220) {
                        $isShadow = $true
                    }
                }
            }
            if (-not $isShadow) {
                $destImg.SetPixel($x, $y, $p)
            }
        }
    }
}

$img.Dispose()
$destImg.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
$destImg.Dispose()
