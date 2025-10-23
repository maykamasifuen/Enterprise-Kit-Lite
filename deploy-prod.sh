#!/bin/bash

# Mayk Enterprise Kit - Production Deployment Script
# This script sets up the complete production environment using Docker

set -e

echo "🚀 Mayk Enterprise Kit - Production Deployment"
echo "=============================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

echo "📋 Loaded environment configuration"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p nginx/certs
mkdir -p backups
mkdir -p logs

# Build the frontend
echo "🔨 Building frontend..."
cd enterprise-starter-kit-frontend
if command -v npm &> /dev/null; then
    npm install
    npm run build --prod
else
    echo "⚠️  npm not found, skipping frontend build. Make sure dist/ contains built files."
fi
cd ..

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Start services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("postgres" "redis" "backend" "nginx")
for service in "${services[@]}"; do
    container_name="esk-${service}-prod"
    if docker ps | grep -q "$container_name"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
        exit 1
    fi
done

# Run database migrations
echo "🗄️ Running database migrations..."
docker exec esk-backend-prod ./wait-for-it.sh postgres:5432 -- java -jar app.jar --spring.profiles.active=prod --spring.liquibase.enabled=true

echo ""
echo "🎉 Production deployment completed successfully!"
echo ""
echo "📊 Service Status:"
echo "  🌐 Frontend: https://yourdomain.com"
echo "  🔧 Backend API: http://localhost:8080"
echo "  📚 API Docs: http://localhost:8080/swagger-ui.html"
echo "  🗄️ Database: localhost:5432"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  Backup DB: docker exec esk-postgres-prod pg_dump -U \$DB_USERNAME \$DB_NAME > backup.sql"
echo ""
echo "⚠️  Remember to:"
echo "  - Configure SSL certificates in nginx/certs/"
echo "  - Update DNS to point to your server"
echo "  - Set up monitoring and alerts"
echo "  - Configure backup automation"
echo ""
echo "📞 Support: Check logs with 'docker-compose -f docker-compose.prod.yml logs backend'"
