import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SupportTicket {
  ticket_id: number;
  user_id: number | null;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class SupportTicketService {
  private baseUrl = `${environment.apiUrl}/support-tickets`;

  constructor(private http: HttpClient) {}

  createTicket(data: { email: string; subject: string; message: string; priority?: string }): Observable<SupportTicket> {
    return this.http.post<{ data: SupportTicket }>(this.baseUrl, data).pipe(map(r => r.data));
  }

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<{ data: SupportTicket[] }>(`${this.baseUrl}/me`).pipe(map(r => r.data));
  }

  getAllTickets(): Observable<SupportTicket[]> {
    return this.http.get<{ data: SupportTicket[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  replyToTicket(ticketId: number, admin_reply: string): Observable<SupportTicket> {
    return this.http.put<{ data: SupportTicket }>(`${this.baseUrl}/${ticketId}/reply`, { admin_reply }).pipe(map(r => r.data));
  }

  closeTicket(ticketId: number): Observable<SupportTicket> {
    return this.http.put<{ data: SupportTicket }>(`${this.baseUrl}/${ticketId}/close`, {}).pipe(map(r => r.data));
  }
}
