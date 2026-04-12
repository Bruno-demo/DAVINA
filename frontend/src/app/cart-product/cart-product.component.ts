import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-product.component.html',
  styleUrls: ['./cart-product.component.css']
})
export class CartProductComponent {
  @Input() product!: Product;
  @Input() quantity!: number;
  @Input() stock: number = 0;
  @Output() quantityChange = new EventEmitter<{ id: string; quantity: number }>();
  @Output() remove = new EventEmitter<string>();

  outOfStockMsg = false;
  private outOfStockTimer: any;

  get atStockLimit(): boolean {
    return this.stock > 0 && this.quantity >= this.stock;
  }

  increaseQuantity(): void {
    if (this.atStockLimit) {
      this.showOutOfStockMsg();
      return;
    }
    this.quantityChange.emit({ id: this.product._id, quantity: this.quantity + 1 });
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantityChange.emit({ id: this.product._id, quantity: this.quantity - 1 });
    }
  }

  removeItem(): void {
    this.remove.emit(this.product._id);
  }

  private showOutOfStockMsg(): void {
    this.outOfStockMsg = true;
    clearTimeout(this.outOfStockTimer);
    this.outOfStockTimer = setTimeout(() => (this.outOfStockMsg = false), 2500);
  }
}
