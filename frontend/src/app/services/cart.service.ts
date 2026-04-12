import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of, forkJoin } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { AuthenticationService } from './authentication/authentication.service';

import { environment } from '../../environments/environment';

const API_BASE = `${environment.apiUrl}/cart`;
const GUEST_CART_KEY = 'guest_cart';

export interface GuestCartItem {
  product_id: string;
  quantity: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartUpdatedSource = new Subject<void>();
  cartUpdated$ = this.cartUpdatedSource.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private notifyCartUpdate(): void {
    this.cartUpdatedSource.next();
  }

  private isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ─── Guest cart (localStorage) ───

  private getGuestCart(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveGuestCart(items: GuestCartItem[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }

  clearGuestCart(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  }

  getGuestCartCount(): number {
    return this.getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  // ─── Public API (auto-switches between guest / authenticated) ───

  getMyCart(): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.get(`${API_BASE}/me`);
    }
    const items = this.getGuestCart();
    return of({
      ordered_items: items,
      total_price: items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    });
  }

  addItem(item: { product_id: string; quantity: number; name?: string; price?: number }): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.post(`${API_BASE}/add`, item).pipe(
        tap(() => this.notifyCartUpdate())
      );
    }

    // Guest mode: store in localStorage
    const cart = this.getGuestCart();
    const existing = cart.find(i => i.product_id === item.product_id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.name || '',
        price: item.price || 0
      });
    }
    this.saveGuestCart(cart);
    this.notifyCartUpdate();
    return of({ message: 'Product added to cart.' });
  }

  updateItemQuantity(item: { product_id: string; quantity: number }): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.put(`${API_BASE}/update`, item).pipe(
        tap(() => this.notifyCartUpdate())
      );
    }

    const cart = this.getGuestCart();
    const existing = cart.find(i => i.product_id === item.product_id);
    if (existing) {
      existing.quantity = item.quantity;
    }
    this.saveGuestCart(cart);
    this.notifyCartUpdate();
    return of({ message: 'Quantity updated.' });
  }

  removeItem(productId: string): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.delete(`${API_BASE}/remove/${productId}`).pipe(
        tap(() => this.notifyCartUpdate())
      );
    }

    let cart = this.getGuestCart();
    cart = cart.filter(i => i.product_id !== productId);
    this.saveGuestCart(cart);
    this.notifyCartUpdate();
    return of({ message: 'Item removed.' });
  }

  clearCart(): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.delete(`${API_BASE}/clear`).pipe(
        tap(() => this.notifyCartUpdate())
      );
    }

    this.clearGuestCart();
    this.notifyCartUpdate();
    return of({ message: 'Cart cleared.' });
  }

  /** Merge guest cart into backend cart after login */
  mergeGuestCart(): Observable<any> {
    const guestItems = this.getGuestCart();
    if (guestItems.length === 0) {
      return of(null);
    }

    const requests = guestItems.map(item =>
      this.http.post(`${API_BASE}/add`, {
        product_id: item.product_id,
        quantity: item.quantity
      }).pipe(catchError(() => of(null)))
    );

    return forkJoin(requests).pipe(
      tap(() => {
        this.clearGuestCart();
        this.notifyCartUpdate();
      })
    );
  }
}
