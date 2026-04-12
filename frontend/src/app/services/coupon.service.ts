import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Coupon } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private baseUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  validateCoupon(code: string, order_total: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate`, { code, order_total });
  }

  createCoupon(coupon: Partial<Coupon>): Observable<any> {
    return this.http.post(this.baseUrl, coupon);
  }

  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<{ data: Coupon[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
