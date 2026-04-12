import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReturnRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private baseUrl = `${environment.apiUrl}/returns`;

  constructor(private http: HttpClient) {}

  createReturnRequest(order_id: number, reason: string): Observable<any> {
    return this.http.post(this.baseUrl, { order_id, reason });
  }

  getMyReturns(): Observable<ReturnRequest[]> {
    return this.http.get<{ data: ReturnRequest[] }>(`${this.baseUrl}/me`).pipe(map(r => r.data));
  }

  getAllReturns(): Observable<ReturnRequest[]> {
    return this.http.get<{ data: ReturnRequest[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  updateReturnStatus(id: number, status: string, admin_notes?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status, admin_notes });
  }
}
