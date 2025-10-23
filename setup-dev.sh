#!/bin/bash

# Mayk Enterprise Kit - Development Setup Script
# This script sets up the complete development environment using Docker

set -e

echo "🚀 Mayk Enterprise Kit - Development Setup"
echo "=========================================="

# Check if .env file exists, if not create from example
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again."
    echo "   For development, you can use the default values."
fi

# Load environment variables
set -a
source .env
set +a

echo "📋 Loaded environment configuration"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs

# Build the frontend
echo "🔨 Building frontend..."
cd enterprise-starter-kit-frontend
if command -v npm &> /dev/null; then
    npm install
    npm run build
else
    echo "⚠️  npm not found, using pre-built frontend files"
fi
cd ..

# Start services
echo "🚀 Starting development services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 20

# Check service health
echo "🔍 Checking service health..."
services=("postgres" "backend")
for service in "${services[@]}"; do
    container_name="esk-${service}"
    if docker ps | grep -q "$container_name"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
        echo "Check logs: docker-compose logs $service"
    fi
done

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "  🌐 Frontend: http://localhost:4200"
echo "  🔧 Backend API: http://localhost:8080"
echo "  📚 API Docs: http://localhost:8080/swagger-ui.html"
echo "  🗄️ Database: localhost:5432 (eskuser/eskpass)"
echo ""
echo "🔧 Development Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart backend: docker-compose restart backend"
echo "  Rebuild: docker-compose up --build"
echo ""
echo "💻 For local development:"
echo "  Backend: ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
echo "  Frontend: cd enterprise-starter-kit-frontend && npm start"
echo ""
echo "📝 Next steps:"
echo "  1. Visit http://localhost:4200 to see the application"
echo "  2. Check API docs at http://localhost:8080/swagger-ui.html"
echo ""
echo "🐛 Troubleshooting:"
echo "  If services fail to start, check: docker-compose ps"
echo "  View detailed logs: docker-compose logs [service-name]"
