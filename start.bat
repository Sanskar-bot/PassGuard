@echo off
setlocal EnableDelayedExpansion

title PassGuard — Password Strength Analyzer
set PORT=5500
set URL=http://localhost:%PORT%
set DIR=%~dp0

echo.
echo   ==========================================
echo     PassGuard - Password Strength Analyzer
echo   ==========================================
echo.

:: ── Try Python 3 first ────────────────────────────────────────────────────
python --version >nul 2>&1
if !ERRORLEVEL! == 0 (
    echo   [*] Starting server with Python 3...
    echo   [*] Opening %URL% in your browser...
    echo   [*] Press Ctrl+C in this window to stop.
    echo.
    :: Open browser after a short delay (start is async)
    start "" "%URL%"
    cd /d "%DIR%"
    python -m http.server %PORT%
    goto :done
)

:: ── Try py launcher (Windows Python launcher) ─────────────────────────────
py --version >nul 2>&1
if !ERRORLEVEL! == 0 (
    echo   [*] Starting server with Python (py launcher)...
    echo   [*] Opening %URL% in your browser...
    echo   [*] Press Ctrl+C in this window to stop.
    echo.
    start "" "%URL%"
    cd /d "%DIR%"
    py -m http.server %PORT%
    goto :done
)

:: ── Try Node.js ────────────────────────────────────────────────────────────
node --version >nul 2>&1
if !ERRORLEVEL! == 0 (
    echo   [*] Starting server with Node.js...
    echo   [*] Opening %URL% in your browser...
    echo   [*] Press Ctrl+C in this window to stop.
    echo.
    :: Give the server 1.5s to start before opening the browser
    ping -n 2 127.0.0.1 >nul
    start "" "%URL%"
    cd /d "%DIR%"
    node server.js %PORT%
    goto :done
)

:: ── Nothing found ─────────────────────────────────────────────────────────
echo   [!] ERROR: Neither Python nor Node.js was found on PATH.
echo.
echo   Please install one of the following:
echo     - Python 3:  https://www.python.org/downloads/
echo     - Node.js:   https://nodejs.org/
echo.
echo   Then re-run this file.
echo.
pause
exit /b 1

:done
endlocal
