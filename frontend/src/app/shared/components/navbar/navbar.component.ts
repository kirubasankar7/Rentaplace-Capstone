import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🏠</span>
          <span class="logo-text">RentAPlace</span>
        </a>

        <div class="nav-actions">
          @if (auth.isLoggedIn) {
            @if (auth.isOwner) {
              <a routerLink="/owner/dashboard" class="nav-link" routerLinkActive="active">Dashboard</a>
              <a routerLink="/owner/add-property" class="nav-link" routerLinkActive="active">Add Property</a>
              <a routerLink="/owner/messages" class="nav-link" routerLinkActive="active">Messages</a>
            } @else {
              <a routerLink="/user/reservations" class="nav-link" routerLinkActive="active">My Trips</a>
              <a routerLink="/user/messages" class="nav-link" routerLinkActive="active">Messages</a>
            }
            <div class="user-menu">
              <span class="user-avatar">{{ initials }}</span>
              <span class="user-name">{{ auth.currentUser()?.firstName }}</span>
              <button class="btn btn-outline btn-sm" (click)="auth.logout()">Logout</button>
            </div>
          } @else {
            <a routerLink="/login" class="nav-link">Log in</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Sign up</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100; background: white;
      border-bottom: 1px solid var(--light-gray);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .nav-container {
      max-width: 1280px; margin: 0 auto; padding: 0 24px;
      height: 80px; display: flex; align-items: center; justify-content: space-between;
    }
    .logo {
      display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 700;
      color: var(--primary);
    }
    .logo-icon { font-size: 28px; }
    .logo-text { letter-spacing: -0.5px; }
    .nav-actions {
      display: flex; align-items: center; gap: 16px;
    }
    .nav-link {
      font-size: 14px; font-weight: 500; color: var(--dark);
      padding: 6px 10px; border-radius: 6px; transition: background 0.15s;
    }
    .nav-link:hover, .nav-link.active { background: var(--bg); }
    .user-menu {
      display: flex; align-items: center; gap: 10px;
      border: 1px solid var(--light-gray); border-radius: 24px;
      padding: 6px 8px 6px 12px;
    }
    .user-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--primary); color: white;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .user-name { font-size: 14px; font-weight: 500; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  get initials() {
    const u = this.auth.currentUser();
    if (!u) return '';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }
}
