import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.css'
})

export class ProductAdmin {
  @Input() product!: Product;
  @Output() productUpdated = new EventEmitter<Product>();
  @Output() productDeleted = new EventEmitter<string>();

  isEditing = false;
  editedProduct: Partial<Product> = {};

  constructor(private productService: ProductService) {}

  enableEdit() {
    this.isEditing = true;
    this.editedProduct = { ...this.product };
  }

  saveChanges() {
    const updateData: Partial<Product> = {
      p_name: this.editedProduct.p_name,
      p_description: this.editedProduct.p_description,
      price: this.editedProduct.price,
      skin_typ_target: this.editedProduct.skin_typ_target,
      effect: this.editedProduct.effect,
      image_url: this.editedProduct.image_url?.trim() ? this.editedProduct.image_url : this.product.image_url
    };

    this.productService.updateProduct(this.product._id, updateData).subscribe(response => {
      this.product = response.data;
      this.productUpdated.emit(response.data);
      this.isEditing = false;
    });
  }

  cancelEdit() {
    this.isEditing = false;
  }

  deleteProduct() {
    if (confirm(`Möchten Sie "${this.product.p_name}" wirklich löschen?`)) {
      this.productService.deleteProduct(this.product._id).subscribe(() => {
        this.productDeleted.emit(this.product._id);
      });
    }
  }
}



  
