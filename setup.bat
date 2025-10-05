@echo off
echo Setting up CivicScribe Application...
echo.

echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Set up your Supabase database with the provided SQL schema
echo 2. Configure your Auth0 application
echo 3. Update the environment variables in backend/.env and frontend/.env.local
echo 4. Run start.bat to start the application
echo.
pause
