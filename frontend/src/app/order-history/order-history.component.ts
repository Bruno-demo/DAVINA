import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../services/order';
import { PaymentService } from '../services/payement';
import { CartService } from '../services/cart.service';
import { ReturnService } from '../services/return.service';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  returnReason = '';
  returnOrderId: number | null = null;
  message = '';

  // Tracking
  trackingOrderId: number | null = null;
  trackingInfo: any = null;
  trackingLoading = false;

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private cartService: CartService,
    private returnService: ReturnService,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  reorder(order: Order): void {
    const items = order.ordered_items || [];
    let added = 0;
    for (const item of items) {
      this.cartService.addItem({ product_id: item.product_id as any, quantity: item.quantity }).subscribe({
        next: () => {
          added++;
          if (added === items.length) {
            this.message = 'Items added to cart!';
            setTimeout(() => this.message = '', 3000);
          }
        }
      });
    }
  }

  downloadInvoice(orderId: number): void {
    this.paymentService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.message = 'Failed to download invoice.';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  openReturnForm(orderId: number): void {
    this.returnOrderId = orderId;
    this.returnReason = '';
  }

  submitReturn(): void {
    if (!this.returnOrderId || !this.returnReason) return;
    this.returnService.createReturnRequest(this.returnOrderId, this.returnReason).subscribe({
      next: () => {
        this.message = 'Return request submitted successfully.';
        this.returnOrderId = null;
        this.returnReason = '';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to submit return request.';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  cancelReturn(): void {
    this.returnOrderId = null;
    this.returnReason = '';
  }

  showTracking(orderId: number): void {
    if (this.trackingOrderId === orderId) {
      this.trackingOrderId = null;
      this.trackingInfo = null;
      return;
    }
    this.trackingOrderId = orderId;
    this.trackingLoading = true;
    this.trackingInfo = null;
    this.orderService.getTrackingInfo(orderId).subscribe({
      next: (info) => {
        this.trackingInfo = info;
        this.trackingLoading = false;
      },
      error: () => {
        this.trackingLoading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'returned': return 'status-returned';
      default: return '';
    }
  }
}
