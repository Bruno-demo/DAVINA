import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { OrderService } from '../services/order';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-profilepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profilepage.component.html',
  styleUrls: ['./profilepage.component.css'],
  providers: [DatePipe]
})
export class ProfilePageComponent implements OnInit {
  userDetails: any = null;
  orders: Order[] = [];
  showDeleteConfirm = false;
  isAdmin = false;

  constructor(
    private authService: AuthenticationService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/register']);
      return;
    }
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.authService.getUserDetails().subscribe({
      next: (data) => {
        this.userDetails = data;
        this.isAdmin = data.role === 'admin';

        if (!this.isAdmin) {
          this.loadOrders();
        }
      },
      error: (err) => {
        console.error('Failed to load user details', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data || [];
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.orders = [];
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/register']);
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        localStorage.removeItem('token');
        this.router.navigate(['/register']);
        alert('Your account has been deleted.');
      },
      error: (err) => {
        this.showDeleteConfirm = false;
        console.error('Account deletion failed:', err);
        alert('Failed to delete your account. Please try again.');
      }
    });
  }

  navigateToAdmin(): void {
    this.router.navigate(['/adminpage']);
  }
}
