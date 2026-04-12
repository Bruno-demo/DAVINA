import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-brand">
        <div class="brand-mark">DB</div>
        <span class="brand-name">Davina Beauty</span>
      </div>

      <ng-container *ngIf="!sent">
        <div class="fp-icon"><i class="fa-solid fa-lock-open"></i></div>
        <h1 class="auth-title">Forgot password?</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        <form #fpForm="ngForm" (ngSubmit)="submit(fpForm)" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="fp-email">Email address</label>
            <input id="fp-email" class="form-input" type="email" [(ngModel)]="email"
              name="email" placeholder="you@example.com" required autocomplete="email" />
          </div>

          <div *ngIf="errorMsg" class="error-banner">
            <i class="fa-solid fa-circle-exclamation"></i> {{ errorMsg }}
          </div>

          <button class="btn-auth" type="submit" [disabled]="isLoading">
            <span *ngIf="!isLoading">Send reset link</span>
            <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Sending…</span>
          </button>
        </form>
      </ng-container>

      <ng-container *ngIf="sent">
        <div class="success-icon"><i class="fa-solid fa-envelope-circle-check"></i></div>
        <h1 class="auth-title">Check your inbox</h1>
        <p class="auth-subtitle">If an account exists for <strong>{{ email }}</strong>, a reset link has been sent. Check spam if you don't see it.</p>
      </ng-container>

      <div class="auth-divider"><span>Remember your password?</span></div>
      <div class="auth-footer">
        <a routerLink="/login" class="btn-auth-secondary">Back to sign in</a>
      </div>

    </div>
  </div>
  `,
  styleUrls: ['../login/login.component.css'],
  styles: [`
    .fp-icon, .success-icon {
      font-size: 2.2rem;
      text-align: center;
      color: #f24901;
      margin-bottom: 0.5rem;
    }
    .success-icon { color: #16a34a; }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  errorMsg = '';
  sent = false;

  constructor(private authService: AuthenticationService) {}

  submit(form: NgForm): void {
    if (!form.valid) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => { this.isLoading = false; this.sent = true; },
      error: () => { this.isLoading = false; this.errorMsg = 'Something went wrong. Please try again later.'; },
    });
  }
}
