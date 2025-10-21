export type InvoiceStatus = 'PAID' | 'PENDING' | 'CANCELLED' | 'OVERDUE' | 'DRAFT' | 'SENT';
export type RecurrenceInterval = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/** Backend response shape for invoices. */
export interface Invoice {
  id: number;
  clientName: string;
  customerId?: number;
  customerName?: string;
  amount: number;
  status: InvoiceStatus;
  /** ISO date string (yyyy-MM-dd) */
  invoiceDate: string;
  /** ISO date string (yyyy-MM-dd) */
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  // Recurring fields
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  nextRecurrenceDate?: string;
  recurrenceEndDate?: string;
}

export interface InvoiceCreateRequest {
  clientName: string;
  customerId?: number;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  // Recurring fields (optional)
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  nextRecurrenceDate?: string;
  recurrenceEndDate?: string;
}

export interface InvoiceUpdateRequest {
  clientName: string;
  customerId?: number;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  // Recurring fields (optional)
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  nextRecurrenceDate?: string;
  recurrenceEndDate?: string;
}


