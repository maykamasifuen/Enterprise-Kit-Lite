import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ButtonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="pi pi-ban"></i>
        </div>
        <div class="error-code">403</div>
        <h1>{{ 'ERRORS.ACCESS_DENIED' | translate }}</h1>
        <p>{{ 'ERRORS.ACCESS_DENIED_DESC' | translate }}</p>

        <div class="error-actions">
          <p-button
            [label]="'ERRORS.GO_HOME' | translate"
            icon="pi pi-home"
            routerLink="/dashboard"
            styleClass="p-button-lg" />
          <p-button
            [label]="'ERRORS.CONTACT_ADMIN' | translate"
            icon="pi pi-envelope"
            (onClick)="contactAdmin()"
            styleClass="p-button-lg p-button-outlined" />
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
      color: #f97316;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 800;
      color: #f97316;
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
      margin-bottom: 2rem;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
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
export class ForbiddenComponent {
  contactAdmin(): void {
    window.location.href = 'mailto:admin@example.com?subject=Access Request';
  }
}
