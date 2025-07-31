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
            console.error('Erreur chargement utilisateurs:', err);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
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
      error: (err) => console.error('Erreur mise à jour statut:', err)
    });
  }

  saveStatus(order: any): void {
    if (order.newStatus !== order.status) {
      this.updateStatus(order.order_id, order.newStatus);
    } else {
      console.log('Aucun changement de statut.');
    }
  }

  get filteredOrders(): any[] {
    if (!this.filterStatus) {
      return this.orders;
    }
    return this.orders.filter(o => o.status === this.filterStatus);
  }
}