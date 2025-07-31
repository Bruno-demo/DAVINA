import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { ProductAdmin } from '../product-admin/product-admin';


@Component({
  selector: 'app-productlist-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductAdmin],
  templateUrl: './productlist-admin.html',
  styleUrl: './productlist-admin.css'
})

export class ProductlistAdmin implements OnInit {
  products: Product[] = [];
  isCreating = false;
  newProduct: Partial<Product> = {};

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  onProductUpdated(updated: Product) {
    const index = this.products.findIndex(p => p._id === updated._id);
    if (index !== -1) {
      this.products[index] = updated;
    }
  }

  startCreate() {
    this.isCreating = true;
    this.newProduct = {
      p_name: '',
      p_description: '',
      skin_typ_target: 'normal',
      effect: 'Hydratation',
      price: 0,
      image_url: ''
    };
  }

  cancelCreate() {
    this.isCreating = false;
  }

  saveNewProduct() {
    if (!this.newProduct.p_name || !this.newProduct.price || !this.newProduct.skin_typ_target || !this.newProduct.effect) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.productService.createProduct(this.newProduct as Product).subscribe(response => {
      this.products.push(response.data);
      this.isCreating = false;
    });
  }

  onProductDeleted(productId: string) {
    this.products = this.products.filter(p => p._id !== productId);
  }
}