@echo off
title PackAI - BioPack AI Platform
color 0A

echo ============================================
echo       BioPack AI - Starting Servers
echo ============================================
echo.

:: Start Backend (FastAPI + Uvicorn) in a new window
echo [1/2] Starting Backend (FastAPI) on http://localhost:8000 ...
start "PackAI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

:: Brief pause to let the backend initialize first
timeout /t 3 /nobreak >nul

:: Start Frontend (Next.js) in a new window
echo [2/2] Starting Frontend (Next.js) on http://localhost:3000 ...
start "PackAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo.
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Frontend : http://localhost:3000
echo ============================================
echo.
echo Close the individual terminal windows to stop each server.
echo Press any key to exit this launcher...
pause >nul
