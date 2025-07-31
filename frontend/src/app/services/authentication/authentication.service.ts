import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDTO } from '../../models/User/userDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private baseUrl = `${environment.apiUrl}/users`;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token !== null) {
      const result = this.parseToken(token);
      if (result !== null) {
        this.isLoggedInSubject.next(true);
        this.userRoleSubject.next(result.role);
      } else {
        this.clearSession();
      }
    }
  }

  register(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.baseUrl}`, user);
  }

  login(data: any): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.baseUrl}/login`, data)
      .pipe(
        tap((res: { token: string }) => {
          this.saveToken(res.token);
          this.isLoggedInSubject.next(true);
          this.fetchUserRole(); // updated
        }),
      );
  }

  logout(): Observable<any> {
    const header = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.getToken(),
    );
    return this.http
      .post<any>(`${this.baseUrl}/logout`, {}, { headers: header })
      .pipe(
        tap(() => {
          this.clearSession();
          this.isLoggedInSubject.next(false);
          this.userRoleSubject.next(null);
        }),
      );
  }

  getUserId(): string | null {
  const token = this.getToken();
  if (!token) return null;
  const parsed = this.parseToken(token);
  if (!parsed || !parsed.userId) return null;
  return String(parsed.userId);
}

    deleteAccount(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/me`, { headers }).pipe(
      tap(() => {
        this.clearSession();
        this.isLoggedInSubject.next(false);
        this.userRoleSubject.next(null);
      })
    );
  }

  fetchUserRole(): void {
    const token = this.getToken();
    if (!token) {
      this.userRoleSubject.next(null);
      return;
    }


    const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get<{ role: string }>(`${this.baseUrl}/me`, { headers: header }) // FIXED: using /me endpoint
      .subscribe({
        next: (res) => {
          this.userRoleSubject.next(res.role);
        },
        error: (err) => {
          console.error('Error fetching user role:', err);
          this.userRoleSubject.next(null);
        },
      });
  }

  isAdmin(): boolean {
  const token = this.getDecodedToken();
  return token?.role?.toLowerCase() === 'admin';
}

getDecodedToken(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

  getUserDetails(): Observable<{
    user_id: number;
    name: string;
    email: string;
    role: string;
  }> {
    const header = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.getToken(),
    );
    return this.http.get<{
      user_id: number;
      name: string;
      email: string;
      role: string;
    }>(`${this.baseUrl}/me`, { headers: header });
  }

  parseToken(token: string): { userId: number; role: string; exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Failed to parse token', e);
      return null;
    }
  }

  getUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
     const parsed = this.parseToken(token); //ajout
  if (parsed?.role) { //ajout
    this.userRoleSubject.next(parsed.role);//ajout
  }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearSession(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
