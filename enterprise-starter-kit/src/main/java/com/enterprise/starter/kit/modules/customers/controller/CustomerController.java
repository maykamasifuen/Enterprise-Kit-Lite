package com.enterprise.starter.kit.modules.customers.controller;

import com.enterprise.starter.kit.modules.customers.dto.CustomerRequest;
import com.enterprise.starter.kit.modules.customers.dto.CustomerResponse;
import com.enterprise.starter.kit.modules.customers.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/// REST controller for customer management.
///
/// Provides CRUD operations for customers:
/// - GET /api/customers - List all customers (paginated)
/// - GET /api/customers/active - List active customers (for dropdowns)
/// - GET /api/customers/search - Search customers
/// - GET /api/customers/{id} - Get customer by ID
/// - POST /api/customers - Create new customer
/// - PUT /api/customers/{id} - Update customer
/// - DELETE /api/customers/{id} - Delete customer
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(customerService.getAllCustomers(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CustomerResponse>> getActiveCustomers() {
        return ResponseEntity.ok(customerService.getActiveCustomers());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CustomerResponse>> searchCustomers(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(customerService.searchCustomers(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDeleteCustomers(@RequestBody List<Long> ids) {
        customerService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateCustomer(@PathVariable Long id) {
        customerService.deactivateCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countActiveCustomers() {
        return ResponseEntity.ok(customerService.countActiveCustomers());
    }
}
