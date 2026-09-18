@echo off
title Badminton Expense Manager
echo ===================================================
echo     ?? KHOI DONG HE THONG QUAN LY CAU LONG
echo ===================================================

:: Ensure paths
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\tools\maven\apache-maven-3.9.6\bin;C:\Program Files\nodejs;C:\Program Files\MySQL\MySQL Server 8.4\bin;%PATH%"

:: 1. Start MySQL if not running
echo [1/3] Kiem tra MySQL...
netstat -ano | findstr 3306 >nul
if %errorlevel% neq 0 (
    echo Khoi dong MySQL Server...
    start /B "" "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --datadir="E:\Project\mysql-data" --port=3306
    timeout /t 3 >nul
) else (
    echo MySQL da san sang!
)

:: 2. Start Backend
echo [2/3] Khoi dong Backend Spring Boot (Port 8080)...
start "Badminton Backend" cmd /k "cd /d E:\Project\backend && mvn spring-boot:run"

:: 3. Start Frontend
echo [3/3] Khoi dong Frontend React + Vite (Port 5173)...
start "Badminton Frontend" cmd /k "cd /d E:\Project\frontend && npm run dev"

timeout /t 5 >nul
start http://localhost:5173

echo.
echo ===================================================
echo     ? HE THONG DA KHOI DONG THANH CONG!
echo     Frontend: http://localhost:5173
echo     Backend:  http://localhost:8080
echo ===================================================
pause