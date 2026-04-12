import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Review } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string, page: number = 1, limit: number = 10): Observable<{ data: Review[]; total: number; page: number; totalPages: number }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(`${this.baseUrl}/product/${productId}`, { params });
  }

  createReview(review: { product_id: string; rating: number; title: string; comment: string; user_name?: string }): Observable<any> {
    return this.http.post(this.baseUrl, review);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${reviewId}`);
  }
}
