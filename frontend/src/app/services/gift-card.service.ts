import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GiftCard {
  _id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  sender_email: string;
  recipient_email: string;
  recipient_name: string;
  message: string;
  is_active: boolean;
  expires_at: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class GiftCardService {
  private baseUrl = `${environment.apiUrl}/gift-cards`;

  constructor(private http: HttpClient) {}

  purchase(data: { amount: number; sender_email: string; recipient_email: string; recipient_name?: string; message?: string }): Observable<GiftCard> {
    return this.http.post<{ data: GiftCard }>(`${this.baseUrl}/purchase`, data).pipe(map(r => r.data));
  }

  checkBalance(code: string): Observable<{ code: string; balance: number; expires_at: string }> {
    return this.http.get<{ data: { code: string; balance: number; expires_at: string } }>(`${this.baseUrl}/balance/${code}`).pipe(map(r => r.data));
  }

  redeem(code: string, amount: number): Observable<{ remaining_balance: number }> {
    return this.http.post<{ data: { remaining_balance: number } }>(`${this.baseUrl}/redeem`, { code, amount }).pipe(map(r => r.data));
  }

  getAll(): Observable<GiftCard[]> {
    return this.http.get<{ data: GiftCard[] }>(this.baseUrl).pipe(map(r => r.data));
  }
}
