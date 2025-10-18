//package com.enterprise.starter.kit.modules.invoices.controller;
//
//import com.enterprise.starter.kit.modules.invoices.dto.InvoiceRequest;
//import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@SpringBootTest
//@AutoConfigureMockMvc(addFilters = false) // Disable security filters to bypass auth for the test
//public class InvoiceIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    public void testCreateInvoice() throws Exception {
//        com.enterprise.starter.kit.shared.tenant.TenantContext.setTenantId("default");
//        InvoiceRequest request = new InvoiceRequest(
//                new BigDecimal("1500.00"),
//                "QA Test Client",
//                null,
//                InvoiceStatus.PENDING,
//                LocalDate.of(2026, 3, 1),
//                false,
//                null,
//                null,
//                null);
//
//        mockMvc.perform(post("/api/invoices")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)))
//                .andDo(print())
//                .andExpect(status().isOk());
//    }
//}
