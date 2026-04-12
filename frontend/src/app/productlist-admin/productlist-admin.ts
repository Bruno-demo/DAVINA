import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-productlist-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productlist-admin.html',
  styleUrl: './productlist-admin.css'
})
export class ProductlistAdmin implements OnInit {
  products: Product[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;
  limit = 10;
  searchQuery = '';

  // Create / Edit
  isCreating = false;
  editingId: string | null = null;
  form: Partial<Product> = {};
  extraImages: string[] = [];   // additional images beyond image_url
  newExtraImageUrl = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProductsPaginated(this.currentPage, this.limit, this.searchQuery || undefined).subscribe({
      next: (res) => {
        this.products = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.currentPage = res.page;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Create
  startCreate(): void {
    this.editingId = null;
    this.isCreating = true;
    this.extraImages = [];
    this.newExtraImageUrl = '';
    this.form = { p_name: '', p_description: '', skin_typ_target: 'normal', effect: 'Hydration', price: 0, stock: 0, image_url: '', category: 'Skincare' };
  }

  addExtraImage(): void {
    const url = this.newExtraImageUrl.trim();
    if (url && !this.extraImages.includes(url)) {
      this.extraImages.push(url);
    }
    this.newExtraImageUrl = '';
  }

  removeExtraImage(index: number): void {
    this.extraImages.splice(index, 1);
  }

  cancelForm(): void {
    this.isCreating = false;
    this.editingId = null;
  }

  saveNewProduct(): void {
    if (!this.form.p_name || !this.form.price) {
      alert('Please fill in all required fields.');
      return;
    }
    if (this.form.category === 'Skincare' && (!this.form.skin_typ_target || !this.form.effect)) {
      alert('Please fill in skin type and effect for Skincare products.');
      return;
    }
    this.form.images = [...this.extraImages];
    this.productService.createProduct(this.form as Product).subscribe({
      next: () => {
        this.isCreating = false;
        this.loadProducts();
      }
    });
  }

  // Edit
  startEdit(product: Product): void {
    this.isCreating = false;
    this.editingId = product._id;
    this.extraImages = product.images ? [...product.images] : [];
    this.newExtraImageUrl = '';
    this.form = { ...product };
  }

  saveEdit(): void {
    if (!this.editingId) return;
    this.form.images = [...this.extraImages];
    this.productService.updateProduct(this.editingId, this.form).subscribe({
      next: () => {
        this.editingId = null;
        this.loadProducts();
      }
    });
  }

  // Delete
  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.p_name}"?`)) return;
    this.productService.deleteProduct(product._id).subscribe({
      next: () => this.loadProducts()
    });
  }

  // Quick stock update
  updateStock(product: Product, newStock: number): void {
    if (newStock < 0) return;
    this.productService.updateProduct(product._id, { stock: newStock }).subscribe({
      next: (res) => { product.stock = res.data.stock; }
    });
  }
}