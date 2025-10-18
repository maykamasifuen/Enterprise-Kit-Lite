package com.enterprise.starter.kit.modules.dashboard.dto;

import java.time.Instant;

public record SystemStatsDTO(
    long totalCompanies,
    long activeCompanies,
    long totalUsers,
    long activeUsers,
    long totalInvoices,
    long totalRoles,
    Instant systemTime
) {}

