import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule, TagModule, TranslateModule],
  template: `
    <p-tag
      [value]="roleLabel"
      [severity]="roleSeverity"
      [rounded]="true"
      styleClass="role-badge role-badge--{{ role.toLowerCase() }}" />
  `,
  styles: [`
    :host { display: inline-flex; }
    :host ::ng-deep .role-badge { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em; }
  `]
})
export class RoleBadgeComponent {
  @Input() role: string = '';

  get roleLabel(): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: '⚡ Super Admin',
      ADMIN: '🛡 Admin',
      USER: '👤 User'
    };
    return map[this.role] ?? this.role;
  }

  get roleSeverity(): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (this.role) {
      case 'SUPER_ADMIN': return 'danger';
      case 'ADMIN':       return 'warn';
      case 'USER':        return 'success';
      default:            return 'secondary';
    }
  }
}

