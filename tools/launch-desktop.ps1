# Royal Cinema ERP - Desktop Launcher Script
# Launches the canonical Electron Desktop Application from legacy-desktop/electron-app/

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DesktopDir = Join-Path $ProjectRoot "legacy-desktop\electron-app"
$DesktopExe = Join-Path $DesktopDir "Royal Cinema ERP.exe"
$ServerScript = Join-Path $DesktopDir "resources\app\server.cjs"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Royal Cinema ERP - Desktop Application Launcher " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Root: $ProjectRoot"
Write-Host "Desktop Location: $DesktopDir"

if (Test-Path $DesktopExe) {
    Write-Host "Launching Electron Desktop Application..." -ForegroundColor Green
    Start-Process -FilePath $DesktopExe -WorkingDirectory $DesktopDir
} else {
    Write-Host "Starting Embedded Desktop Server on http://localhost:3000..." -ForegroundColor Yellow
    node $ServerScript
}
