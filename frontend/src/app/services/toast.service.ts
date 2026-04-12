import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  private removeSubject = new Subject<number>();
  remove$ = this.removeSubject.asObservable();

  success(message: string, duration = 3500): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3500): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: Toast['type'], duration: number): void {
    this.toastSubject.next({ id: ++this.counter, message, type, duration });
  }

  dismiss(id: number): void {
    this.removeSubject.next(id);
  }
}
