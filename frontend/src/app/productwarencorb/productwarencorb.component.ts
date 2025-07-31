import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productwarencorb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productwarencorb.component.html',
  styleUrls: ['./productwarencorb.component.css']
})
export class ProductwarencorbComponent {
  @Input() product!: Product;
  @Input() quantity!: number;
  @Output() quantityChange = new EventEmitter<{ id: string; quantity: number }>();
  @Output() remove = new EventEmitter<string>();

  increaseQuantity(): void {
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
}
