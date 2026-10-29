@echo off
echo Starting RKV NEXUS AI Platform...

start "FastAPI Backend (Port 8000)" cmd /k "cd /d %~dp0server && .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start "Next.js Frontend (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo Platform is launching!
echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:3000/admin/dashboard
echo ========================================================
timeout /t 5
start http://localhost:3000/admin/dashboard

