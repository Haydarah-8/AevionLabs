# Clone the three Vvveb ecosystem repositories (shallow).
# Run from repo root: pwsh ./integrations/vvveb/clone-vvveb-ecosystem.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $root | Out-Null

$repos = @(
  @{ Name = "vvvebjs"; Url = "https://github.com/givanz/VvvebJs.git" },
  @{ Name = "vvveb-admin"; Url = "https://github.com/givanz/vvveb-admin-template.git" },
  @{ Name = "vvveb-cms"; Url = "https://github.com/givanz/Vvveb.git" }
)

foreach ($repo in $repos) {
  $dest = Join-Path $root $repo.Name
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "Updating $($repo.Name)..."
    Push-Location $dest
    git fetch --depth 1 origin
    git reset --hard origin/HEAD
    Pop-Location
  } else {
    if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
    Write-Host "Cloning $($repo.Name)..."
    git clone --depth 1 $repo.Url $dest
  }
  Push-Location $dest
  $sha = git rev-parse HEAD
  Pop-Location
  Write-Host "  $($repo.Name) @ $sha"
}

Write-Host "Done. See docs/vvveb-analysis.md"
