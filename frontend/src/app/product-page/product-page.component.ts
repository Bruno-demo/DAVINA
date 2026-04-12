import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SkeletonComponent],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;
  limit = 12;

  // Filters
  searchQuery = '';
  filterSkinType = '';
  filterEffect = '';
  filterCategory = '';
  sortOption = '';
  categories: string[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.filterCategory = params['category'] || '';
      this.filterSkinType = params['skinType'] || '';
      this.filterEffect = params['effect'] || '';
      this.sortOption = params['sort'] || '';
      this.currentPage = parseInt(params['page'], 10) || 1;
      this.loadProducts(false);
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => {}
    });
  }

  loadProducts(updateUrl = true): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (updateUrl) {
      const queryParams: any = {};
      if (this.searchQuery) queryParams.search = this.searchQuery;
      if (this.filterCategory) queryParams.category = this.filterCategory;
      if (this.filterSkinType) queryParams.skinType = this.filterSkinType;
      if (this.filterEffect) queryParams.effect = this.filterEffect;
      if (this.sortOption) queryParams.sort = this.sortOption;
      if (this.currentPage > 1) queryParams.page = this.currentPage;
      this.router.navigate([], { queryParams, queryParamsHandling: 'replace' });
      return; // The queryParams subscription will call loadProducts(false)
    }

    this.productService.getProductsPaginated(
      this.currentPage,
      this.limit,
      this.searchQuery || undefined,
      this.filterSkinType || undefined,
      this.filterEffect || undefined,
      this.filterCategory || undefined,
      this.sortOption || undefined
    ).subscribe({
      next: (res) => {
        this.products = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.currentPage = res.page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'We couldn\'t load the products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    if (this.filterCategory && this.filterCategory !== 'Skincare') {
      this.filterSkinType = '';
      this.filterEffect = '';
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
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

  formatSkinType(skinType: string): string {
    const map: Record<string, string> = { dry: 'Dry', oily: 'Oily', combination: 'Combination', normal: 'Normal' };
    return map[skinType?.toLowerCase()] || skinType;
  }
}
