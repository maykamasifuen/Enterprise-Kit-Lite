package com.enterprise.starter.kit.modules.dashboard.service;
import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import com.enterprise.starter.kit.modules.dashboard.dto.DashboardStatsDTO;
import com.enterprise.starter.kit.modules.dashboard.dto.DashboardTrendsDTO;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {
    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ApplicationContext applicationContext;

    public DashboardService(InvoiceRepository invoiceRepository,
                            CustomerRepository customerRepository,
                            ApplicationContext applicationContext) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.applicationContext = applicationContext;
    }

    /** Returns the Spring AOP proxy of this bean so @Cacheable is not bypassed on self-calls. */
    private DashboardService self() {
        return applicationContext.getBean(DashboardService.class);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        String tenantId = resolveTenantId();
        // Call via proxy so @Cacheable AOP intercepts it
        return self().getStatsCached(tenantId);
    }

    @Cacheable(value = "dashboardStats", key = "'stats:' + #tenantId")
    @Transactional(readOnly = true)
    public DashboardStatsDTO getStatsCached(String tenantId) {
        return buildStats(tenantId, null, null);
    }

    /** Evict tenant-specific cache entry after data changes (called from invoice mutations). */
    @CacheEvict(value = "dashboardStats", key = "'stats:' + #tenantId")
    public void evictCacheForTenant(String tenantId) {
        log.debug("Dashboard stats cache evicted for tenant: {}", tenantId);
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    @Scheduled(fixedDelay = 60_000)
    public void evictDashboardCache() {
        log.debug("Dashboard stats cache evicted (scheduled)");
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStatsByDateRange(LocalDate from, LocalDate to) {
        return buildStats(resolveTenantId(), from, to);
    }

    @Transactional(readOnly = true)
    public DashboardTrendsDTO getTrends(int months) {
        String tenantId = resolveTenantId();
        LocalDate since = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<Object[]> rows = invoiceRepository.monthlyRevenueSince(tenantId, since);
        List<DashboardTrendsDTO.MonthlyTrend> trends = rows.stream().map(r ->
                new DashboardTrendsDTO.MonthlyTrend(
                        (String) r[0],
                        r[1] instanceof BigDecimal b ? b : new BigDecimal(r[1].toString()),
                        ((Number) r[2]).longValue()
                )
        ).toList();
        return new DashboardTrendsDTO(trends);
    }

    private DashboardStatsDTO buildStats(String tenantId, LocalDate from, LocalDate to) {
        log.info("Fetching dashboard stats for tenant: {} range: {} - {}", tenantId, from, to);
        long totalInvoices; BigDecimal totalAmount;
        long paidCount, pendingCount, overdueCount, cancelledCount;
        if (from != null && to != null) {
            totalInvoices  = invoiceRepository.countByTenantIdAndDateRange(tenantId, from, to);
            totalAmount    = invoiceRepository.sumAmountByTenantIdAndDateRange(tenantId, from, to);
            paidCount      = invoiceRepository.countByTenantIdAndStatusAndDateRange(tenantId, InvoiceStatus.PAID,      from, to);
            pendingCount   = invoiceRepository.countByTenantIdAndStatusAndDateRange(tenantId, InvoiceStatus.PENDING,   from, to);
            overdueCount   = invoiceRepository.countByTenantIdAndStatusAndDateRange(tenantId, InvoiceStatus.OVERDUE,   from, to);
            cancelledCount = invoiceRepository.countByTenantIdAndStatusAndDateRange(tenantId, InvoiceStatus.CANCELLED, from, to);
        } else {
            totalInvoices  = invoiceRepository.countByTenantId(tenantId);
            totalAmount    = invoiceRepository.sumAmountByTenantId(tenantId);
            paidCount      = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.PAID);
            pendingCount   = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.PENDING);
            overdueCount   = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.OVERDUE);
            cancelledCount = invoiceRepository.countByTenantIdAndStatus(tenantId, InvoiceStatus.CANCELLED);
        }
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        long totalCustomers = customerRepository.countByTenantId(tenantId);
        return new DashboardStatsDTO(totalInvoices, totalAmount, paidCount, pendingCount, overdueCount, cancelledCount, totalCustomers);
    }

    public String resolveTenantId() {
        String t = TenantContext.getTenantId();
        return t != null ? t : "default";
    }
}
