--liquibase formatted sql
-- changeset aek-lite:v6-add-missing-customer-columns
-- =================================================================
-- Add missing columns to the customers table:
-- city, country, and notes are defined in the Customer entity
-- but were not included in the original V2 DDL.
-- =================================================================
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS city    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS notes   VARCHAR(1000);

