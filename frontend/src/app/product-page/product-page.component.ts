import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent implements OnInit {
  groupedProducts: { category: string; items: Product[] }[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.groupProducts(products);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private groupProducts(products: Product[]): void {
    const map = new Map<string, Product[]>();

    for (const product of products) {
      const category = product.skin_typ_target || 'Uncategorized';
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)!.push(product);
    }

    this.groupedProducts = Array.from(map.entries()).map(([category, items]) => ({
      category,
      items
    }));
  }
}
