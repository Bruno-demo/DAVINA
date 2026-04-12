import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-brand">
        <div class="brand-mark">DB</div>
        <span class="brand-name">Davina Beauty</span>
      </div>

      <ng-container *ngIf="!done && tokenPresent">
        <div class="rp-icon"><i class="fa-solid fa-key"></i></div>
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">Choose a new password for your account.</p>

        <form #rpForm="ngForm" (ngSubmit)="submit(rpForm)" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="rp-pw">New password</label>
            <div class="input-wrap">
              <input id="rp-pw" class="form-input" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password"
                name="password" placeholder="Min. 8 characters" required minlength="8" />
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword" tabindex="-1">
                <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="rp-cpw">Confirm password</label>
            <div class="input-wrap">
              <input id="rp-cpw" class="form-input" [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword"
                name="confirmPassword" placeholder="Repeat password" required />
              <button type="button" class="toggle-pw" (click)="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                <i class="fa-solid" [ngClass]="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <div *ngIf="errorMsg" class="error-banner">
            <i class="fa-solid fa-circle-exclamation"></i> {{ errorMsg }}
          </div>

          <button class="btn-auth" type="submit" [disabled]="isLoading">
            <span *ngIf="!isLoading">Set new password</span>
            <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Saving…</span>
          </button>
        </form>
      </ng-container>

      <ng-container *ngIf="!tokenPresent">
        <div class="error-icon"><i class="fa-solid fa-link-slash"></i></div>
        <h1 class="auth-title">Invalid link</h1>
        <p class="auth-subtitle">This password reset link is missing or invalid.</p>
      </ng-container>

      <ng-container *ngIf="done">
        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
        <h1 class="auth-title">Password updated!</h1>
        <p class="auth-subtitle">You can now sign in with your new password.</p>
      </ng-container>

      <div class="auth-divider"></div>
      <div class="auth-footer">
        <a routerLink="/login" class="btn-auth-secondary">Go to sign in</a>
      </div>

    </div>
  </div>
  `,
  styleUrls: ['../login/login.component.css'],
  styles: [`
    .rp-icon, .success-icon, .error-icon {
      font-size: 2.2rem;
      text-align: center;
      color: #f24901;
      margin-bottom: 0.5rem;
    }
    .success-icon { color: #16a34a; }
    .error-icon { color: #dc2626; }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-wrap .form-input { padding-right: 2.75rem; }
    .toggle-pw {
      position: absolute; right: .75rem; background: none; border: none;
      cursor: pointer; color: #999; font-size: .95rem; padding: 0;
      line-height: 1; transition: color .2s;
    }
    .toggle-pw:hover { color: #1a1a1a; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  tokenPresent = false;
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMsg = '';
  done = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.tokenPresent = !!this.token;
  }

  submit(form: NgForm): void {
    if (!form.valid) return;
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match. Please make sure both passwords are the same.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMsg = 'Password must be at least 8 characters long.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => { this.isLoading = false; this.done = true; },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Password reset failed. The link may have expired. Please request a new one.';
      },
    });
  }
}
