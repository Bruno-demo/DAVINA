import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private baseUrl = `${environment.apiUrl}/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscribe`, { email });
  }

  unsubscribe(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/unsubscribe`, { email });
  }

  getAllSubscribers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscribers`);
  }
}
