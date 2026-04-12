import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order';
import { UserService } from '../services/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orderlist-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './orderlist-admin.html',
  styleUrls: ['./orderlist-admin.css']
})
export class OrderlistAdmin implements OnInit {
  orders: any[] = [];
  isLoading = true;
  filterStatus = '';

  // Detail card
  selectedOrder: any = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  readonly StatusOrder = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  };
  readonly statusOptions = Object.values(this.StatusOrder);

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getAllOrders().subscribe({
      next: (ordersData) => {
        this.orders = ordersData;

        this.userService.getAllUsers().subscribe({
          next: (users) => {
            this.orders.forEach(order => {
              const user = users.find((u: any) => u.u_id === order.user_id);
              order.user = user;
              order.newStatus = order.status;
            });
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading users:', err);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, { status: newStatus }).subscribe({
      next: () => {
        const order = this.orders.find(o => o.order_id === +orderId);
        if (order) {
          order.status = newStatus;
          order.newStatus = newStatus;
        }
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  saveStatus(order: any): void {
    if (order.newStatus !== order.status) {
      this.updateStatus(order.order_id, order.newStatus);
    }
  }

  deleteOrder(order: any): void {
    if (!confirm(`Delete order #${order.order_id}?`)) return;
    this.orderService.deleteOrder(order.order_id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.order_id !== order.order_id);
      },
      error: (err) => console.error('Error deleting order:', err)
    });
  }

  get filteredOrders(): any[] {
    let list = this.orders;
    if (this.filterStatus) {
      list = list.filter(o => o.status === this.filterStatus);
    }
    return list;
  }

  get paginatedOrders(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  openOrder(order: any): void {
    this.selectedOrder = order;
  }

  closeOrder(): void {
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return map[status] || '';
  }
}