import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComparisonService {
  private readonly STORAGE_KEY = 'compare_products';
  private readonly MAX_ITEMS = 4;
  private updatedSource = new Subject<void>();
  updated$ = this.updatedSource.asObservable();

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  addProduct(product: Product): boolean {
    const items = this.getProducts();
    if (items.length >= this.MAX_ITEMS) return false;
    if (items.some(p => p._id === product._id)) return false;
    items.push(product);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updatedSource.next();
    return true;
  }

  removeProduct(productId: string): void {
    const items = this.getProducts().filter(p => p._id !== productId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updatedSource.next();
  }

  isInComparison(productId: string): boolean {
    return this.getProducts().some(p => p._id === productId);
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updatedSource.next();
  }

  getCount(): number {
    return this.getProducts().length;
  }
}
