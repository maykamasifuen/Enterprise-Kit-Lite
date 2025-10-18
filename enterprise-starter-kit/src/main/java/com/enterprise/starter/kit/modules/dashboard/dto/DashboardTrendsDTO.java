package com.enterprise.starter.kit.modules.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Monthly revenue and invoice count trends for charting.
 */
public record DashboardTrendsDTO(
        List<MonthlyTrend> trends
) {
    public record MonthlyTrend(
            String month,        // e.g. "2025-08"
            BigDecimal revenue,
            long invoiceCount
    ) {}
}

