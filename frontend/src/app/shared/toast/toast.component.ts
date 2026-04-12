import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="status" aria-live="polite">
      <div
        *ngFor="let toast of toasts; trackBy: trackById"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        [class.toast-warning]="toast.type === 'warning'"
        [class.toast-exit]="exitingIds.has(toast.id)"
        (click)="dismiss(toast.id)">
        <i class="fa-solid" [ngClass]="iconMap[toast.type]"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close" aria-label="Dismiss">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
      width: calc(100% - 40px);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      color: #fff;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.9rem;
      cursor: pointer;
      animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      backdrop-filter: blur(12px);
    }
    .toast-exit {
      animation: slideOut 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards;
    }
    .toast-success { background: rgba(39, 174, 96, 0.92); }
    .toast-error   { background: rgba(235, 77, 75, 0.92); }
    .toast-info    { background: rgba(52, 152, 219, 0.92); }
    .toast-warning { background: rgba(243, 156, 18, 0.92); }
    .toast i { font-size: 1.1rem; flex-shrink: 0; }
    .toast span { flex: 1; }
    .toast-close {
      background: none; border: none; color: rgba(255,255,255,0.7);
      font-size: 1.3rem; cursor: pointer; padding: 0 0.25rem;
      line-height: 1; transition: color 0.2s;
    }
    .toast-close:hover { color: #fff; }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0);    opacity: 1; }
      to   { transform: translateX(120%); opacity: 0; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  exitingIds = new Set<number>();
  iconMap: Record<string, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };
  private subs = new Subscription();
  private timers = new Map<number, any>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subs.add(
      this.toastService.toast$.subscribe(toast => {
        this.toasts.push(toast);
        const timer = setTimeout(() => this.dismiss(toast.id), toast.duration);
        this.timers.set(toast.id, timer);
      })
    );
    this.subs.add(
      this.toastService.remove$.subscribe(id => this.dismiss(id))
    );
  }

  dismiss(id: number): void {
    if (this.exitingIds.has(id)) return;
    this.exitingIds.add(id);
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.exitingIds.delete(id);
    }, 300);
  }

  trackById(_: number, toast: Toast): number { return toast.id; }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.timers.forEach(t => clearTimeout(t));
  }
}
