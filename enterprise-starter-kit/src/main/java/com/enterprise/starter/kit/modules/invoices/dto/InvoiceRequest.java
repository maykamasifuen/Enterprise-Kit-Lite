package com.enterprise.starter.kit.modules.invoices.dto;

import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceRequest(
        @NotNull @DecimalMin(value = "0.01", inclusive = true) BigDecimal amount,
        @NotBlank String clientName,
        Long customerId,
        @NotNull InvoiceStatus status,
        @NotNull LocalDate dueDate,
        // Recurring fields (optional)
        Boolean isRecurring,
        String recurrenceInterval,
        LocalDate nextRecurrenceDate,
        LocalDate recurrenceEndDate
) {}
