import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials, { withCredentials: true });
  }

  logoutUser(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  getAuthenticatedUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { withCredentials: true });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/me`, { withCredentials: true });
  }

  updateUserRole(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-role`, data, { withCredentials: true });
  }

}
