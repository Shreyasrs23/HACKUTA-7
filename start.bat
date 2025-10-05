@echo off
echo Starting CivicScribe Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python main.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Application is starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
