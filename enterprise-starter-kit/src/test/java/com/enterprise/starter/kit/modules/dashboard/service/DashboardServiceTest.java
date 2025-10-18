package com.enterprise.starter.kit.modules.dashboard.service;

import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import com.enterprise.starter.kit.modules.dashboard.dto.DashboardStatsDTO;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks private DashboardService dashboardService;

    private static final String TENANT = "tenant-1";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("getStats() returns aggregated statistics for current tenant")
    void getStats_returnsAggregatedStats() {
        when(invoiceRepository.countByTenantId(TENANT)).thenReturn(10L);
        when(invoiceRepository.sumAmountByTenantId(TENANT)).thenReturn(new BigDecimal("5000.00"));
        when(invoiceRepository.countByTenantIdAndStatus(TENANT, InvoiceStatus.PAID)).thenReturn(6L);
        when(invoiceRepository.countByTenantIdAndStatus(TENANT, InvoiceStatus.PENDING)).thenReturn(2L);
        when(invoiceRepository.countByTenantIdAndStatus(TENANT, InvoiceStatus.OVERDUE)).thenReturn(1L);
        when(invoiceRepository.countByTenantIdAndStatus(TENANT, InvoiceStatus.CANCELLED)).thenReturn(1L);
        when(customerRepository.count()).thenReturn(5L);

        DashboardStatsDTO stats = dashboardService.getStats();

        assertThat(stats.totalInvoices()).isEqualTo(10L);
        assertThat(stats.totalAmount()).isEqualByComparingTo("5000.00");
        assertThat(stats.paidCount()).isEqualTo(6L);
        assertThat(stats.pendingCount()).isEqualTo(2L);
        assertThat(stats.overdueCount()).isEqualTo(1L);
        assertThat(stats.cancelledCount()).isEqualTo(1L);
        assertThat(stats.totalCustomers()).isEqualTo(5L);
    }

    @Test
    @DisplayName("getStats() handles null totalAmount (no invoices) gracefully")
    void getStats_handlesNullAmount() {
        when(invoiceRepository.countByTenantId(TENANT)).thenReturn(0L);
        when(invoiceRepository.sumAmountByTenantId(TENANT)).thenReturn(null);
        when(invoiceRepository.countByTenantIdAndStatus(any(), any())).thenReturn(0L);
        when(customerRepository.count()).thenReturn(0L);

        DashboardStatsDTO stats = dashboardService.getStats();

        assertThat(stats.totalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("getStatsByDateRange() filters stats between given dates")
    void getStatsByDateRange_filtersCorrectly() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to   = LocalDate.of(2026, 1, 31);

        when(invoiceRepository.countByTenantIdAndDateRange(TENANT, from, to)).thenReturn(4L);
        when(invoiceRepository.sumAmountByTenantIdAndDateRange(TENANT, from, to)).thenReturn(new BigDecimal("2000.00"));
        when(invoiceRepository.countByTenantIdAndStatusAndDateRange(eq(TENANT), eq(InvoiceStatus.PAID),      eq(from), eq(to))).thenReturn(3L);
        when(invoiceRepository.countByTenantIdAndStatusAndDateRange(eq(TENANT), eq(InvoiceStatus.PENDING),   eq(from), eq(to))).thenReturn(1L);
        when(invoiceRepository.countByTenantIdAndStatusAndDateRange(eq(TENANT), eq(InvoiceStatus.OVERDUE),   eq(from), eq(to))).thenReturn(0L);
        when(invoiceRepository.countByTenantIdAndStatusAndDateRange(eq(TENANT), eq(InvoiceStatus.CANCELLED), eq(from), eq(to))).thenReturn(0L);
        when(customerRepository.count()).thenReturn(3L);

        DashboardStatsDTO stats = dashboardService.getStatsByDateRange(from, to);

        assertThat(stats.totalInvoices()).isEqualTo(4L);
        assertThat(stats.totalAmount()).isEqualByComparingTo("2000.00");
        assertThat(stats.paidCount()).isEqualTo(3L);
    }
}

