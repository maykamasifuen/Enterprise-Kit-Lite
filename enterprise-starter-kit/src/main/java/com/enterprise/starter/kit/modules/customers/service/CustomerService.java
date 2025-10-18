package com.enterprise.starter.kit.modules.customers.service;

import com.enterprise.starter.kit.modules.customers.dto.CustomerRequest;
import com.enterprise.starter.kit.modules.customers.dto.CustomerResponse;
import com.enterprise.starter.kit.modules.customers.entity.Customer;
import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/// Service for customer management operations.
@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository companyRepository;

    public CustomerService(CustomerRepository customerRepository,
            com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository companyRepository) {
        this.customerRepository = customerRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable).map(CustomerResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String search, Pageable pageable) {
        return customerRepository.searchCustomers(search, pageable).map(CustomerResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
        return CustomerResponse.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getActiveCustomers() {
        return customerRepository.findByIsActiveTrue().stream()
                .map(CustomerResponse::fromEntity)
                .toList();
    }

    /// Create a new customer
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (request.email() != null && customerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Customer with this email already exists");
        }

        String tenantId = com.enterprise.starter.kit.shared.tenant.TenantContext.getTenantId();

        Customer customer = new Customer();
        mapRequestToEntity(request, customer);
        customer = customerRepository.save(customer);
        return CustomerResponse.fromEntity(customer);
    }

    /// Update an existing customer
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));

        // Check email uniqueness if changed
        if (request.email() != null && !request.email().equals(customer.getEmail())) {
            if (customerRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Customer with this email already exists");
            }
        }

        mapRequestToEntity(request, customer);
        customer = customerRepository.save(customer);
        return CustomerResponse.fromEntity(customer);
    }

    /// Soft delete a customer (set inactive)
    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
        customer.setIsActive(false);
        customerRepository.save(customer);
    }

    /// Hard delete a customer
    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new IllegalArgumentException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    /// Count active customers
    public long countActiveCustomers() {
        return customerRepository.countByIsActiveTrue();
    }

    /// Bulk delete customers by IDs
    @Transactional
    public void bulkDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty())
            return;
        customerRepository.deleteAllById(ids);
    }

    private void mapRequestToEntity(CustomerRequest request, Customer customer) {
        customer.setName(request.name());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setAddress(request.address());
        customer.setCity(request.city());
        customer.setCountry(request.country());
        customer.setTaxNumber(request.taxNumber());
        customer.setContactPerson(request.contactPerson());
        customer.setNotes(request.notes());
    }
}
