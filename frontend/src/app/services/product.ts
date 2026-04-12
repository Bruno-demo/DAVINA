import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/product-items`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  getProductsPaginated(page: number = 1, limit: number = 12, search?: string, skinType?: string, effect?: string, category?: string, sort?: string): Observable<PaginatedProducts> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (skinType) params = params.set('skinType', skinType);
    if (effect) params = params.set('effect', effect);
    if (category) params = params.set('category', category);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PaginatedProducts>(this.baseUrl, { params });
  }

  getProductById(id: string): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.baseUrl}/${id}`);
  }

  createProduct(productData: Product): Observable<{ data: Product }> {
    return this.http.post<{ data: Product }>(this.baseUrl, productData, { withCredentials: true });
  }

  updateProduct(id: string, updatedData: Partial<Product>): Observable<{ data: Product }> {
    return this.http.put<{ data: Product }>(`${this.baseUrl}/${id}`, updatedData, { withCredentials: true });
  }

  deleteProduct(id: string): Observable<{ data: Product }> {
    return this.http.delete<{ data: Product }>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  getRelatedProducts(id: string): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(`${this.baseUrl}/${id}/related`).pipe(map(r => r.data));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<{ data: string[] }>(`${this.baseUrl}/categories`).pipe(map(r => r.data));
  }
}
