import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'rentaplace_user';
  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try {
      const s = localStorage.getItem(this.STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  register(data: any) {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  login(email: string, password: string) {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setUser(user: User) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  get token() { return this.currentUser()?.token; }
  get isLoggedIn() { return !!this.currentUser(); }
  get isOwner() { return this.currentUser()?.role === 'Owner'; }
  get userId() { return this.currentUser()?.userId; }
}
