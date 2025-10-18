package com.enterprise.starter.kit.modules.invoices.controller;

import com.enterprise.starter.kit.modules.invoices.dto.InvoiceRequest;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceResponse;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceUpdateRequest;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.invoices.service.InvoiceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices", description = "Endpoints for managing invoices")
public class InvoicesController {

    private final InvoiceService invoiceService;

    public InvoicesController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    /** Paginated invoice list for the current tenant. */
    @GetMapping("/page")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesPaged(
            @PageableDefault(size = 20, sort = "invoiceDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getAllPaged(pageable));
    }

    /** Search invoices with optional filters. */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InvoiceResponse>> searchInvoices(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20, sort = "invoiceDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(invoiceService.search(q, status, from, to, pageable));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceResponse> updateInvoice(@PathVariable Long id,
            @Valid @RequestBody InvoiceUpdateRequest request) {
        return ResponseEntity.ok(invoiceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> bulkDeleteInvoices(@RequestBody List<Long> ids) {
        invoiceService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/bulk-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<String, Integer>> bulkUpdateStatus(
            @RequestBody BulkStatusRequest request) {
        int updated = invoiceService.bulkUpdateStatus(request.ids(), request.status());
        return ResponseEntity.ok(java.util.Map.of("updated", updated));
    }

    public record BulkStatusRequest(
            List<Long> ids,
            com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus status) {
    }
}
