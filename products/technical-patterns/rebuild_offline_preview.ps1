#Requires -Version 5.1
# Rebuild offline (file://) technical pattern preview after editing SVGs.
Set-StrictMode -Version 2
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$manifest=[System.IO.File]::ReadAllText((Join-Path $root 'patterns.json'),[System.Text.Encoding]::UTF8) | ConvertFrom-Json
$svgs=@{}
foreach($pattern in $manifest.templates){
  foreach($view in $pattern.views){
    $relative=[string]$view.file
    if ($relative -notmatch '^svg/[a-z0-9_-]+\.svg$') {throw "Invalid SVG filename in manifest: $relative"}
    $svg=Join-Path $root $relative
    if (-not (Test-Path $svg -PathType Leaf)) {throw "Missing SVG: $relative"}
    $svgs[$relative]=[System.IO.File]::ReadAllText($svg,[System.Text.Encoding]::UTF8)
  }
}
$json=(ConvertTo-Json -InputObject @{manifest=$manifest;svgs=$svgs} -Depth 70 -Compress).Replace('<','\u003c')
$utf8=New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $root 'patterns-fallback.js'),"window.CircleLinePatternFallback=$json;`n",$utf8)
Write-Host "Updated offline preview for $($svgs.Count) SVG files." -ForegroundColor Green
