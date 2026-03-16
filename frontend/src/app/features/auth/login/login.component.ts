import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🏠 RentAPlace</div>
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to your account</p>

        @if (error) { <div class="alert alert-danger">{{ error }}</div> }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email address</label>
            <input class="form-control" type="email" [(ngModel)]="email" name="email"
                   placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input class="form-control" type="password" [(ngModel)]="password" name="password"
                   placeholder="Enter your password" required />
          </div>
          <button class="btn btn-primary" style="width:100%" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="demo-creds">
          <strong>Demo accounts:</strong><br/>
          User: user&#64;rentaplace.com / password123<br/>
          Owner: owner&#64;rentaplace.com / password123
        </div>

        <p class="switch-link">Don't have an account? <a routerLink="/register">Sign up</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
    .auth-card { background: white; border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 440px; box-shadow: 0 4px 40px rgba(0,0,0,0.1); }
    .auth-logo { font-size: 22px; font-weight: 800; color: var(--primary); margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .subtitle { color: var(--gray); margin-bottom: 28px; }
    .demo-creds { margin-top: 20px; padding: 14px; background: var(--bg); border-radius: 8px; font-size: 13px; color: var(--gray); line-height: 1.8; }
    .switch-link { text-align: center; margin-top: 20px; font-size: 14px; color: var(--gray); }
    .switch-link a { color: var(--primary); font-weight: 600; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; error = ''; loading = false;

  onSubmit() {
    this.error = ''; this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (u) => this.router.navigate([u.role === 'Owner' ? '/owner/dashboard' : '/']),
      error: (e) => { this.error = e.error?.message || 'Invalid credentials'; this.loading = false; }
    });
  }
}
