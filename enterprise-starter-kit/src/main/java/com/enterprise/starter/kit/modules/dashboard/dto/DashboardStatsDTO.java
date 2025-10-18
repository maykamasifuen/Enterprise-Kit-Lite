package com.enterprise.starter.kit.modules.dashboard.dto;

import java.math.BigDecimal;

/**
 * Data Transfer Object for dashboard statistics.
 * Contains aggregate invoice metrics for the current tenant.
 */
public record DashboardStatsDTO(
        long totalInvoices,
        BigDecimal totalAmount,
        long paidCount,
        long pendingCount,
        long overdueCount,
        long cancelledCount,
        long totalCustomers
) {
    /**
     * Creates an empty stats DTO with zero values.
     */
    public static DashboardStatsDTO empty() {
        return new DashboardStatsDTO(0, BigDecimal.ZERO, 0, 0, 0, 0, 0);
    }
}
