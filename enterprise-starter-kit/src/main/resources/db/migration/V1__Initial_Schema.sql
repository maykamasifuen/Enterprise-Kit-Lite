--liquibase formatted sql
-- changeset aek-lite:v1-initial-schema
-- =================================================================
-- Mayk Enterprise Kit Lite — Initial Schema
-- Tables: users, roles, user_roles, companies
-- =================================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);
INSERT INTO roles (name)
VALUES ('USER'),
    ('ADMIN'),
    ('SUPER_ADMIN');
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(5) DEFAULT 'en',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    tenant_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    tax_number VARCHAR(50),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Invoice settings
    invoice_prefix VARCHAR(20) DEFAULT 'INV-',
    next_invoice_number INT DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'USD',
    default_tax_rate DOUBLE PRECISION DEFAULT 0.0,
    payment_terms INT DEFAULT 30,
    default_notes VARCHAR(1000),
    -- Regional settings
    date_format VARCHAR(30) DEFAULT 'yyyy-MM-dd',
    timezone VARCHAR(50) DEFAULT 'UTC',
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);