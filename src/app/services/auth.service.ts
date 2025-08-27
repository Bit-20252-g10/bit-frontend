import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environment/environment.development';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      map(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('AuthService caught error:', error);
        // Re-throw the error in a consistent format
        const formattedError = {
          status: error.status,
          statusText: error.statusText,
          error: error.error
        };
        console.log('Re-throwing formatted error:', formattedError);
        return throwError(() => formattedError);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }
    return this.http.get<{ message: string; user: any }>(`${this.apiUrl}/verify`).pipe(
      map(response => !!response.user),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }
} 
