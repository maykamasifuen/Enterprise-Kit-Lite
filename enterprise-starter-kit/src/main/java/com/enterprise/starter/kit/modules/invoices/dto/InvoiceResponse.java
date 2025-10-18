package com.enterprise.starter.kit.modules.invoices.dto;

import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record InvoiceResponse(
        Long id,
        BigDecimal amount,
        String clientName,
        Long customerId,
        String customerName,
        InvoiceStatus status,
        LocalDate invoiceDate,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt,
        // Recurring fields
        Boolean isRecurring,
        String recurrenceInterval,
        LocalDate nextRecurrenceDate,
        LocalDate recurrenceEndDate
) {}
