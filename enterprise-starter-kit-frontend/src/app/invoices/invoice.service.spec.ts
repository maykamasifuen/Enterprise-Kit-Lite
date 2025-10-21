import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from './invoice.model';
import { environment } from '../../environments/environment';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/invoices`;

  const sampleInvoice = {
    id: 1, clientName: 'Acme Corp', amount: 1500,
    status: 'PENDING' as InvoiceStatus, invoiceDate: '2025-01-01',
    dueDate: '2025-02-01', isRecurring: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvoiceService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  describe('getAll()', () => {
    it('should GET /invoices and return list', async () => {
      const promise = firstValueFrom(service.getAll());
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([sampleInvoice]);
      const invoices = await promise;
      expect(invoices.length).toBe(1);
      expect(invoices[0].clientName).toBe('Acme Corp');
    });
  });

  describe('getPaged()', () => {
    it('should GET /invoices/page with pagination params', async () => {
      const promise = firstValueFrom(service.getPaged(0, 10, 'invoiceDate,desc'));
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/page`);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({ content: [sampleInvoice], totalElements: 1, totalPages: 1, size: 10, number: 0 });
      const page = await promise;
      expect(page.totalElements).toBe(1);
    });
  });

  describe('search()', () => {
    it('should GET /invoices/search with filters', async () => {
      const promise = firstValueFrom(service.search({ q: 'Acme', status: 'PAID', page: 0, size: 20 }));
      const req = httpMock.expectOne(r => r.url === `${baseUrl}/search`);
      expect(req.request.params.get('q')).toBe('Acme');
      expect(req.request.params.get('status')).toBe('PAID');
      req.flush({ content: [sampleInvoice], totalElements: 1, totalPages: 1, size: 20, number: 0 });
      const page = await promise;
      expect(page.content.length).toBe(1);
    });
  });

  describe('create()', () => {
    it('should POST to /invoices', async () => {
      const req_body = { clientName: 'Acme Corp', amount: 1500, status: 'PENDING' as InvoiceStatus, dueDate: '2025-02-01' };
      const promise = firstValueFrom(service.create(req_body));
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush(sampleInvoice);
      const inv = await promise;
      expect(inv.clientName).toBe('Acme Corp');
    });
  });

  describe('delete()', () => {
    it('should DELETE /invoices/:id', async () => {
      const promise = firstValueFrom(service.delete(1));
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await promise;
    });
  });

  describe('bulkUpdateStatus()', () => {
    it('should PATCH /invoices/bulk-status', async () => {
      const promise = firstValueFrom(service.bulkUpdateStatus([1, 2], 'PAID'));
      const req = httpMock.expectOne(`${baseUrl}/bulk-status`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ updated: 2 });
      const res = await promise;
      expect(res.updated).toBe(2);
    });
  });
});

