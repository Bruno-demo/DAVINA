import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Userlistadmin } from '../userlistadmin/userlistadmin';
import { OrderlistAdmin } from '../orderlist-admin/orderlist-admin';
import { ProductlistAdmin } from '../productlist-admin/productlist-admin';
import { AnalyticsDashboardComponent } from '../analytics-dashboard/analytics-dashboard.component';
import { CouponService } from '../services/coupon.service';
import { ReturnService } from '../services/return.service';
import { Coupon, ReturnRequest } from '../models/order.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, Userlistadmin, OrderlistAdmin, ProductlistAdmin, AnalyticsDashboardComponent],
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css']
})
export class AdminPage {
  activeTab: 'orders' | 'products' | 'users' | 'analytics' | 'coupons' | 'returns' = 'orders';

  // Coupons
  coupons: Coupon[] = [];
  showCouponForm = false;
  couponForm: Partial<Coupon> = { discount_type: 'percentage', discount_value: 10, active: true };

  // Returns
  returnRequests: ReturnRequest[] = [];

  constructor(
    private couponService: CouponService,
    private returnService: ReturnService
  ) {}

  setTab(tab: 'orders' | 'products' | 'users' | 'analytics' | 'coupons' | 'returns'): void {
    this.activeTab = tab;
    if (tab === 'coupons') this.loadCoupons();
    if (tab === 'returns') this.loadReturns();
  }

  // Coupon management
  loadCoupons(): void {
    this.couponService.getAllCoupons().subscribe({
      next: (data) => { this.coupons = data; },
      error: () => {}
    });
  }

  createCoupon(): void {
    this.couponService.createCoupon(this.couponForm).subscribe({
      next: () => {
        this.showCouponForm = false;
        this.couponForm = { discount_type: 'percentage', discount_value: 10, active: true };
        this.loadCoupons();
      },
      error: () => {}
    });
  }

  deleteCoupon(id: string): void {
    this.couponService.deleteCoupon(id).subscribe({
      next: () => { this.loadCoupons(); },
      error: () => {}
    });
  }

  // Return management
  loadReturns(): void {
    this.returnService.getAllReturns().subscribe({
      next: (data) => { this.returnRequests = data; },
      error: () => {}
    });
  }

  updateReturnStatus(id: number, status: string): void {
    this.returnService.updateReturnStatus(id, status).subscribe({
      next: () => { this.loadReturns(); },
      error: () => {}
    });
  }
}
