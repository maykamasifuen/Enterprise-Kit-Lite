//package com.enterprise.starter.kit.modules.invoices.config;
//
//import com.enterprise.starter.kit.modules.invoices.entity.Invoice;
//import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//
//@Configuration(proxyBeanMethods = false)
//public class InvoiceDataSeeder {
//
////    private static final Logger log = LoggerFactory.getLogger(InvoiceDataSeeder.class);
//
////    @Bean
////    public CommandLineRunner seedInvoices(InvoiceRepository invoiceRepository) {
////        return args -> {
////            if (invoiceRepository.count() > 0) {
////                log.debug("Invoices table already contains data; skipping seed");
////            }
////        };
////    }
//
//    private static Invoice invoice(String clientName, String amount, String status, LocalDate invoiceDate) {
//        Invoice invoice = new Invoice();
//        invoice.setClientName(clientName);
//        invoice.setAmount(new BigDecimal(amount));
//        invoice.setStatus(status);
//        invoice.setInvoiceDate(invoiceDate);
//        return invoice;
//    }
//}
