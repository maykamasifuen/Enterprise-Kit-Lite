package com.enterprise.starter.kit.modules.invoices.enums;

/**
 * Canonical invoice lifecycle state.
 */
public enum InvoiceStatus {
    DRAFT,
    SENT,
    PAID,
    PENDING,
    CANCELLED,
    OVERDUE
}
