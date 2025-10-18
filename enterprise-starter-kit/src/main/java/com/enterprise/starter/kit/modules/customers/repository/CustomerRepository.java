package com.enterprise.starter.kit.modules.customers.repository;

import com.enterprise.starter.kit.modules.customers.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/// Repository for Customer entity operations.
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /// Find customers by name containing (case-insensitive)
    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /// Find customer by email
    Optional<Customer> findByEmail(String email);

    /// Check if customer exists by email
    boolean existsByEmail(String email);

    /// Find all active customers
    List<Customer> findByIsActiveTrue();

    /// Search customers by name, email, or contact person
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    /// Count active customers
    long countByIsActiveTrue();

    /// Count customers by tenant
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") String tenantId);
}
