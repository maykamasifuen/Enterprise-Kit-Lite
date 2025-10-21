import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      @switch (type) {
        @case ('card') {
          <div class="skeleton-card">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line subtitle"></div>
            <div class="skeleton-line value"></div>
          </div>
        }
        @case ('table-row') {
          <div class="skeleton-table-row">
            @for (col of [1,2,3,4,5]; track col) {
              <div class="skeleton-cell"></div>
            }
          </div>
        }
        @case ('chart') {
          <div class="skeleton-chart">
            <div class="skeleton-bars">
              @for (bar of [1,2,3,4,5,6]; track bar) {
                <div class="skeleton-bar" [style.height.%]="getRandomHeight()"></div>
              }
            </div>
          </div>
        }
        @default {
          <div class="skeleton-line" [style.width]="width" [style.height]="height"></div>
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    .skeleton-line {
      background: linear-gradient(90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0.05) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-card {
      padding: 1.5rem;
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;

      .title {
        width: 60%;
        height: 1rem;
        margin-bottom: 0.75rem;
      }

      .subtitle {
        width: 40%;
        height: 0.75rem;
        margin-bottom: 1rem;
      }

      .value {
        width: 80%;
        height: 2rem;
      }
    }

    .skeleton-table-row {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .skeleton-cell {
      flex: 1;
      height: 1rem;
      background: linear-gradient(90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0.05) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-chart {
      height: 200px;
      padding: 1rem;
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .skeleton-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 100%;
      gap: 1rem;
    }

    .skeleton-bar {
      flex: 1;
      background: linear-gradient(180deg,
        rgba(255,255,255,0.1) 0%,
        rgba(255,255,255,0.05) 100%
      );
      border-radius: 4px 4px 0 0;
      animation: pulse 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'table-row' | 'chart' | 'line' = 'line';
  @Input() width = '100%';
  @Input() height = '1rem';

  getRandomHeight(): number {
    return Math.floor(Math.random() * 60) + 40;
  }
}
