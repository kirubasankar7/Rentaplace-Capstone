import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🏠 RentAPlace</div>
        <h1>Create your account</h1>
        <p class="subtitle">Join thousands of happy travellers</p>

        @if (error) { <div class="alert alert-danger">{{ error }}</div> }

        <form (ngSubmit)="onSubmit()">
          <div class="name-row">
            <div class="form-group">
              <label>First name</label>
              <input class="form-control" [(ngModel)]="form.firstName" name="firstName" placeholder="John" required />
            </div>
            <div class="form-group">
              <label>Last name</label>
              <input class="form-control" [(ngModel)]="form.lastName" name="lastName" placeholder="Doe" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email address</label>
            <input class="form-control" type="email" [(ngModel)]="form.email" name="email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label>Phone number (optional)</label>
            <input class="form-control" type="tel" [(ngModel)]="form.phoneNumber" name="phone" placeholder="+91 98765 43210" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input class="form-control" type="password" [(ngModel)]="form.password" name="password" placeholder="Min. 6 characters" required />
          </div>
          <div class="form-group">
            <label>I am a...</label>
            <div class="role-toggle">
              <button type="button" class="role-btn" [class.active]="form.role === 'User'" (click)="form.role = 'User'">🧳 Traveller</button>
              <button type="button" class="role-btn" [class.active]="form.role === 'Owner'" (click)="form.role = 'Owner'">🏠 Property Owner</button>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%" type="submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
        <p class="switch-link">Already have an account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
    .auth-card { background: white; border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 480px; box-shadow: 0 4px 40px rgba(0,0,0,0.1); }
    .auth-logo { font-size: 22px; font-weight: 800; color: var(--primary); margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
    .subtitle { color: var(--gray); margin-bottom: 28px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .role-btn {
      padding: 12px; border: 2px solid var(--light-gray); border-radius: var(--radius-sm);
      background: white; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .role-btn.active { border-color: var(--primary); color: var(--primary); background: #fff0f3; }
    .switch-link { text-align: center; margin-top: 20px; font-size: 14px; color: var(--gray); }
    .switch-link a { color: var(--primary); font-weight: 600; }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = { firstName: '', lastName: '', email: '', password: '', phoneNumber: '', role: 'User' };
  error = ''; loading = false;

  onSubmit() {
    this.error = ''; this.loading = true;
    this.auth.register(this.form).subscribe({
      next: (u) => this.router.navigate([u.role === 'Owner' ? '/owner/dashboard' : '/']),
      error: (e) => { this.error = e.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
