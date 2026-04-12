import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private readonly STORAGE_KEY = 'recently_viewed';
  private readonly MAX_ITEMS = 12;

  getRecentlyViewed(): Product[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addProduct(product: Product): void {
    const items = this.getRecentlyViewed().filter(p => p._id !== product._id);
    items.unshift(product);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items.slice(0, this.MAX_ITEMS)));
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
