--liquibase formatted sql
-- changeset aek-lite:v2-business-tables
-- =================================================================
-- Business tables: invoices, customers, catalog_items
-- =================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    customer_id BIGINT,
    amount DECIMAL(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invoice_date DATE NOT NULL,
    due_date DATE,
    tax_rate DECIMAL(5, 2),
    tax_amount DECIMAL(19, 2),
    tenant_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(500),
    tax_number VARCHAR(50),
    contact_person VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);
ALTER TABLE invoices
ADD CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
CREATE TABLE IF NOT EXISTS catalog_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    unit_price DECIMAL(19, 2) NOT NULL,
    unit VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);