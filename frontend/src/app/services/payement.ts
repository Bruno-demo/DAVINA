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
}
