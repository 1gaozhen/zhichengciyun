$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$dir = 'c:\Users\gaozhen\Desktop\小瓷\test_output'
$files = Get-ChildItem -Path $dir -Filter '*.png' | Sort-Object Name
$report = @()
foreach ($f in $files) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $bmp = New-Object System.Drawing.Bitmap($img)
    $w = $bmp.Width; $h = $bmp.Height
    $total = $w * $h
    $bluePx = 0; $whitePx = 0; $otherColorPx = 0; $darkPx = 0; $goldOrBrownPx = 0
    # 采样：步长 8 加速（每 8x8 像素取 1 个）
    $sampled = 0
    for ($y = 0; $y -lt $h; $y += 8) {
        for ($x = 0; $x -lt $w; $x += 8) {
            $c = $bmp.GetPixel($x, $y)
            $sampled++
            $r = [int]$c.R; $g = [int]$c.G; $b = [int]$c.B
            $maxC = [Math]::Max($r, [Math]::Max($g, $b))
            $minC = [Math]::Min($r, [Math]::Min($g, $b))
            $isWhite = ($r -ge 230 -and $g -ge 230 -and $b -ge 230)
            $isBlue = ($b -gt $r + 20 -and $b -gt $g + 10 -and $b -gt 80)
            $isGoldOrBrown = (($r -gt $g + 30 -and $r -gt $b + 50) -or ($r -gt 150 -and $g -gt 80 -and $g -lt 180 -and $b -lt 100))
            if ($isWhite) { $whitePx++ }
            elseif ($isBlue) { $bluePx++ }
            elseif ($isGoldOrBrown) { $goldOrBrownPx++ }
            elseif ($maxC -lt 60) { $darkPx++ }
            else { $otherColorPx++ }
        }
    }
    $img.Dispose(); $bmp.Dispose()
    $report += [PSCustomObject]@{
        File = $f.Name
        Size = "${w}x${h}"
        White = [Math]::Round($whitePx / $sampled * 100, 1)
        Blue = [Math]::Round($bluePx / $sampled * 100, 1)
        Gold_Brown = [Math]::Round($goldOrBrownPx / $sampled * 100, 1)
        Dark = [Math]::Round($darkPx / $sampled * 100, 1)
        Other = [Math]::Round($otherColorPx / $sampled * 100, 1)
        Pass_QingHua = if ($whitePx + $bluePx -ge $sampled * 0.85) { 'YES' } else { 'NO' }
    }
}
$report | Format-Table -AutoSize
Write-Host ''
Write-Host '评判标准（青花瓷）:'
Write-Host '  - 色彩对版: White + Blue >= 85% (Pass_QingHua=YES)'
Write-Host '  - 金色赭色破防: Gold_Brown 应 < 5%'
Write-Host '  - 其他杂色: Other 应 < 10%'
