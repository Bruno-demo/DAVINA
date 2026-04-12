import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../services/newsletter.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent {
  email = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  loading = false;

  constructor(private newsletterService: NewsletterService) {}

  subscribe(): void {
    if (!this.email || !this.email.includes('@')) {
      this.message = 'Please enter a valid email address.';
      this.messageType = 'error';
      return;
    }
    this.loading = true;
    this.newsletterService.subscribe(this.email).subscribe({
      next: (res) => {
        this.message = res.message || 'Successfully subscribed!';
        this.messageType = 'success';
        this.email = '';
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Something went wrong. Please try again.';
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }
}
