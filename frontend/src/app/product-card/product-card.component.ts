import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { CurrencyService } from '../services/currency.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements OnChanges {
  @Input() product!: Product;

  isAddingToCart = false;
  addToCartSuccess = false;
  addToCartError = '';
  wishlisted = false;

  allImages: string[] = [];
  activeIndex = 0;
  starArray: ('full' | 'half' | 'empty')[] = [];

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    public currSvc: CurrencyService
  ) {}

  ngOnChanges(): void {
    // Build image list: primary image first, then extras
    this.allImages = [];
    if (this.product?.image_url) this.allImages.push(this.product.image_url);
    if (this.product?.images?.length) {
      for (const img of this.product.images) {
        if (img && !this.allImages.includes(img)) this.allImages.push(img);
      }
    }
    this.activeIndex = 0;

    // Build star array
    this.starArray = [];
    const rating = this.product?.average_rating || 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) this.starArray.push('full');
      else if (i - 0.5 <= rating) this.starArray.push('half');
      else this.starArray.push('empty');
    }
  }

  get activeImage(): string {
    return this.allImages[this.activeIndex] || 'assets/placeholder.png';
  }

  setImage(index: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.activeIndex = index;
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlisted = !this.wishlisted;
    this.toastService[this.wishlisted ? 'success' : 'info'](
      this.wishlisted ? `${this.product.p_name} saved!` : `Removed from wishlist`
    );
  }

  isNew(): boolean {
    if (!this.product?.createdAt) return false;
    const days = (Date.now() - new Date(this.product.createdAt).getTime()) / 86400000;
    return days <= 30;
  }

  formatPrice(price: number): string {
    return this.currSvc.format(price);
  }

  formatSkinType(skinType: string): string {
    const normalized = skinType?.toLowerCase();
    if (normalized === 'dry') return 'Dry';
    if (normalized === 'oily') return 'Oily';
    if (normalized === 'combination') return 'Combination';
    if (normalized === 'normal') return 'Normal';
    return skinType;
  }

  formatEffect(effect: string): string {
    const normalized = effect?.toLowerCase();
    if (normalized === 'hydration') return 'Hydration';
    if (normalized === 'soothing') return 'Soothing';
    if (normalized === 'mattifying') return 'Mattifying';
    if (normalized === 'anti-aging') return 'Anti-aging';
    if (normalized === 'anti-acne') return 'Anti-acne';
    return effect;
  }

  addToCart(): void {
  this.isAddingToCart = true;
  this.addToCartSuccess = false;
  this.addToCartError = '';

  this.cartService.addItem({
  product_id: this.product._id,
  quantity: 1,
  name: this.product.p_name,
  price: this.product.price
})
.subscribe({
    next: () => {
      this.isAddingToCart = false;
      this.addToCartSuccess = true;
      this.toastService.success(`${this.product.p_name} added to cart!`);
      setTimeout(() => this.addToCartSuccess = false, 3000);
    },
    error: (err) => {
      this.isAddingToCart = false;
      this.addToCartError = err.error?.message || 'Something went wrong while adding to cart.';
      this.toastService.error(this.addToCartError);
      setTimeout(() => this.addToCartError = '', 3000);
      console.error('Error adding to cart:', err);
    }
  });
}
}
