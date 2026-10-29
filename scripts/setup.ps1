# Windows PowerShell Setup Script
Write-Host "Setting up RKV NEXUS AI development environment..." -ForegroundColor Cyan

If (-Not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Setting up server virtual environment..." -ForegroundColor Cyan
Set-Location server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Set-Location ..

Write-Host "Setting up client packages..." -ForegroundColor Cyan
Set-Location client
npm install
Set-Location ..

Write-Host "Setup complete!" -ForegroundColor Green
