$ErrorActionPreference = "Stop"

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillFolders = Get-ChildItem -Path $packageRoot -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "SKILL.md")
}

if (-not $skillFolders) {
    Write-Host "No skill folders with SKILL.md were found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creative Intelligence Skills Library installer" -ForegroundColor Cyan
Write-Host "1. Install globally (all Antigravity workspaces)"
Write-Host "2. Install into a workspace (current project)"
Write-Host "3. Install both"
$choice = Read-Host "Choose 1, 2, or 3"

$targets = @()
if ($choice -eq "1" -or $choice -eq "3") {
    $targets += Join-Path $HOME ".gemini\config\skills"
}
if ($choice -eq "2" -or $choice -eq "3") {
    $workspace = Read-Host "Enter the full path to the project/workspace root"
    if ([string]::IsNullOrWhiteSpace($workspace) -or -not (Test-Path $workspace -PathType Container)) {
        Write-Host "Workspace path does not exist. Nothing installed to workspace." -ForegroundColor Yellow
    } else {
        $targets += Join-Path $workspace ".agents\skills"
    }
}
if ($targets.Count -eq 0) {
    Write-Host "No valid installation target selected." -ForegroundColor Yellow
    exit 1
}

foreach ($target in $targets) {
    New-Item -ItemType Directory -Force -Path $target | Out-Null
    Write-Host "`nTarget: $target" -ForegroundColor Cyan
    foreach ($folder in $skillFolders) {
        $destination = Join-Path $target $folder.Name
        if (Test-Path $destination) {
            Write-Host "SKIP (already exists; not overwritten): $($folder.Name)" -ForegroundColor Yellow
            continue
        }
        Copy-Item -Path $folder.FullName -Destination $destination -Recurse
        Write-Host "INSTALLED: $($folder.Name)" -ForegroundColor Green
    }
}
Write-Host "`nInstallation copy step complete." -ForegroundColor Green
Write-Host "Open Antigravity's Skills/Customizations view to verify discovery."
Write-Host "If newly added skills do not appear, restart Antigravity or start a new conversation."
