import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Address } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private baseUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<{ data: Address[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  createAddress(address: Partial<Address>): Observable<any> {
    return this.http.post(this.baseUrl, address);
  }

  updateAddress(id: number, address: Partial<Address>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
