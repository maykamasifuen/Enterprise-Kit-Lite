import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ButtonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="error-code">500</div>
        <h1>{{ 'ERRORS.SERVER_ERROR' | translate }}</h1>
        <p>{{ 'ERRORS.SERVER_ERROR_DESC' | translate }}</p>

        @if (errorMessage) {
          <div class="error-details">
            <code>{{ errorMessage }}</code>
          </div>
        }

        <div class="error-actions">
          <p-button
            [label]="'ERRORS.TRY_AGAIN' | translate"
            icon="pi pi-refresh"
            (onClick)="reload()"
            styleClass="p-button-lg" />
          <p-button
            [label]="'ERRORS.GO_HOME' | translate"
            icon="pi pi-home"
            routerLink="/dashboard"
            styleClass="p-button-lg p-button-outlined" />
        </div>

        <div class="support-section">
          <p>{{ 'ERRORS.PERSIST_CONTACT' | translate }}</p>
          <a href="mailto:support@example.com">support&#64;example.com</a>
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

    .error-icon i {
      font-size: 5rem;
      color: #ef4444;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .error-code {
      font-size: 6rem;
      font-weight: 800;
      color: #ef4444;
      line-height: 1;
      margin: 1rem 0;
    }

    h1 {
      color: var(--app-text-primary, #1e293b);
      font-size: 1.75rem;
      margin: 1rem 0;
    }

    p {
      color: var(--app-text-secondary, #64748b);
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .error-details {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 2rem;
    }

    .error-details code {
      color: #fca5a5;
      font-size: 0.85rem;
      word-break: break-all;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .support-section {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .support-section p {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .support-section a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .support-section a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .error-code {
        font-size: 4rem;
      }

      h1 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ServerErrorComponent {
  @Input() errorMessage?: string;

  reload(): void {
    window.location.reload();
  }
}
