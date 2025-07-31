import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';


import { environment } from '../../environments/environment';

const API_BASE = `${environment.apiUrl}/warenkorb`;

@Injectable({ providedIn: 'root' })
export class Warencorb {
  private cartUpdatedSource = new Subject<void>();
  cartUpdated$ = this.cartUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  private notifyCartUpdate(): void {
    this.cartUpdatedSource.next();
  }

  getMyWarenkorb(): Observable<any> {
    return this.http.get(`${API_BASE}/me`);
  }

  addItem(item: { product_id: string; quantity: number }): Observable<any> {
    return this.http.post(`${API_BASE}/add`, item).pipe(
      tap(() => this.notifyCartUpdate())
    );
  }

  updateItemQuantity(item: { product_id: string; quantity: number }): Observable<any> {
    return this.http.put(`${API_BASE}/update`, item).pipe(
      tap(() => this.notifyCartUpdate())
    );
  }

  removeItem(productId: string): Observable<any> {
    return this.http.delete(`${API_BASE}/remove/${productId}`).pipe(
      tap(() => this.notifyCartUpdate())
    );
  }

  clearWarenkorb(): Observable<any> {
    return this.http.delete(`${API_BASE}/clear`).pipe(
      tap(() => this.notifyCartUpdate())
    );
  }
}
