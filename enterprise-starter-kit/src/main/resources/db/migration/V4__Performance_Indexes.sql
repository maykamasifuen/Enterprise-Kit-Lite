--liquibase formatted sql
-- changeset aek-lite:v4-performance-indexes
-- =================================================================
-- Performance indexes for common query patterns
-- =================================================================
CREATE INDEX idx_invoices_tenant_status ON invoices (tenant_id, status);
CREATE INDEX idx_invoices_tenant_date ON invoices (tenant_id, invoice_date);
CREATE INDEX idx_customers_tenant ON customers (tenant_id);
CREATE INDEX idx_catalog_tenant ON catalog_items (tenant_id);
CREATE INDEX idx_refresh_username ON refresh_tokens (username);