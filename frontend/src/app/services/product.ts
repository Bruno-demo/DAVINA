import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

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
}
