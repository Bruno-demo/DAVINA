import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { Warencorb } from '../services/warencorb';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: Product;

  isAddingToCart = false;
  addToCartSuccess = false;
  addToCartError = '';

  constructor(
    private warenkorbService: Warencorb,
    private router: Router
  ) {}

  addToCart(): void {
  this.isAddingToCart = true;
  this.addToCartSuccess = false;
  this.addToCartError = '';

  this.warenkorbService.addItem({
  product_id: this.product._id,
  quantity: 1
})
.subscribe({
    next: () => {
      this.isAddingToCart = false;
      this.addToCartSuccess = true;
      setTimeout(() => this.addToCartSuccess = false, 3000);
    },
    error: (err) => {
      this.isAddingToCart = false;
      this.addToCartError = err.error?.message || 'Fehler beim Hinzufügen zum Warenkorb';
      setTimeout(() => this.addToCartError = '', 3000);
      console.error('Error adding to cart:', err);
    }
  });
}
}
