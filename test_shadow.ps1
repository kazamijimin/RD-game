Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::new('C:\Users\balli\Desktop\RD-game\apps\games\game-one\src\assets\game\characters\learner\luffy-walk.png')

$maxY = 0
for ($y = 255; $y -ge 0; $y--) {
    $hasPixel = $false
    for ($x = 0; $x -lt 256; $x++) {
        $p = $img.GetPixel($x, $y)
        if ($p.A -gt 0) {
            $hasPixel = $true
            break
        }
    }
    if ($hasPixel) {
        $maxY = $y
        break
    }
}
Write-Host "Max Y in cell 0,0 is $maxY"

for ($y = $maxY; $y -ge $maxY - 8; $y--) {
    for ($x = 0; $x -lt 256; $x++) {
        $p = $img.GetPixel($x, $y)
        if ($p.A -gt 0) {
            Write-Host "Y=$y X=$x A=$($p.A) R=$($p.R) G=$($p.G) B=$($p.B)"
        }
    }
}
$img.Dispose()
