import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from '../services/api.service';

export interface CatalogItem {
  id?: number;
  name: string;
  description?: string;
  unitPrice: number;
  unit?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    TableModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule,
    ToggleButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ 'CATALOG.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'CATALOG.SUBTITLE' | translate }}</p>
        </div>
        <button pButton icon="pi pi-plus" [label]="'CATALOG.ADD' | translate" (click)="openNew()"></button>
      </div>

      <p-table [value]="items()" [loading]="loading()" responsiveLayout="scroll"
               styleClass="p-datatable-sm" [rowHover]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>{{ 'CATALOG.NAME' | translate }}</th>
            <th>{{ 'CATALOG.DESCRIPTION' | translate }}</th>
            <th>{{ 'CATALOG.UNIT_PRICE' | translate }}</th>
            <th>{{ 'CATALOG.UNIT' | translate }}</th>
            <th>{{ 'CATALOG.ACTIVE' | translate }}</th>
            <th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.unitPrice | number:'1.2-2' }}</td>
            <td>{{ item.unit }}</td>
            <td>
              <span [class]="item.isActive ? 'badge badge-success' : 'badge badge-danger'">
                {{ (item.isActive ? 'CATALOG.ACTIVE' : 'CATALOG.INACTIVE') | translate }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editItem(item)"></button>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteItem(item)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogVisible" [header]="editingItem()?.id ? ('CATALOG.EDIT' | translate) : ('CATALOG.ADD' | translate)"
              [modal]="true" [style]="{width:'min(500px, 95vw)'}">
      <div class="form-grid" *ngIf="editingItem()">
        <div class="field">
          <label>{{ 'CATALOG.NAME' | translate }}</label>
          <input pInputText [(ngModel)]="editingItem()!.name" class="w-full" />
        </div>
        <div class="field">
          <label>{{ 'CATALOG.DESCRIPTION' | translate }}</label>
          <input pInputText [(ngModel)]="editingItem()!.description" class="w-full" />
        </div>
        <div class="field">
          <label>{{ 'CATALOG.UNIT_PRICE' | translate }}</label>
          <p-inputNumber [(ngModel)]="editingItem()!.unitPrice" mode="decimal" [minFractionDigits]="2" class="w-full" />
        </div>
        <div class="field">
          <label>{{ 'CATALOG.UNIT' | translate }}</label>
          <input pInputText [(ngModel)]="editingItem()!.unit" class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton [label]="'COMMON.CANCEL' | translate" class="p-button-text" (click)="dialogVisible=false"></button>
        <button pButton [label]="'COMMON.SAVE' | translate" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container { padding: 1.5rem; box-sizing:border-box; width:100%; }
    @media (max-width:768px) { .page-container { padding: 1rem 0.75rem; } }
    @media (max-width:480px) { .page-container { padding: 0.75rem 0.5rem; } }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:.75rem; }
    .subtitle { color: var(--app-text-secondary, #64748b); margin-top:.25rem; }
    .field { margin-bottom:1rem; }
    .field label { display:block; margin-bottom:.5rem; font-weight:500; }
    .badge { padding:.25rem .75rem; border-radius:12px; font-size:.8rem; }
    .badge-success { background:#d1fae5; color:#065f46; }
    .badge-danger { background:#fee2e2; color:#991b1b; }
  `]
})
export class CatalogComponent implements OnInit {
  private api = inject(ApiService);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);

  items = signal<CatalogItem[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editingItem = signal<CatalogItem | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get<CatalogItem[]>('/catalog').subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openNew() {
    this.editingItem.set({ name: '', unitPrice: 0, isActive: true });
    this.dialogVisible = true;
  }

  editItem(item: CatalogItem) {
    this.editingItem.set({ ...item });
    this.dialogVisible = true;
  }

  save() {
    const item = this.editingItem()!;
    const req = item.id
      ? this.api.put<CatalogItem>(`/catalog/${item.id}`, item)
      : this.api.post<CatalogItem>('/catalog', item);
    req.subscribe({
      next: () => { this.dialogVisible = false; this.load(); this.msg.add({ severity:'success', summary:'Saved' }); },
      error: () => this.msg.add({ severity:'error', summary:'Error saving item' })
    });
  }

  deleteItem(item: CatalogItem) {
    this.confirm.confirm({
      message: 'Delete this catalog item?',
      accept: () => this.api.delete(`/catalog/${item.id}`).subscribe({ next: () => this.load() })
    });
  }
}

