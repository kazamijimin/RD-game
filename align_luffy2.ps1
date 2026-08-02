Add-Type -AssemblyName System.Drawing
$srcFile = 'C:\Users\balli\.gemini\antigravity\brain\30c67a9b-1633-4569-8cf8-97fd6e14583b\media__1785422573214.png'
$srcImg = [System.Drawing.Bitmap]::new($srcFile)

# Create a clean 1024x1024 image
$destImg = [System.Drawing.Bitmap]::new(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.Clear([System.Drawing.Color]::Transparent)

# The columns in source: 0: Front, 1: Back, 2: Front(dup), 3: Side
$srcCols = @(103, 257, 423, 577)
# We map destination columns to source columns: 0->0, 1->1, 2->3, 3->2
$colMap = @(0, 1, 3, 2)

$srcRows = @(140, 386, 631, 887)

# Box to copy is 150x220 (to avoid overlapping adjacent sprites)
$boxW = 150
$boxH = 220

for ($r = 0; $r -lt 4; $r++) {
    for ($c = 0; $c -lt 4; $c++) {
        $srcColIdx = $colMap[$c]
        $srcCx = $srcCols[$srcColIdx]
        $srcCy = $srcRows[$r]
        
        # Calculate source top-left
        $srcX = $srcCx - ($boxW / 2)
        $srcY = $srcCy - ($boxH / 2)
        
        # Calculate dest top-left (center inside 256x256 cell)
        $destX = ($c * 256) + (128 - ($boxW / 2))
        $destY = ($r * 256) + (128 - ($boxH / 2))
        
        # Copy pixel by pixel to remove background/noise (only A > 50)
        for ($y = 0; $y -lt $boxH; $y++) {
            for ($x = 0; $x -lt $boxW; $x++) {
                $sx = $srcX + $x
                $sy = $srcY + $y
                if ($sx -ge 0 -and $sx -lt $srcImg.Width -and $sy -ge 0 -and $sy -lt $srcImg.Height) {
                    $p = $srcImg.GetPixel($sx, $sy)
                    if ($p.A -gt 50) {
                        $destImg.SetPixel($destX + $x, $destY + $y, $p)
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
