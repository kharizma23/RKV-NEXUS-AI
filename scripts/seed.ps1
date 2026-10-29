# Windows PowerShell Seed Script
Write-Host "Seeding database with development data..." -ForegroundColor Cyan
Set-Location server
.\.venv\Scripts\python.exe -m app.database.seed
Set-Location ..
Write-Host "Seeding complete!" -ForegroundColor Green
