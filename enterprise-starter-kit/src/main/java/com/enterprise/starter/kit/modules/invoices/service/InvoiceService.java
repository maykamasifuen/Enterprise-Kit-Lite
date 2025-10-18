package com.enterprise.starter.kit.modules.invoices.service;

import com.enterprise.starter.kit.modules.invoices.dto.InvoiceRequest;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceResponse;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceUpdateRequest;
import com.enterprise.starter.kit.modules.invoices.entity.Invoice;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.customers.entity.Customer;
import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.modules.dashboard.service.DashboardService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final DashboardService dashboardService;

    public InvoiceService(InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            DashboardService dashboardService) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.dashboardService = dashboardService;
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        validateBusinessRules(request.amount(), request.clientName(), request.dueDate());

        Invoice.Builder builder = Invoice.builder()
                .amount(request.amount())
                .clientName(request.clientName())
                .status(request.status())
                .dueDate(request.dueDate());

        if (request.customerId() != null) {
            Customer customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.customerId()));
            builder.customer(customer);
        }

        Invoice saved = invoiceRepository.save(builder.build());

        // Evict dashboard cache so stats are fresh immediately
        dashboardService.evictCacheForTenant(saved.getTenantId());

        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponse update(Long id, InvoiceUpdateRequest request) {
        validateId(id);
        validateBusinessRules(request.amount(), request.clientName(), request.dueDate());

        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        existing.setAmount(request.amount());
        existing.setClientName(request.clientName());
        existing.setStatus(request.status());
        existing.setDueDate(request.dueDate());

        if (request.customerId() != null) {
            Customer customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.customerId()));
            existing.setCustomer(customer);
        } else {
            existing.setCustomer(null);
        }

        Invoice saved = invoiceRepository.save(existing);

        // Evict dashboard cache so stats are fresh immediately
        dashboardService.evictCacheForTenant(saved.getTenantId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        validateId(id);
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
        String tenantId = existing.getTenantId();
        invoiceRepository.delete(existing);

        // Evict dashboard cache so stats are fresh immediately
        dashboardService.evictCacheForTenant(tenantId);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(Long id) {
        validateId(id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAll() {
        String tenantId = com.enterprise.starter.kit.shared.tenant.TenantContext.getTenantId();
        if (tenantId == null)
            tenantId = "default";
        return invoiceRepository.findByTenantId(tenantId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllPaged(Pageable pageable) {
        String tenantId = com.enterprise.starter.kit.shared.tenant.TenantContext.getTenantId();
        if (tenantId == null)
            tenantId = "default";
        return invoiceRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> search(String q, InvoiceStatus status, LocalDate from, LocalDate to,
            Pageable pageable) {
        String tenantId = com.enterprise.starter.kit.shared.tenant.TenantContext.getTenantId();
        if (tenantId == null)
            tenantId = "default";
        String queryStr = (q != null && q.isBlank()) ? null : q;
        return invoiceRepository.search(tenantId, queryStr, status, from, to, pageable).map(this::toResponse);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid invoice id");
        }
    }

    @Transactional
    public void bulkDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty())
            return;
        invoiceRepository.deleteAllById(ids);
        dashboardService.evictCacheForTenant(dashboardService.resolveTenantId());
    }

    @Transactional
    public int bulkUpdateStatus(List<Long> ids,
            com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus status) {
        if (ids == null || ids.isEmpty() || status == null)
            return 0;
        List<Invoice> invoices = invoiceRepository.findAllById(ids);
        invoices.forEach(inv -> inv.setStatus(status));
        invoiceRepository.saveAll(invoices);
        dashboardService.evictCacheForTenant(dashboardService.resolveTenantId());
        return invoices.size();
    }

    private void validateBusinessRules(BigDecimal amount, String clientName, java.time.LocalDate dueDate) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
        if (clientName == null || clientName.isBlank()) {
            throw new IllegalArgumentException("clientName is required");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getAmount(),
                invoice.getClientName(),
                invoice.getCustomer() != null ? invoice.getCustomer().getId() : null,
                invoice.getCustomer() != null ? invoice.getCustomer().getName() : null,
                invoice.getStatus(),
                invoice.getInvoiceDate(),
                invoice.getDueDate(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt(),
                false, // isRecurring - default to false for Lite
                null, // recurrenceInterval
                null, // nextRecurrenceDate
                null); // recurrenceEndDate
    }
}
