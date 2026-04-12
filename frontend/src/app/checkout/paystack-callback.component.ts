import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../services/payement';

@Component({
  selector: 'app-paystack-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="callback-container">
      <div *ngIf="loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Verifying your payment...</p>
      </div>
      <div *ngIf="success" class="success-message">
        <i class="fa-solid fa-check-circle"></i>
        <h2>Payment Successful!</h2>
        <p>Your order has been confirmed.</p>
        <a routerLink="/profilepage" class="btn">View Orders</a>
      </div>
      <div *ngIf="error" class="error-message">
        <i class="fa-solid fa-times-circle"></i>
        <h2>Payment Verification Failed</h2>
        <p>{{ error }}</p>
        <a routerLink="/checkout" class="btn">Return to Checkout</a>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      text-align: center;
    }
    .loading i { font-size: 2rem; color: var(--color-primary, #b08968); }
    .loading p { margin-top: 1rem; font-size: 1.1rem; }
    .success-message i { font-size: 3rem; color: #28a745; }
    .success-message h2 { margin: 1rem 0 0.5rem; }
    .error-message i { font-size: 3rem; color: #dc3545; }
    .error-message h2 { margin: 1rem 0 0.5rem; }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: var(--color-primary, #b08968);
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
    }
  `]
})
export class PaystackCallbackComponent implements OnInit {
  loading = true;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const reference = this.route.snapshot.queryParamMap.get('reference') ||
                      this.route.snapshot.queryParamMap.get('trxref');
    if (!reference) {
      this.loading = false;
      this.error = 'No payment reference found.';
      return;
    }

    this.paymentService.verifyPaystackPayment(reference).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status === 'success') {
          this.success = true;
        } else {
          this.error = 'Payment is still pending. Please check your order status later.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to verify payment.';
      }
    });
  }
}
