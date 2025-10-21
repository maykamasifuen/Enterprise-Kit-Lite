import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { InvoiceService } from '../../invoices/invoice.service';
import { Invoice } from '../../invoices/invoice.model';
import { CustomerService, Customer, PageResponse } from '../../services/customer.service';
import { debounceTime, Subject } from 'rxjs';

interface SearchResult {
  type: 'invoice' | 'customer';
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="global-search">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input
          pInputText
          [(ngModel)]="searchQuery"
          [placeholder]="'SEARCH.PLACEHOLDER' | translate"
          (input)="onSearchInput()"
          (focus)="showResults = true"
          class="search-input" />
      </span>

      @if (showResults && (results().length > 0 || searching())) {
        <div class="search-results" (click)="$event.stopPropagation()">
          @if (searching()) {
            <div class="loading-item">
              <i class="pi pi-spin pi-spinner"></i>
              {{ 'SEARCH.SEARCHING' | translate }}
            </div>
          } @else {
            @for (result of results(); track result.id + result.type) {
              <div class="result-item" (click)="navigateToResult(result)">
                <i [class]="result.icon"></i>
                <div class="result-content">
                  <span class="result-title">{{ result.title }}</span>
                  <span class="result-subtitle">{{ result.subtitle }}</span>
                </div>
              </div>
            }
            @if (results().length === 0 && !searching()) {
              <div class="no-results">
                {{ 'SEARCH.NO_RESULTS' | translate }}
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .global-search {
      position: relative;
    }

    .search-input {
      width: 250px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .search-input:focus {
      border-color: var(--primary-color);
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.5rem;
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .result-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .result-item i {
      font-size: 1.25rem;
      color: var(--primary-color);
      width: 24px;
    }

    .result-content {
      display: flex;
      flex-direction: column;
    }

    .result-title {
      color: #ffffff;
      font-weight: 500;
    }

    .result-subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .loading-item, .no-results {
      padding: 1rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
    }

    .loading-item i {
      margin-right: 0.5rem;
    }
  `]
})
export class GlobalSearchComponent {
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  searchQuery = '';
  showResults = false;
  searching = signal(false);
  results = signal<SearchResult[]>([]);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe((query: string) => {
      this.performSearch(query);
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.length >= 2) {
      this.searching.set(true);
      this.searchSubject.next(this.searchQuery);
    } else {
      this.results.set([]);
    }
  }

  private performSearch(query: string): void {
    const searchResults: SearchResult[] = [];
    let pendingRequests = 2;

    const checkComplete = () => {
      pendingRequests--;
      if (pendingRequests === 0) {
        this.results.set(searchResults);
        this.searching.set(false);
      }
    };

    // Search invoices
    this.invoiceService.getAll().subscribe({
      next: (invoices: Invoice[]) => {
        const matchingInvoices = invoices
          .filter((inv: Invoice) =>
            inv.clientName.toLowerCase().includes(query.toLowerCase()) ||
            inv.id.toString().includes(query)
          )
          .slice(0, 5)
          .map((inv: Invoice) => ({
            type: 'invoice' as const,
            id: inv.id,
            title: `#${inv.id} - ${inv.clientName}`,
            subtitle: `$${inv.amount} - ${inv.status}`,
            icon: 'pi pi-receipt'
          }));
        searchResults.push(...matchingInvoices);
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Search customers
    this.customerService.searchCustomers(query, 0, 5).subscribe({
      next: (response: PageResponse<Customer>) => {
        const matchingCustomers = response.content.map((cust: Customer) => ({
          type: 'customer' as const,
          id: cust.id,
          title: cust.name,
          subtitle: cust.email || cust.phone || '',
          icon: 'pi pi-user'
        }));
        searchResults.push(...matchingCustomers);
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  navigateToResult(result: SearchResult): void {
    this.showResults = false;
    this.searchQuery = '';

    if (result.type === 'invoice') {
      this.router.navigate(['/invoices'], { queryParams: { highlight: result.id } });
    } else {
      this.router.navigate(['/customers'], { queryParams: { highlight: result.id } });
    }
  }
}
