import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngStyle]="wrapperStyle">
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton-img shimmer"></div>
        <div class="skeleton-text-group">
          <div class="skeleton-line w-70 shimmer"></div>
          <div class="skeleton-line w-40 shimmer"></div>
          <div class="skeleton-line w-50 shimmer"></div>
        </div>
      </div>
      <div *ngIf="type === 'text'" class="skeleton-text-group">
        <div *ngFor="let _ of lines" class="skeleton-line shimmer" [ngStyle]="{'width': randomWidth()}"></div>
      </div>
      <div *ngIf="type === 'circle'" class="skeleton-circle shimmer"></div>
      <div *ngIf="type === 'rect'" class="skeleton-rect shimmer" [ngStyle]="{'height': height}"></div>
    </div>
  `,
  styles: [`
    .shimmer {
      background: linear-gradient(90deg, #e8e5e0 25%, #f5f3f0 50%, #e8e5e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 8px;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton-card {
      border-radius: 16px;
      overflow: hidden;
      background: var(--color-white, #fff);
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .skeleton-img { height: 220px; border-radius: 0; }
    .skeleton-text-group { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; }
    .skeleton-line { height: 14px; border-radius: 6px; }
    .w-70 { width: 70%; }
    .w-40 { width: 40%; }
    .w-50 { width: 50%; }
    .skeleton-circle { width: 48px; height: 48px; border-radius: 50%; }
    .skeleton-rect { width: 100%; border-radius: 8px; }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'text' | 'circle' | 'rect' = 'card';
  @Input() count = 1;
  @Input() height = '120px';
  @Input() wrapperStyle: Record<string, string> = {};

  get lines(): number[] { return Array(this.count).fill(0); }

  randomWidth(): string {
    return (50 + Math.random() * 40) + '%';
  }
}
