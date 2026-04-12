import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order';
import { Product } from '../models/product.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartProductComponent } from '../cart-product/cart-product.component';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ProductService } from '../services/product';
import { AddressService } from '../services/address.service';
import { CouponService } from '../services/coupon.service';
import { Address } from '../models/order.model';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CartProductComponent, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
  cartItems: Array<{ product_id: string; quantity: number; price: number; name: string }> = [];
  productsMap = new Map<string, Product>();
  subtotal = 0;
  shippingCost = 4.99;
  taxRate = 0.19;
  taxAmount = 0;
  discountAmount = 0;
  total = 0;
  cart: any = null;
  hideLiefFormTitles = false;

  email = '';
  country = 'Germany';
  firstName = '';
  lastName = '';
  company = '';
  address = '';
  additionalAddress = '';
  postalCode = '';
  city = '';
  phone = '';
  paymentMethod = 'cash_on_delivery';
  shippingMethod = 'standard';
  orderNotes = '';
  couponCode = '';
  couponApplied = false;
  couponError = '';
  couponSuccess = '';

  // Saved addresses
  savedAddresses: Address[] = [];
  selectedAddressId: number | null = null;

  loading = false;
  errorMsg = '';
  successMsg = '';
  checkoutStep = 1;

  showLiefDetails = true;
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private authService: AuthenticationService,
    private addressService: AddressService,
    private couponService: CouponService,
    private toastService: ToastService,
  ) {}

  userDetails: any = {};

  ngOnInit(): void {
    this.loadCart();
    this.loadSavedAddresses();

    this.cartService.cartUpdated$.subscribe(() => {
      this.loadCart();
    });

    this.authService.getUserDetails().subscribe({
      next: (data) => {
        this.userDetails = data;
        this.email = data?.email || '';
        const fullName = data?.name || '';
        const nameParts = fullName.trim().split(/\s+/);
        this.firstName = nameParts[0] || '';
        this.lastName = nameParts.slice(1).join(' ') || '';
      },
      error: (err) => {
        console.error('Failed to fetch user data', err);
      }
    });
  }

  loadSavedAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
        const defaultAddr = addresses.find(a => a.is_default);
        if (defaultAddr) {
          this.selectAddress(defaultAddr);
        }
      },
      error: () => {}
    });
  }

  selectAddress(addr: Address): void {
    this.selectedAddressId = addr.address_id ?? null;
    this.firstName = addr.first_name;
    this.lastName = addr.last_name;
    this.address = addr.street;
    this.postalCode = addr.postal_code;
    this.city = addr.city;
    this.country = addr.country;
    this.phone = addr.phone || '';
  }

  onShippingMethodChange(): void {
    const costs: Record<string, number> = {
      standard: 4.99,
      express: 9.99,
      overnight: 19.99,
      free: 0
    };
    this.shippingCost = costs[this.shippingMethod] ?? 4.99;
    this.calculateTotals();
    this.updateCheckoutStep();
  }

  updateCheckoutStep(): void {
    if (this.paymentMethod) {
      this.checkoutStep = 4;
    } else if (this.shippingMethod) {
      this.checkoutStep = 3;
    } else if (this.firstName && this.lastName && this.address) {
      this.checkoutStep = 2;
    } else {
      this.checkoutStep = 1;
    }
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.couponError = '';
    this.couponSuccess = '';
    this.couponService.validateCoupon(this.couponCode, this.subtotal).subscribe({
      next: (res: any) => {
        this.discountAmount = res.discount_amount || 0;
        this.couponApplied = true;
        this.couponSuccess = `Coupon applied! You save RWF ${this.discountAmount.toFixed(0)}`;
        this.calculateTotals();
      },
      error: (err) => {
        this.couponError = err.error?.message || 'Invalid coupon code.';
        this.discountAmount = 0;
        this.couponApplied = false;
        this.calculateTotals();
      }
    });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponApplied = false;
    this.discountAmount = 0;
    this.couponError = '';
    this.couponSuccess = '';
    this.calculateTotals();
  }

  async loadCart(): Promise<void> {
    this.loading = true;
    try {
      const res = await this.cartService.getMyCart().toPromise();
      this.cartItems = res?.ordered_items?.filter(
        (item: any) => item.product_id && item.price != null
      ).map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })) || [];

      await this.loadProductsDetails();
      this.calculateTotals();
      this.showLiefDetails = this.cartItems.length > 0;
    } catch (err) {
      this.errorMsg = 'We couldn\'t load your cart. Please try again.';
      console.error('Cart load error:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadProductsDetails(): Promise<void> {
    this.productsMap.clear();
    const promises = this.cartItems.map(item =>
      this.productService.getProductById(item.product_id).toPromise()
        .then(res => res && res.data ? { id: item.product_id, product: res.data } : null)
        .catch(err => {
          console.error(`Error loading product ${item.product_id}`, err);
          return null;
        })
    );
    const results = await Promise.all(promises);
    results.forEach(result => {
      if (result) {
        this.productsMap.set(result.id, result.product);
      }
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );
    const afterDiscount = this.subtotal - this.discountAmount;
    this.taxAmount = afterDiscount * this.taxRate;
    this.total = afterDiscount + this.shippingCost + this.taxAmount;
  }

  onQuantityChange(event: { id: string; quantity: number }): void {
    const itemIndex = this.cartItems.findIndex(i => i.product_id === event.id);
    if (itemIndex === -1) return;

    if (event.quantity <= 0) {
      this.onRemove(event.id);
    } else {
      this.cartService.updateItemQuantity({
        product_id: event.id,
        quantity: event.quantity
      }).subscribe({
        next: () => {
          this.cartItems[itemIndex].quantity = event.quantity;
          this.calculateTotals();
        },
        error: (err) => {
          console.error('Error updating quantity:', err);
          this.errorMsg = 'Something went wrong while updating the quantity.';
        }
      });
    }
  }

  onRemove(productId: string): void {
    this.cartService.removeItem(productId).subscribe({
      next: (res) => {
        console.log('Remove API response:', res);
        this.cartItems = this.cartItems.filter(item => item.product_id !== productId);
        this.calculateTotals();
        this.showLiefDetails = this.cartItems.length > 0;
      },
      error: (err) => {
        console.error('Error removing product', err);
        this.errorMsg = 'Something went wrong while removing the product.';
      }
    });
  }

  submitOrder(form: any): void {
    if (!form.valid) {
      this.errorMsg = 'Please fill in all required fields before placing your order.';
      return;
    }
    if (this.cartItems.length === 0) {
      this.errorMsg = 'Your cart is empty. Please add some items before checking out.';
      return;
    }

    this.showLiefDetails = false;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const orderData = {
      customerInfo: {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        company: this.company,
        address: this.address,
        additionalAddress: this.additionalAddress,
        postalCode: this.postalCode,
        city: this.city,
        phone: this.phone,
        country: this.country,
        paymentMethod: this.paymentMethod,
        shipping_method: this.shippingMethod,
        order_notes: this.orderNotes,
        coupon_code: this.couponApplied ? this.couponCode : undefined,
        shipping_address_id: this.selectedAddressId || undefined
      },
      items: this.cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.cartService.clearCart().subscribe({
          next: () => {
            this.loading = false;
            this.successMsg = 'Order placed successfully!';
            this.toastService.success('Order placed successfully!');
            setTimeout(() => this.router.navigate(['/profilepage']), 2000);
          },
          error: (err) => {
            this.loading = false;
            this.errorMsg = 'Your order was placed but we couldn\'t clear the cart.';
            console.error('Error clearing the cart:', err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Something went wrong while placing your order. Please try again.';
        this.toastService.error(this.errorMsg);
        console.error('Order error:', err);
      }
    });
  }
}
