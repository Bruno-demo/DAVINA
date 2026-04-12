import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftCardService } from '../services/gift-card.service';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-cards.component.html',
  styleUrls: ['./gift-cards.component.css'],
})
export class GiftCardsComponent {
  activeTab: 'purchase' | 'balance' = 'purchase';

  // Purchase form
  amount = 25;
  senderEmail = '';
  recipientEmail = '';
  recipientName = '';
  message = '';
  purchaseLoading = false;
  purchaseSuccess = '';
  purchaseError = '';

  // Balance check
  balanceCode = '';
  balanceResult: { code: string; balance: number; expires_at: string } | null = null;
  balanceLoading = false;
  balanceError = '';

  presetAmounts = [10, 25, 50, 75, 100];

  constructor(private giftCardService: GiftCardService) {}

  selectAmount(val: number): void {
    this.amount = val;
  }

  purchaseGiftCard(): void {
    if (!this.senderEmail || !this.recipientEmail || !this.amount) return;
    this.purchaseLoading = true;
    this.purchaseSuccess = '';
    this.purchaseError = '';

    this.giftCardService
      .purchase({
        amount: this.amount,
        sender_email: this.senderEmail,
        recipient_email: this.recipientEmail,
        recipient_name: this.recipientName,
        message: this.message,
      })
      .subscribe({
        next: (card) => {
          this.purchaseLoading = false;
          this.purchaseSuccess = `Gift card purchased! Code: ${card.code}`;
          this.senderEmail = '';
          this.recipientEmail = '';
          this.recipientName = '';
          this.message = '';
        },
        error: (err) => {
          this.purchaseLoading = false;
          this.purchaseError = err.error?.message || 'We couldn\'t complete the purchase. Please try again.';
        },
      });
  }

  checkBalance(): void {
    if (!this.balanceCode.trim()) return;
    this.balanceLoading = true;
    this.balanceError = '';
    this.balanceResult = null;

    this.giftCardService.checkBalance(this.balanceCode.trim()).subscribe({
      next: (res) => {
        this.balanceResult = res;
        this.balanceLoading = false;
      },
      error: (err) => {
        this.balanceError = err.error?.message || 'We couldn\'t find this gift card. Please check the code and try again.';
        this.balanceLoading = false;
      },
    });
  }
}
