import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private baseUrl = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<any> {
    return this.http.get<{ data: any }>(this.baseUrl).pipe(map(r => r.data));
  }

  addToWishlist(product_id: string): Observable<any> {
    return this.http.post(this.baseUrl, { product_id });
  }

  removeFromWishlist(product_id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${product_id}`);
  }
}
