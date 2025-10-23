@echo off
REM ============================================
REM Mayk Enterprise Kit - Quick Setup (Windows)
REM ============================================
echo.
echo ====================================================
echo   Mayk Enterprise Kit - Quick Setup
echo ====================================================
echo.

REM Check if .env already exists
if exist ".env" (
    echo [WARNING] .env file already exists.
    set /p OVERWRITE="Overwrite? (y/N): "
    if /i not "%OVERWRITE%"=="y" (
        echo Keeping existing .env file.
        goto :SKIP_ENV
    )
)

echo Creating .env configuration file...

REM Database Configuration
echo.
echo --- Database Configuration ---
set /p DB_HOST="Database Host [localhost]: " || set DB_HOST=localhost
set /p DB_PORT="Database Port [3306]: " || set DB_PORT=3306
set /p DB_NAME="Database Name [esk]: " || set DB_NAME=esk
set /p DB_USERNAME="Database Username [app]: " || set DB_USERNAME=app
set /p DB_PASSWORD="Database Password [app]: " || set DB_PASSWORD=app

REM Generate JWT Secret (random 64-char base64)
echo.
echo Generating secure JWT secret...
for /f %%i in ('powershell -Command "[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])"') do set JWT_SECRET=%%i


REM Email (optional)
echo.
echo --- Email Configuration (optional, press Enter to skip) ---
set /p MAIL_HOST="SMTP Host [smtp.gmail.com]: " || set MAIL_HOST=smtp.gmail.com
set /p MAIL_PORT="SMTP Port [587]: " || set MAIL_PORT=587
set /p MAIL_USERNAME="SMTP Username []: " || set MAIL_USERNAME=
set /p MAIL_PASSWORD="SMTP Password []: " || set MAIL_PASSWORD=
set /p MAIL_FROM="From Address [noreply@maykamasifuen.com]: " || set MAIL_FROM=noreply@maykamasifuen.com

if "%MAIL_USERNAME%"=="" (
    set MAIL_ENABLED=false
) else (
    set MAIL_ENABLED=true
)

REM Write .env file
(
echo # Mayk Enterprise Kit - Environment Configuration
echo # Generated on %date% %time%
echo.
echo # Spring Profile
echo SPRING_PROFILES_ACTIVE=dev
echo.
echo # Database
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo DB_USERNAME=%DB_USERNAME%
echo DB_PASSWORD=%DB_PASSWORD%
echo.
echo # JWT Security
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRATION=3600
echo.
echo # CORS
echo CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080
echo.
echo.
echo # Email
echo MAIL_ENABLED=%MAIL_ENABLED%
echo MAIL_HOST=%MAIL_HOST%
echo MAIL_PORT=%MAIL_PORT%
echo MAIL_USERNAME=%MAIL_USERNAME%
echo MAIL_PASSWORD=%MAIL_PASSWORD%
echo MAIL_FROM=%MAIL_FROM%
) > .env

echo.
echo [OK] .env file created successfully!

:SKIP_ENV

echo.
echo ====================================================
echo   Setup Complete!
echo ====================================================
echo.
echo Next steps:
echo   1. Make sure MySQL is running on %DB_HOST%:%DB_PORT%
echo   2. Create database: CREATE DATABASE %DB_NAME%;
echo   3. Start backend:
echo      cd enterprise-starter-kit
echo      mvn spring-boot:run
echo   4. Start frontend:
echo      cd enterprise-starter-kit-frontend
echo      npm install
echo      ng serve
echo.
echo Default credentials:
echo   Super Admin: superadmin / superadmin123
echo   Admin:       admin / admin123
echo.
echo Documentation: ./Documentation/
echo.
pause
