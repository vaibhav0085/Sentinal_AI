@echo off
echo ==========================================
echo      Starting Sentinel AI System
echo ==========================================
echo.
echo [1/2] Launching Backend Server...
cd backend
start "Sentinel AI Server" python app.py

echo [2/2] Opening Dashboard...
timeout /t 3 >nul
start http://localhost:5001/index.html

echo.
echo Success! The system is now running.
echo Please keep the backend server window open.
echo.
pause
