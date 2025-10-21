import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ButtonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1>{{ 'ERRORS.PAGE_NOT_FOUND' | translate }}</h1>
        <p>{{ 'ERRORS.PAGE_NOT_FOUND_DESC' | translate }}</p>

        <div class="error-actions">
          <p-button
            [label]="'ERRORS.GO_HOME' | translate"
            icon="pi pi-home"
            routerLink="/dashboard"
            styleClass="p-button-lg" />
          <p-button
            [label]="'ERRORS.GO_BACK' | translate"
            icon="pi pi-arrow-left"
            (onClick)="goBack()"
            styleClass="p-button-lg p-button-outlined" />
        </div>

        <div class="error-illustration">
          <i class="pi pi-search"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      max-width: 500px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: 800;
      color: var(--primary-color);
      line-height: 1;
      text-shadow: 0 0 40px rgba(var(--primary-color-rgb), 0.3);
    }

    h1 {
      color: var(--app-text-primary, #1e293b);
      font-size: 2rem;
      margin: 1rem 0;
    }

    p {
      color: var(--app-text-secondary, #64748b);
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-illustration {
      margin-top: 3rem;
    }

    .error-illustration i {
      font-size: 6rem;
      color: var(--app-text-muted, #64748b);
      opacity: 0.3;
    }

    @media (max-width: 480px) {
      .error-code {
        font-size: 5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
