import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule, ProductCardComponent],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit {
  @Output() search = new EventEmitter<string>();

  searchQuery = '';
  showSuggestions = false;
  filteredSuggestions: Product[] = [];
  products: Product[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  private searchTerms = new Subject<string>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.updateSuggestions(term));
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  onInputChange(): void {
    this.searchTerms.next(this.searchQuery);
  }

  private updateSuggestions(query: string): void {
    if (!query.trim() || this.isLoading || !this.products) {
      this.showSuggestions = false;
      return;
    }

    const normalizedQuery = query.toLowerCase();
    this.filteredSuggestions = this.products.filter(product =>
      product.p_name?.toLowerCase().includes(normalizedQuery) ||
      product.effect?.toLowerCase().includes(normalizedQuery) ||
      product.skin_typ_target?.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);

    this.showSuggestions = this.filteredSuggestions.length > 0;
  }

  selectSuggestion(product: Product): void {
    this.searchQuery = product.p_name;
    this.showSuggestions = false;
    this.search.emit(product.p_name);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.showSuggestions = false;
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.search.emit('');
  }

  trackById(index: number, product: Product): string {
    return product._id ?? index.toString();
  }
}
