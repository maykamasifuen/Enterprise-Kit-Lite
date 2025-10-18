package com.enterprise.starter.kit.modules.invoices.controller;

import com.enterprise.starter.kit.modules.invoices.dto.InvoiceResponse;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.modules.invoices.service.InvoiceService;
import com.enterprise.starter.kit.shared.exception.ApiExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InvoicesControllerTest {

    MockMvc mockMvc;
    final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Mock
    InvoiceService invoiceService;
    @InjectMocks
    InvoicesController invoicesController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(invoicesController)
                .setControllerAdvice(new ApiExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    /** Build a sample InvoiceResponse matching the record field order exactly. */
    private InvoiceResponse sampleInvoice() {
        return new InvoiceResponse(
                1L, // id
                BigDecimal.valueOf(1500), // amount
                "Acme Corp", // clientName
                null, // customerId
                null, // customerName
                InvoiceStatus.PENDING, // status
                LocalDate.now(), // invoiceDate
                LocalDate.now().plusDays(30), // dueDate
                null, // createdAt
                null, // updatedAt
                false, // isRecurring
                null, // recurrenceInterval
                null, // nextRecurrenceDate
                null // recurrenceEndDate
        );
    }

    @Test
    @DisplayName("GET /api/invoices/page → 200 with paginated invoices")
    void getPaged_returns200() throws Exception {
        var page = new PageImpl<>(List.of(sampleInvoice()), PageRequest.of(0, 20), 1);
        when(invoiceService.getAllPaged(any())).thenReturn(page);

        mockMvc.perform(get("/api/invoices/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].clientName").value("Acme Corp"));
    }

    @Test
    @DisplayName("GET /api/invoices/search?q=Acme → 200 filtered results")
    void search_withQuery_returns200() throws Exception {
        var page = new PageImpl<>(List.of(sampleInvoice()), PageRequest.of(0, 20), 1);
        when(invoiceService.search(any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/invoices/search").param("q", "Acme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].clientName").value("Acme Corp"));
    }

    @Test
    @DisplayName("POST /api/invoices with invalid body → 400")
    void create_invalidBody_returns400() throws Exception {
        mockMvc.perform(post("/api/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
