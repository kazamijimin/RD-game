Add-Type -AssemblyName System.Drawing
$srcFile = 'C:\Users\balli\Desktop\RD-game\apps\games\game-one\src\assets\game\characters\learner\frieren-walk.png'
$srcImg = [System.Drawing.Bitmap]::new($srcFile)
$destImg = [System.Drawing.Bitmap]::new(600, 600)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.Clear([System.Drawing.Color]::Transparent)

# Row 0: source y=20..170, dest y=0..150
$srcRect0 = [System.Drawing.Rectangle]::new(0, 20, 600, 150)
$destRect0 = [System.Drawing.Rectangle]::new(0, 0, 600, 150)
$g.DrawImage($srcImg, $destRect0, $srcRect0, [System.Drawing.GraphicsUnit]::Pixel)

# Row 1: source y=192..342, dest y=150..300
$srcRect1 = [System.Drawing.Rectangle]::new(0, 192, 600, 150)
$destRect1 = [System.Drawing.Rectangle]::new(0, 150, 600, 150)
$g.DrawImage($srcImg, $destRect1, $srcRect1, [System.Drawing.GraphicsUnit]::Pixel)

# Row 2: source y=355..505, dest y=300..450
$srcRect2 = [System.Drawing.Rectangle]::new(0, 355, 600, 150)
$destRect2 = [System.Drawing.Rectangle]::new(0, 300, 600, 150)
$g.DrawImage($srcImg, $destRect2, $srcRect2, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$srcImg.Dispose()
$destFile = 'C:\Users\balli\Desktop\RD-game\apps\games\game-one\src\assets\game\characters\learner\frieren-walk-fixed.png'
$destImg.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
$destImg.Dispose()
Remove-Item $srcFile -Force
Rename-Item $destFile -NewName 'frieren-walk.png'
