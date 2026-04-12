import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  makePayment(paymentData: any): Observable<any> {
    return this.http.post(this.baseUrl, paymentData, { withCredentials: true });
  }

  getPayments(): Observable<any> {
    return this.http.get(this.baseUrl, { withCredentials: true });
  }

  getPaymentById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  processRefund(paymentId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${paymentId}/refund`, { reason });
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoice/${orderId}`, { responseType: 'blob' });
  }

  verifyPaystackPayment(reference: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/paystack/verify`, { reference }, { withCredentials: true });
  }
}
