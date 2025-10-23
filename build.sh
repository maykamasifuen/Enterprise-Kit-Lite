#!/bin/bash
# ============================================
# Mayk Enterprise Kit v4.0 - Build Script
# ============================================
# Complete build process for Docker deployment

set -e

echo "================================"
echo "Mayk Enterprise Kit v4.0 Build"
echo "================================"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed."; exit 1; }

# Get version from pom.xml
VERSION=$(grep '<version>' enterprise-starter-kit/pom.xml | head -1 | sed -E 's/.*<version>(.*)<\/version>.*/\1/')
echo "Building version: $VERSION"
echo ""

# Build Docker image
echo "📦 Building Docker image..."
docker build -t mayk-enterprise-kit:$VERSION .
docker tag mayk-enterprise-kit:$VERSION mayk-enterprise-kit:latest

echo "✅ Docker image built successfully"
echo ""

# Display available tags
echo "Available images:"
docker images | grep mayk-enterprise-kit

echo ""
echo "🎉 Build complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Check logs: docker-compose -f docker-compose.prod.yml logs -f backend"
echo ""

