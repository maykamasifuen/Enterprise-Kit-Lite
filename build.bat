@echo off
REM ============================================
REM Mayk Enterprise Kit v4.0 - Build Script
REM ============================================
REM Complete build process for Docker deployment

echo.
echo ================================
echo Mayk Enterprise Kit v4.0 Build
echo ================================
echo.

REM Check prerequisites
echo Checking prerequisites...
docker --version >nul 2>&1 || (
    echo Docker is required but not installed.
    exit /b 1
)
docker-compose --version >nul 2>&1 || (
    echo Docker Compose is required but not installed.
    exit /b 1
)

REM Build Docker image
echo.
echo Building Docker image...
docker build -t mayk-enterprise-kit:4.0.0 .
docker tag mayk-enterprise-kit:4.0.0 mayk-enterprise-kit:latest

echo.
echo Docker image built successfully!
echo.

REM Display available tags
echo Available images:
docker images | findstr mayk-enterprise-kit

echo.
echo Next steps:
echo 1. Update .env with your configuration
echo 2. Run: docker-compose -f docker-compose.prod.yml up -d
echo 3. Check logs: docker-compose -f docker-compose.prod.yml logs -f backend
echo.

