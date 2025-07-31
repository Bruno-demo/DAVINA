import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrderFromWarenkorb(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/from-warenkorb`, orderData, { withCredentials: true });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }

  getAllOrders(): Observable<any> {
    return this.http.get(this.baseUrl, { withCredentials: true });
  }

  updateOrderStatus(orderId: string, statusData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${orderId}/status`, statusData, { withCredentials: true });
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${orderId}`, { withCredentials: true });
  }
}
