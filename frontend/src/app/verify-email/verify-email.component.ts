import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-brand">
        <div class="brand-mark">DB</div>
        <span class="brand-name">Davina Beauty</span>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="ve-state">
        <i class="fa-solid fa-spinner fa-spin ve-icon"></i>
        <h1 class="auth-title">Verifying…</h1>
        <p class="auth-subtitle">Please wait while we verify your email address.</p>
      </div>

      <!-- Success -->
      <div *ngIf="!isLoading && success" class="ve-state">
        <i class="fa-solid fa-circle-check ve-icon" style="color:#16a34a"></i>
        <h1 class="auth-title">Email verified!</h1>
        <p class="auth-subtitle">Your account is now active. You can sign in.</p>
        <a routerLink="/login" class="btn-auth" style="text-decoration:none;text-align:center;display:block;margin-top:1rem;">Sign in</a>
      </div>

      <!-- Error -->
      <div *ngIf="!isLoading && !success" class="ve-state">
        <i class="fa-solid fa-circle-xmark ve-icon" style="color:#dc2626"></i>
        <h1 class="auth-title">Verification failed</h1>
        <p class="auth-subtitle">{{ errorMsg }}</p>
        <a routerLink="/login" class="btn-auth-secondary" style="text-decoration:none;text-align:center;display:block;margin-top:1rem;">Back to sign in</a>
      </div>

    </div>
  </div>
  `,
  styleUrls: ['../login/login.component.css'],
  styles: [`
    .ve-state { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .ve-icon { font-size: 2.8rem; color: #f24901; margin-bottom: 1rem; }
  `]
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  success = false;
  errorMsg = 'This verification link is no longer valid or has expired. Please request a new one.';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isLoading = false;
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => { this.isLoading = false; this.success = true; },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || this.errorMsg;
      },
    });
  }
}
