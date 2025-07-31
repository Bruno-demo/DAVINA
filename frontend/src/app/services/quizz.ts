import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuizQuestion } from '../models/quizz-question.model';
import { QuizResponseResult } from '../models/quizz-response.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private baseUrl = `${environment.apiUrl}/quiz`;

  constructor(private http: HttpClient) {}

  getQuizQuestions(): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.baseUrl}/questions`);
  }

  submitQuizResponses(payload: { userId: string; answers: Record<string, string> }): Observable<QuizResponseResult> {
    return this.http.post<QuizResponseResult>(this.baseUrl, payload, { withCredentials: true });
  }

  getUserQuizResponses(userId: string): Observable<QuizResponseResult> {
    return this.http.get<QuizResponseResult>(`${this.baseUrl}/${userId}`, { withCredentials: true });
  }
}
