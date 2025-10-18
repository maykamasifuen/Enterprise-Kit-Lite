package com.enterprise.starter.kit.modules.invoices.service;

import com.enterprise.starter.kit.modules.customers.entity.Customer;
import com.enterprise.starter.kit.modules.customers.repository.CustomerRepository;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceRequest;
import com.enterprise.starter.kit.modules.invoices.dto.InvoiceUpdateRequest;
import com.enterprise.starter.kit.modules.invoices.entity.Invoice;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.modules.tenant.entity.Company;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private InvoiceService invoiceService;

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
    void create_validRequest_persistsInvoice() {
        // Setup tenant company
        Company company = new Company();
        company.setId(1L);
        company.setTenantId(TENANT);
        when(companyRepository.findByTenantId(TENANT)).thenReturn(Optional.of(company));
        when(invoiceRepository.countByTenantIdAndInvoiceDateBetween(eq(TENANT), any(), any())).thenReturn(0L);

        InvoiceRequest req = new InvoiceRequest(
                new BigDecimal("100.00"),
                "Acme",
                null,
                InvoiceStatus.PENDING,
                LocalDate.now().plusDays(10),
                null, null, null, null);

        Invoice saved = new Invoice();
        saved.setId(1L);
        saved.setClientName(req.clientName());
        saved.setAmount(req.amount());
        saved.setStatus(req.status());
        saved.setDueDate(req.dueDate());

        when(invoiceRepository.save(any(Invoice.class))).thenReturn(saved);

        var res = invoiceService.create(req);

        assertThat(res.id()).isEqualTo(1L);
        assertThat(res.clientName()).isEqualTo("Acme");
        assertThat(res.amount()).isEqualByComparingTo("100.00");
        assertThat(res.status()).isEqualTo(InvoiceStatus.PENDING);
        assertThat(res.dueDate()).isEqualTo(req.dueDate());

        ArgumentCaptor<Invoice> captor = ArgumentCaptor.forClass(Invoice.class);
        verify(invoiceRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("100.00");
    }

    @Test
    void create_invalidAmount_throws() {
        InvoiceRequest req = new InvoiceRequest(
                new BigDecimal("0"),
                "Acme",
                null,
                InvoiceStatus.PENDING,
                LocalDate.now().plusDays(1),
                null, null, null, null);

        assertThatThrownBy(() -> invoiceService.create(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("amount");

        verifyNoInteractions(invoiceRepository);
    }

    @Test
    void update_existingInvoice_updatesAndPersists() {
        Long id = 10L;
        InvoiceUpdateRequest req = new InvoiceUpdateRequest(
                new BigDecimal("250.00"),
                "Client",
                null,
                InvoiceStatus.PAID,
                LocalDate.now().plusDays(5),
                null, null, null, null);

        Invoice existing = new Invoice();
        existing.setId(id);
        existing.setClientName("Old");
        existing.setAmount(new BigDecimal("5.00"));
        existing.setStatus(InvoiceStatus.PENDING);
        existing.setDueDate(LocalDate.now().plusDays(2));

        when(invoiceRepository.findById(id)).thenReturn(Optional.of(existing));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        var res = invoiceService.update(id, req);

        assertThat(res.id()).isEqualTo(id);
        assertThat(res.amount()).isEqualByComparingTo("250.00");
        assertThat(res.clientName()).isEqualTo("Client");
        assertThat(res.status()).isEqualTo(InvoiceStatus.PAID);

        verify(invoiceRepository).findById(id);
        verify(invoiceRepository).save(existing);
    }

    @Test
    void getAll_returnsMappedResponses() {
        Invoice a = new Invoice();
        a.setId(1L);
        a.setClientName("A");
        a.setAmount(new BigDecimal("1.00"));
        a.setStatus(InvoiceStatus.PENDING);
        a.setDueDate(LocalDate.now().plusDays(1));

        when(invoiceRepository.findByTenantId(TENANT)).thenReturn(List.of(a));

        var res = invoiceService.getAll();

        assertThat(res).hasSize(1);
        assertThat(res.get(0).id()).isEqualTo(1L);
        assertThat(res.get(0).clientName()).isEqualTo("A");
        verify(invoiceRepository).findByTenantId(TENANT);
        verifyNoMoreInteractions(invoiceRepository);
    }

    @Test
    void delete_existingInvoice_deletes() {
        Long id = 99L;
        Invoice existing = new Invoice();
        existing.setId(id);
        existing.setClientName("X");
        existing.setAmount(new BigDecimal("10.00"));
        existing.setStatus(InvoiceStatus.CANCELLED);
        existing.setDueDate(LocalDate.now().plusDays(3));

        when(invoiceRepository.findById(id)).thenReturn(Optional.of(existing));

        invoiceService.delete(id);

        verify(invoiceRepository).findById(id);
        verify(invoiceRepository).delete(existing);
    }
}
