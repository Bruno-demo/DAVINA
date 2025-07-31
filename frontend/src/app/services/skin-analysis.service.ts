import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SkinAnalysisResponse {
  diagnose: string;
  hauttyp: string;
  empfohleneProdukte: any[]; 
  pflegeempfehlung: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkinAnalysisService {
  private baseUrl = `${environment.apiUrl}/skin-analysis`;

  constructor(private http: HttpClient) {}

  analyseSkin(file: File, userId: string): Observable<any> {
    const formData = new FormData();
    formData.append('skinImage', file);
    formData.append('userId', userId);

    return this.http.post(this.baseUrl, formData, { withCredentials: true });
  }
}
