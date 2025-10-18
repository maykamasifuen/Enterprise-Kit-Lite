--liquibase formatted sql
-- changeset aek-lite:v5-demo-seed-data
-- =================================================================
-- Demo seed data for Lite edition
-- Two tenants with sample users, invoices, customers, catalog items
-- =================================================================
-- ── Demo Company 1: Al-Noor Technologies ──
INSERT INTO companies (
        tenant_id,
        name,
        description,
        email,
        phone,
        address,
        city,
        country,
        tax_number,
        is_active,
        invoice_prefix,
        next_invoice_number,
        currency,
        default_tax_rate,
        payment_terms,
        date_format,
        timezone,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'al-noor-tech',
        'شركة النور للتقنية',
        'Leading technology solutions provider in the MENA region',
        'info@al-noor-tech.sa',
        '+966-11-123-4567',
        '123 King Fahd Road',
        'Riyadh',
        'Saudi Maykia',
        '300012345678901',
        TRUE,
        'INV-',
        1001,
        'SAR',
        15.0,
        30,
        'yyyy-MM-dd',
        'Asia/Riyadh',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
-- ── Demo Company 2: Solutions Digitales ──
INSERT INTO companies (
        tenant_id,
        name,
        description,
        email,
        phone,
        address,
        city,
        country,
        tax_number,
        is_active,
        invoice_prefix,
        next_invoice_number,
        currency,
        default_tax_rate,
        payment_terms,
        date_format,
        timezone,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'solutions-digitales',
        'Solutions Digitales Maroc',
        'Digital transformation partner for North African businesses',
        'contact@solutions-digitales.ma',
        '+212-522-345-678',
        '45 Boulevard Mohammed V',
        'Casablanca',
        'Morocco',
        'MA12345678',
        TRUE,
        'SD-',
        501,
        'MAD',
        20.0,
        45,
        'dd/MM/yyyy',
        'Africa/Casablanca',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
-- ── Demo Users ──
-- admin password: admin123 | all others password: demo123
INSERT INTO users (
        username,
        email,
        password,
        full_name,
        preferred_language,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'admin',
        'admin@al-noor-tech.sa',
        '$2b$10$IeOAoh9ni/lWDXbN1xmLWesCBUoa0oNt0lgh8gXfkQqmRh/wZVpxW',
        'محمد أحمد',
        'ar',
        TRUE,
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
INSERT INTO users (
        username,
        email,
        password,
        full_name,
        preferred_language,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'user1',
        'user@al-noor-tech.sa',
        '$2b$10$4/zrsaGts1BWK4Uo5QrxF.HFb9W3XQKyMbY1lk.OkNvAVl5N2HcwG',
        'فاطمة علي',
        'ar',
        TRUE,
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
INSERT INTO users (
        username,
        email,
        password,
        full_name,
        preferred_language,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'admin2',
        'admin@solutions-digitales.ma',
        '$2b$10$4/zrsaGts1BWK4Uo5QrxF.HFb9W3XQKyMbY1lk.OkNvAVl5N2HcwG',
        'Youssef Benali',
        'en',
        TRUE,
        'solutions-digitales',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
-- Super Admin
INSERT INTO users (
        username,
        email,
        password,
        full_name,
        preferred_language,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'superadmin',
        'superadmin@aek.com',
        '$2b$10$4/zrsaGts1BWK4Uo5QrxF.HFb9W3XQKyMbY1lk.OkNvAVl5N2HcwG',
        'Super Admin',
        'en',
        TRUE,
        'system',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'system'
    );
-- ── Role Assignments ──
INSERT INTO user_roles (user_id, role_id)
SELECT u.id,
    r.id
FROM users u,
    roles r
WHERE u.username = 'admin'
    AND r.name = 'ADMIN';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id,
    r.id
FROM users u,
    roles r
WHERE u.username = 'user1'
    AND r.name = 'USER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id,
    r.id
FROM users u,
    roles r
WHERE u.username = 'admin2'
    AND r.name = 'ADMIN';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id,
    r.id
FROM users u,
    roles r
WHERE u.username = 'superadmin'
    AND r.name = 'SUPER_ADMIN';
-- ── Sample Customers ──
INSERT INTO customers (
        name,
        email,
        phone,
        address,
        tax_number,
        contact_person,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Acme Corporation',
        'billing@acme.com',
        '+966-50-111-2222',
        '100 Innovation Blvd, Riyadh',
        '300098765432100',
        'Ahmed Al-Rashid',
        TRUE,
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin'
    );
INSERT INTO customers (
        name,
        email,
        phone,
        address,
        tax_number,
        contact_person,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Atlas Digital',
        'finance@atlasdigital.ma',
        '+212-661-333-444',
        '12 Rue Hassan II, Casablanca',
        'MA87654321',
        'Karim Idrissi',
        TRUE,
        'solutions-digitales',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin2'
    );
-- ── Sample Invoices ──
INSERT INTO invoices (
        client_name,
        amount,
        status,
        invoice_date,
        due_date,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Acme Corporation',
        15000.00,
        'PAID',
        '2026-01-15',
        '2026-02-15',
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin'
    );
INSERT INTO invoices (
        client_name,
        amount,
        status,
        invoice_date,
        due_date,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Acme Corporation',
        8500.00,
        'PENDING',
        '2026-02-01',
        '2026-03-01',
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin'
    );
INSERT INTO invoices (
        client_name,
        amount,
        status,
        invoice_date,
        due_date,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Atlas Digital',
        22000.00,
        'PENDING',
        '2026-02-10',
        '2026-03-25',
        'solutions-digitales',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin2'
    );
-- ── Sample Catalog Items ──
INSERT INTO catalog_items (
        name,
        description,
        unit_price,
        unit,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Web Development',
        'Full-stack web application development',
        150.00,
        'HOUR',
        TRUE,
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin'
    );
INSERT INTO catalog_items (
        name,
        description,
        unit_price,
        unit,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'UI/UX Design',
        'User interface and experience design',
        120.00,
        'HOUR',
        TRUE,
        'al-noor-tech',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin'
    );
INSERT INTO catalog_items (
        name,
        description,
        unit_price,
        unit,
        is_active,
        tenant_id,
        created_at,
        updated_at,
        created_by
    )
VALUES (
        'Cloud Consulting',
        'Cloud architecture and migration consulting',
        200.00,
        'HOUR',
        TRUE,
        'solutions-digitales',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'admin2'
    );