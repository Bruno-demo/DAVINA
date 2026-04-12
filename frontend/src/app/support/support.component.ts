import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportTicketService, SupportTicket } from '../services/support-ticket.service';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent implements OnInit {
  activeTab: 'new' | 'tickets' = 'new';
  isLoggedIn = false;

  // New ticket form
  email = '';
  subject = '';
  message = '';
  priority = 'normal';
  submitLoading = false;
  submitSuccess = '';
  submitError = '';

  // My tickets
  tickets: SupportTicket[] = [];
  ticketsLoading = false;
  selectedTicket: SupportTicket | null = null;

  constructor(
    private ticketService: SupportTicketService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.authService.getUserDetails().subscribe({
        next: (user) => {
          this.email = user?.email || '';
        },
        error: () => {},
      });
    }
  }

  submitTicket(): void {
    if (!this.email || !this.subject || !this.message) return;
    this.submitLoading = true;
    this.submitSuccess = '';
    this.submitError = '';

    this.ticketService
      .createTicket({
        email: this.email,
        subject: this.subject,
        message: this.message,
        priority: this.priority,
      })
      .subscribe({
        next: () => {
          this.submitLoading = false;
          this.submitSuccess = 'Your ticket has been submitted. We will get back to you soon!';
          this.subject = '';
          this.message = '';
          this.priority = 'normal';
        },
        error: (err) => {
          this.submitLoading = false;
          this.submitError = err.error?.message || 'We couldn\'t submit your ticket. Please try again.';
        },
      });
  }

  loadMyTickets(): void {
    this.activeTab = 'tickets';
    this.ticketsLoading = true;
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.ticketsLoading = false;
      },
      error: () => {
        this.ticketsLoading = false;
      },
    });
  }

  viewTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
  }

  closeTicket(ticketId: number): void {
    this.ticketService.closeTicket(ticketId).subscribe({
      next: (updated) => {
        const idx = this.tickets.findIndex((t) => t.ticket_id === ticketId);
        if (idx >= 0) this.tickets[idx] = updated;
        if (this.selectedTicket?.ticket_id === ticketId) this.selectedTicket = updated;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-progress';
      case 'closed': return 'status-closed';
      default: return '';
    }
  }
}
