#!/bin/bash
# ============================================
# Mayk Enterprise Kit - Quick Setup (Unix/Mac)
# ============================================

echo ""
echo "===================================================="
echo "  Mayk Enterprise Kit - Quick Setup"
echo "===================================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "[WARNING] .env file already exists."
    read -p "Overwrite? (y/N): " OVERWRITE
    if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
        echo "Keeping existing .env file."
        SKIP_ENV=true
    fi
fi

if [ "$SKIP_ENV" != "true" ]; then
    echo "Creating .env configuration file..."

    # Database Configuration
    echo ""
    echo "--- Database Configuration ---"
    read -p "Database Host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    read -p "Database Port [3306]: " DB_PORT
    DB_PORT=${DB_PORT:-3306}
    read -p "Database Name [esk]: " DB_NAME
    DB_NAME=${DB_NAME:-esk}
    read -p "Database Username [app]: " DB_USERNAME
    DB_USERNAME=${DB_USERNAME:-app}
    read -sp "Database Password [app]: " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-app}
    echo ""

    # Generate JWT Secret
    echo ""
    echo "Generating secure JWT secret..."
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 48)
    else
        JWT_SECRET=$(cat /dev/urandom | tr -dc 'A-Za-z0-9+/' | head -c 64)
    fi


    # Email (optional)
    echo ""
    echo "--- Email Configuration (optional, press Enter to skip) ---"
    read -p "SMTP Host [smtp.gmail.com]: " MAIL_HOST
    MAIL_HOST=${MAIL_HOST:-smtp.gmail.com}
    read -p "SMTP Port [587]: " MAIL_PORT
    MAIL_PORT=${MAIL_PORT:-587}
    read -p "SMTP Username []: " MAIL_USERNAME
    MAIL_USERNAME=${MAIL_USERNAME:-}
    read -sp "SMTP Password []: " MAIL_PASSWORD
    MAIL_PASSWORD=${MAIL_PASSWORD:-}
    echo ""
    read -p "From Address [noreply@maykamasifuen.com]: " MAIL_FROM
    MAIL_FROM=${MAIL_FROM:-noreply@maykamasifuen.com}

    if [ -z "$MAIL_USERNAME" ]; then
        MAIL_ENABLED=false
    else
        MAIL_ENABLED=true
    fi

    # Write .env file
    cat > .env << EOF
# Mayk Enterprise Kit - Environment Configuration
# Generated on $(date)

# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Database
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# JWT Security
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=3600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8080


# Email
MAIL_ENABLED=${MAIL_ENABLED}
MAIL_HOST=${MAIL_HOST}
MAIL_PORT=${MAIL_PORT}
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_FROM=${MAIL_FROM}
EOF

    echo ""
    echo "[OK] .env file created successfully!"
fi

echo ""
echo "===================================================="
echo "  Setup Complete!"
echo "===================================================="
echo ""
echo "Next steps:"
echo "  1. Make sure MySQL is running on ${DB_HOST:-localhost}:${DB_PORT:-3306}"
echo "  2. Create database: CREATE DATABASE ${DB_NAME:-esk};"
echo "  3. Start backend:"
echo "     cd enterprise-starter-kit"
echo "     ./mvnw spring-boot:run"
echo "  4. Start frontend:"
echo "     cd enterprise-starter-kit-frontend"
echo "     npm install"
echo "     ng serve"
echo ""
echo "Default credentials:"
echo "  Super Admin: superadmin / superadmin123"
echo "  Admin:       admin / admin123"
echo ""
echo "Documentation: ./Documentation/"
echo ""
