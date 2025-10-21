import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { NavbarComponent } from './navbar/navbar.component';
import { LanguageService } from './services/language.service';
import { SettingsService } from './services/settings.service';
import { TokenStorageService } from './services/token-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule, NavbarComponent],
  template: `
    <p-toast></p-toast>
    <div class="app-shell">
      <div class="app-body">
        <!-- Only show navbar when authenticated -->
        <app-navbar *ngIf="isAuthenticated()"></app-navbar>
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('enterprise-starter-kit-frontend');

  // Injected for side-effect initialization (they auto-init from localStorage)
  private readonly _lang = inject(LanguageService);
  private readonly _settings = inject(SettingsService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  isAuthenticated = signal(false);

  ngOnInit(): void {
    // Services initialize themselves — ensure they are eagerly constructed
    void (this._lang && this._settings);

    // Check initial authentication state
    this.updateAuthState();

    // Listen for auth changes
    this.tokenStorage.onAuthChanged(() => {
      this.updateAuthState();
    });
  }

  private updateAuthState(): void {
    this.isAuthenticated.set(this.tokenStorage.hasValidToken());
  }
}

