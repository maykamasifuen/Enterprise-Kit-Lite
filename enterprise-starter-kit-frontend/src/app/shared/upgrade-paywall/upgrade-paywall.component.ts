import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  imports: [ButtonModule, CommonModule],
  selector: 'app-upgrade-paywall',
  template: `
    <div class="paywall-container">
      <div class="paywall-card">

        <!-- Diamond icon -->
        <div class="paywall-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 9L12 22L22 9L12 2Z"
                  fill="url(#grad)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
            <defs>
              <linearGradient id="grad" x1="2" y1="2" x2="22" y2="22">
                <stop offset="0%" stop-color="#818cf8"/>
                <stop offset="100%" stop-color="#6366f1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 class="paywall-title">Premium Feature</h1>

        <p class="paywall-module" *ngIf="moduleName">{{ moduleName }}</p>

        <p class="paywall-desc">
          This module is only available in the <strong>Pro / Agency</strong> versions
          of the Mayk Enterprise Kit. Save 3+ months of development time and upgrade today.
        </p>

        <ul class="paywall-features">
          <li>🤖 AI Chatbot (Ollama / Spring AI)</li>
          <li>💳 Stripe Billing & Subscriptions</li>
          <li>📊 JasperReports PDF Generation</li>
          <li>📝 Audit Logs & Activity Tracking</li>
          <li>🔔 Real-Time WebSocket Notifications</li>
          <li>🔏 GDPR Data Export</li>
          <li>🔐 2FA, OAuth2, API Keys</li>
          <li>📎 Cloud File Attachments</li>
          <li>🔗 Secure Customer Portals & Magic Links</li>
        </ul>

        <a href="https://mahmoudfarouk28.gumroad.com/l/mayk-enterprise-kit-V5-solo"
           target="_blank" rel="noopener noreferrer">
          <p-button
                  label="Upgrade on Gumroad 🚀"
                  styleClass="paywall-btn"
                  [style]="{ width: '100%' }">
          </p-button>
        </a>

        <p class="paywall-sub">One-time payment · No subscriptions · Instant access</p>

      </div>
    </div>
  `,
  styles: [`
    .paywall-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 75vh;
      padding: 2rem;
    }

    .paywall-card {
      max-width: 520px;
      width: 100%;
      text-align: center;
      padding: 3rem 2.5rem;
      border-radius: 20px;
      background: var(--app-card-bg, rgba(30, 30, 46, 0.95));
      border: 1px solid var(--app-surface-border, rgba(255,255,255,0.08));
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    :host-context(.light-theme) .paywall-card,
    :host-context(body:not(.dark-theme)) .paywall-card {
      background: rgba(255,255,255,0.95);
      border-color: #e2e8f0;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    }

    .paywall-icon {
      margin-bottom: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .paywall-module {
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary-color, #818cf8);
      margin: 0 0 0.75rem;
      letter-spacing: 0.02em;
    }

    :host-context(.light-theme) .paywall-module,
    :host-context(body:not(.dark-theme)) .paywall-module {
      color: #6366f1;
    }

    .paywall-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      background: linear-gradient(135deg, #818cf8, #6366f1, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    :host-context(.light-theme) .paywall-title,
    :host-context(body:not(.dark-theme)) .paywall-title {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .paywall-desc {
      color: var(--app-text-secondary, rgba(255,255,255,0.65));
      line-height: 1.6;
      margin: 0 0 1.5rem;
      font-size: 0.95rem;
    }

    .paywall-desc strong {
      color: var(--app-text-primary, #f1f5f9);
    }

    .paywall-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem;
      text-align: left;
    }

    .paywall-features li {
      padding: 0.5rem 0;
      color: var(--app-text-secondary, rgba(255,255,255,0.7));
      font-size: 0.9rem;
      border-bottom: 1px solid var(--app-surface-border, rgba(255,255,255,0.06));
    }

    .paywall-features li:last-child {
      border-bottom: none;
    }

    :host ::ng-deep .paywall-btn {
      background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
      border: none !important;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.85rem 2rem;
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    :host ::ng-deep .paywall-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4) !important;
    }

    .paywall-sub {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--app-text-muted, rgba(255,255,255,0.4));
    }
  `]
})
export class UpgradePaywallComponent {
  moduleName: string | null = null;

  private route = inject(ActivatedRoute);

  constructor() {
    this.moduleName = this.route.snapshot.data?.['moduleName'] ?? null;
  }
}
