package com.enterprise.starter.kit.modules.customers.dto;

import com.enterprise.starter.kit.modules.customers.entity.Customer;
import java.time.Instant;

/// DTO for customer response.
public record CustomerResponse(
    Long id,
    String name,
    String email,
    String phone,
    String address,
    String city,
    String country,
    String taxNumber,
    String contactPerson,
    String notes,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
    public static CustomerResponse fromEntity(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getAddress(),
            customer.getCity(),
            customer.getCountry(),
            customer.getTaxNumber(),
            customer.getContactPerson(),
            customer.getNotes(),
            customer.getIsActive(),
            customer.getCreatedAt(),
            customer.getUpdatedAt()
        );
    }
}
