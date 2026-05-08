@echo off
echo ============================================
echo   SpeakUp - English Speaking Practice Platform
echo ============================================
echo.
echo Starting services...
echo.

:: Start Backend
echo [1/2] Starting Backend (Port 4000)...
start "SpeakUp Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Start Frontend  
echo [2/2] Starting Frontend (Port 3000)...
start "SpeakUp Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo   Services starting...
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo   Health:   http://localhost:4000/health
echo ============================================
echo.
echo Demo Accounts:
echo   Admin:   admin@speakup.app / Admin@123
echo   Learner: learner@speakup.app / Learner@123
echo.
pause
