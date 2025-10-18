package com.enterprise.starter.kit.modules.customers.service;

import com.enterprise.starter.kit.modules.customers.dto.CustomerRequest;
import com.enterprise.starter.kit.modules.customers.dto.CustomerResponse;
import com.enterprise.starter.kit.modules.customers.entity.Customer;
import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService Unit Tests")
class CustomerServiceTest {
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CompanyRepository companyRepository;
    @InjectMocks
    private CustomerService customerService;
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
    @DisplayName("getAllCustomers() returns paginated customers")
    void getAllCustomers_returnsPaginatedCustomers() {
        Customer c = new Customer();
        c.setId(1L);
        c.setName("ACME Corp");
        c.setEmail("acme@example.com");
        c.setIsActive(true);
        when(customerRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(c)));
        Page<CustomerResponse> result = customerService.getAllCustomers(Pageable.unpaged());
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("ACME Corp");
    }

    @Test
    @DisplayName("getCustomerById() throws when not found")
    void getCustomerById_throwsWhenNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> customerService.getCustomerById(99L))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("not found");
    }

    @Test
    @DisplayName("createCustomer() persists and returns customer")
    void createCustomer_persistsCustomer() {
        Company co = new Company();
        co.setId(1L);
        co.setTenantId(TENANT);
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(co));
        when(customerRepository.count()).thenReturn(0L);
        CustomerRequest req = new CustomerRequest("New Corp", "new@example.com", "+1", "123 St", "Dubai", "AE", "TAX",
                "John", "VIP");
        Customer saved = new Customer();
        saved.setId(1L);
        saved.setName("New Corp");
        saved.setEmail("new@example.com");
        saved.setIsActive(true);
        when(customerRepository.save(any(Customer.class))).thenReturn(saved);
        CustomerResponse result = customerService.createCustomer(req);
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("New Corp");
    }

    @Test
    @DisplayName("deleteCustomer() calls repository deleteById")
    void deleteCustomer_callsRepository() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        customerService.deleteCustomer(1L);
        verify(customerRepository).deleteById(1L);
    }

    @Test
    @DisplayName("bulkDelete() deletes all specified IDs")
    void bulkDelete_deletesAllIds() {
        List<Long> ids = List.of(1L, 2L, 3L);
        customerService.bulkDelete(ids);
        verify(customerRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("bulkDelete() with empty list does nothing")
    void bulkDelete_emptyList_doesNothing() {
        customerService.bulkDelete(List.of());
        verifyNoInteractions(customerRepository);
    }
}