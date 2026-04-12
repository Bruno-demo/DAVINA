import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  responseMessage = '';
  isLoading = false;

  otpStep = false;
  otpUserId: number | null = null;
  otpCode = '';
  needsVerification = false;
  showPassword = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toastService: ToastService,
    private cartService: CartService
  ) {}

  login(form: NgForm): void {
    if (!form.valid) {
      this.responseMessage = 'Please fill out all fields correctly.';
      return;
    }
    this.isLoading = true;
    this.responseMessage = '';

    this.authService.loginStep1(this.credentials).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.otpRequired) {
          this.otpStep = true;
          this.otpUserId = res.userId;
          this.toastService.info('A 6-digit code has been sent to your email.');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.status === 403 && error.error?.needsVerification) {
          this.needsVerification = true;
          this.responseMessage = error.error.message;
        } else if (error.status === 401 || error.status === 404) {
          this.responseMessage = 'Invalid email or password.';
        } else {
          this.responseMessage = error.error?.message || 'Login failed. Please try again.';
        }
        this.toastService.error(this.responseMessage);
      },
    });
  }

  submitOtp(): void {
    if (!this.otpCode || !this.otpUserId) return;
    this.isLoading = true;
    this.responseMessage = '';

    this.authService.verifyOtp(this.otpUserId, this.otpCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Welcome back!');
        // Merge guest cart into backend cart
        this.cartService.mergeGuestCart().subscribe({
          complete: () => {
            const role = this.authService.getDecodedToken()?.role;
            this.router.navigate([role?.toLowerCase() === 'admin' ? '/adminpage' : '/']);
          },
          error: () => {
            const role = this.authService.getDecodedToken()?.role;
            this.router.navigate([role?.toLowerCase() === 'admin' ? '/adminpage' : '/']);
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.responseMessage = err.error?.message || 'Invalid or expired code.';
        this.toastService.error(this.responseMessage);
      },
    });
  }

  resendCode(): void {
    if (!this.credentials.email || !this.credentials.password) return;
    this.authService.loginStep1(this.credentials).subscribe({ error: () => {} });
    this.toastService.info('A new code has been sent to your email.');
  }

  backToLogin(): void {
    this.otpStep = false;
    this.otpCode = '';
    this.responseMessage = '';
    this.needsVerification = false;
  }

  resendVerification(): void {
    this.authService.resendVerificationEmail(this.credentials.email).subscribe({
      next: (r: any) => this.toastService.success(r.message),
      error: () => this.toastService.error('We couldn\'t resend the email right now. Please try again later.'),
    });
  }
}
