import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<{ data: DashboardStats }>(`${this.baseUrl}/dashboard`).pipe(map(r => r.data));
  }

  exportOrdersCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/orders`, { responseType: 'blob' });
  }

  exportProductsCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/products`, { responseType: 'blob' });
  }

  bulkImportProducts(products: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/import/products`, { products });
  }
}
