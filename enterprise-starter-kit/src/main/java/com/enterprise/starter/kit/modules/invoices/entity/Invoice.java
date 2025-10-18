package com.enterprise.starter.kit.modules.invoices.entity;

import com.enterprise.starter.kit.modules.customers.entity.Customer;
import com.enterprise.starter.kit.modules.invoices.enums.InvoiceStatus;
import com.enterprise.starter.kit.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Invoice entity.
 */
@Entity
@Table(name = "invoices")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {

    @Column(name = "client_name", nullable = false, length = 255)
    private String clientName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private InvoiceStatus status;

    /**
     * The date when the invoice was issued.
     * Defaults to the current date if not specified.
     */
    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    // IMPORTANT:
    // Keep the database column nullable to allow smooth schema migrations when
    // older rows exist.
    // Business validation still enforces non-null dueDate on create/update.
    @Column(name = "due_date", nullable = true)
    private LocalDate dueDate;

    @jakarta.persistence.Transient
    private Long customerId;

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String clientName;
        private Customer customer;
        private BigDecimal amount;
        private InvoiceStatus status;
        private LocalDate invoiceDate = LocalDate.now();
        private LocalDate dueDate;

        private Builder() {
        }

        public Builder clientName(String clientName) {
            this.clientName = clientName;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder status(InvoiceStatus status) {
            this.status = status;
            return this;
        }

        public Builder invoiceDate(LocalDate invoiceDate) {
            this.invoiceDate = invoiceDate;
            return this;
        }

        public Builder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder customer(Customer customer) {
            this.customer = customer;
            return this;
        }

        public Invoice build() {
            Invoice invoice = new Invoice();
            invoice.setClientName(clientName);
            invoice.setAmount(amount);
            invoice.setStatus(status);
            invoice.setInvoiceDate(invoiceDate);
            invoice.setDueDate(dueDate);
            invoice.setCustomer(customer);
            return invoice;
        }
    }
}
