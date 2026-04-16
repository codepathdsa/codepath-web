# zip-project.ps1
# Creates a clean zip of this project excluding node_modules, .next, and other build artifacts.
# Usage: .\zip-project.ps1
# Optional: .\zip-project.ps1 -OutName "my-backup"

param(
  [string]$OutName = "codepath-web-$(Get-Date -Format 'yyyy-MM-dd_HH-mm')"
)

$root     = $PSScriptRoot
$zipPath  = Join-Path (Split-Path $root -Parent) "$OutName.zip"

$exclude = @(
  'node_modules',
  '.next',
  '.turbo',
  'out',
  'dist',
  '.git'
)

Write-Host "Zipping project -> $zipPath" -ForegroundColor Cyan

# Collect all items, skipping excluded top-level folders
$items = Get-ChildItem -Path $root | Where-Object { $_.Name -notin $exclude }

# Use Compress-Archive on item paths
$paths = $items | ForEach-Object { $_.FullName }

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path $paths -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Done! $zipPath ($sizeMB MB)" -ForegroundColor Green
