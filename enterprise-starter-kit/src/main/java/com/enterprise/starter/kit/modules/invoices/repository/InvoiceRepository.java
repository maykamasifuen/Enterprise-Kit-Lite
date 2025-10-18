package com.enterprise.starter.kit.modules.invoices.repository;

import com.enterprise.starter.kit.modules.invoices.entity.Invoice;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /** Counts total invoices for a specific tenant. */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") String tenantId);

    /** Calculates the sum of all invoice amounts for a tenant. */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i WHERE i.tenantId = :tenantId")
    BigDecimal sumAmountByTenantId(@Param("tenantId") String tenantId);

    /** Counts invoices by status for a specific tenant. */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.tenantId = :tenantId AND i.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") InvoiceStatus status);

    /** Paginated list for a tenant. */
    Page<Invoice> findByTenantId(String tenantId, Pageable pageable);

    /** Finds all invoices by tenant ID (non-paginated, for export). */
    List<Invoice> findByTenantId(String tenantId);

    /** Finds invoices by IDs and tenant ID (for security). */
    @Query("SELECT i FROM Invoice i WHERE i.id IN :ids AND i.tenantId = :tenantId")
    List<Invoice> findByIdInAndTenantId(@Param("ids") List<Long> ids, @Param("tenantId") String tenantId);

    /** Full-text search on clientName + optional status filter + date range. */
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.tenantId = :tenantId
          AND (:q IS NULL OR LOWER(i.clientName) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:status IS NULL OR i.status = :status)
          AND (:from IS NULL OR i.invoiceDate >= :from)
          AND (:to   IS NULL OR i.invoiceDate <= :to)
        """)
    Page<Invoice> search(
            @Param("tenantId") String tenantId,
            @Param("q") String q,
            @Param("status") InvoiceStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    /** Calculates the sum of all invoice amounts across the system (PAID only). */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i WHERE i.status = 'PAID'")
    BigDecimal sumTotalPaidAmount();

    /** Calculates total sum of all invoices regardless of status. */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i")
    BigDecimal sumTotalAmount();

    long countByTenantIdAndInvoiceDateBetween(String tenantId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.tenantId = :tenantId AND i.invoiceDate BETWEEN :from AND :to")
    long countByTenantIdAndDateRange(@Param("tenantId") String tenantId,
            @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i WHERE i.tenantId = :tenantId AND i.invoiceDate BETWEEN :from AND :to")
    BigDecimal sumAmountByTenantIdAndDateRange(@Param("tenantId") String tenantId,
            @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.tenantId = :tenantId AND i.status = :status AND i.invoiceDate BETWEEN :from AND :to")
    long countByTenantIdAndStatusAndDateRange(@Param("tenantId") String tenantId,
            @Param("status") InvoiceStatus status,
            @Param("from") LocalDate from, @Param("to") LocalDate to);

    /**
     * Monthly revenue trend: SUM(amount) per month for the last N months.
     * Uses native SQL via nativeQuery=true to support DATE_FORMAT properly.
     */
    @Query(value = """
        SELECT DATE_FORMAT(i.invoice_date, '%Y-%m') AS month,
               COALESCE(SUM(i.amount), 0)           AS revenue,
               COUNT(i.id)                          AS invoice_count
        FROM invoices i
        WHERE i.tenant_id = :tenantId
          AND i.invoice_date >= :since
          AND i.status = 'PAID'
        GROUP BY DATE_FORMAT(i.invoice_date, '%Y-%m')
        ORDER BY month ASC
        """, nativeQuery = true)
    List<Object[]> monthlyRevenueSince(@Param("tenantId") String tenantId,
                                       @Param("since") LocalDate since);

    /**
     * Find invoices by customer ID (for portal access).
     */
    List<Invoice> findByCustomerId(Long customerId);

    /**
     * Find all PAID invoices for a tenant within a date range (used by VAT/Tax report).
     */
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.tenantId = :tenantId
          AND i.status = 'PAID'
          AND i.invoiceDate >= :startDate
          AND i.invoiceDate <= :endDate
        """)
    List<Invoice> findPaidInvoicesByTenantAndDateRange(
            @Param("tenantId") String tenantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
