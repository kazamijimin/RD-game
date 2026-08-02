Add-Type -AssemblyName System.Drawing
$srcFile = 'C:\Users\balli\.gemini\antigravity\brain\30c67a9b-1633-4569-8cf8-97fd6e14583b\media__1785422573214.png'
$srcImg = [System.Drawing.Bitmap]::new($srcFile)

# Create a clean 1024x1024 image
$destImg = [System.Drawing.Bitmap]::new(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.Clear([System.Drawing.Color]::Transparent)

# The columns in source: ~31-175 (center 103), ~185-329 (center 257), ~352-495 (center 423), ~505-650 (center 577)
# The rows in source: ~37-244 (center 140), ~282-490 (center 386), ~528-735 (center 631), ~784-991 (center 887)
$srcCols = @(103, 257, 423, 577)
$srcRows = @(140, 386, 631, 887)

# We want 4x4 grid in 1024x1024. Each cell is 256x256. Center is at 128, 128.
for ($r = 0; $r -lt 4; $r++) {
    for ($c = 0; $c -lt 4; $c++) {
        $srcCx = $srcCols[$c]
        $srcCy = $srcRows[$r]
        # Box to copy is 256x256 around the center
        $srcRect = [System.Drawing.Rectangle]::new($srcCx - 128, $srcCy - 128, 256, 256)
        $destRect = [System.Drawing.Rectangle]::new($c * 256, $r * 256, 256, 256)
        
        # Only copy pixels with high alpha to remove noise? No, let's just copy the rectangle.
        # Wait, noise was mentioned, let's manually copy pixels to filter out low-alpha noise.
        for ($y = 0; $y -lt 256; $y++) {
            for ($x = 0; $x -lt 256; $x++) {
                $sx = $srcCx - 128 + $x
                $sy = $srcCy - 128 + $y
                if ($sx -ge 0 -and $sx -lt $srcImg.Width -and $sy -ge 0 -and $sy -lt $srcImg.Height) {
                    $p = $srcImg.GetPixel($sx, $sy)
                    if ($p.A -gt 50) { # filter out noise
                        $destImg.SetPixel($destRect.X + $x, $destRect.Y + $y, $p)
                    }
                }
            }
        }
    }
}

$destFile = 'C:\Users\balli\Desktop\RD-game\apps\games\game-one\src\assets\game\characters\learner\luffy-walk.png'
$destImg.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
$destImg.Dispose()
$srcImg.Dispose()
