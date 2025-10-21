import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

/**
 * Reusable empty-state component.
 * Use inside table/list templates when data is empty and not loading.
 *
 * @example
 * <app-empty-state
 *   icon="pi-receipt"
 *   titleKey="INVOICES.NO_INVOICES"
 *   actionKey="INVOICES.CREATE_INVOICE"
 *   (action)="openCreateDialog()" />
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule],
  template: `
    <div class="empty-state">
      <i class="pi {{ icon }} empty-state__icon"></i>
      <h3 class="empty-state__title">{{ titleKey | translate }}</h3>
      @if (subtitleKey) {
        <p class="empty-state__subtitle">{{ subtitleKey | translate }}</p>
      }
      @if (actionKey) {
        <p-button
          [label]="actionKey | translate"
          icon="pi pi-plus"
          (onClick)="action.emit()" />
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      gap: 1rem;
    }
    .empty-state__icon {
      font-size: 3.5rem;
      opacity: .25;
      color: var(--primary-color);
    }
    .empty-state__title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      opacity: .75;
    }
    .empty-state__subtitle {
      margin: 0;
      opacity: .55;
      font-size: .9rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'pi-inbox';
  @Input() titleKey = 'COMMON.NO_DATA';
  @Input() subtitleKey?: string;
  @Input() actionKey?: string;
  @Output() action = new EventEmitter<void>();
}

