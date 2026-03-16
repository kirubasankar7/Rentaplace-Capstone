import { Routes } from '@angular/router';
import { authGuard, ownerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'properties', loadComponent: () => import('./features/properties/list/property-list.component').then(m => m.PropertyListComponent) },
  { path: 'properties/:id', loadComponent: () => import('./features/properties/detail/property-detail.component').then(m => m.PropertyDetailComponent) },
  {
    path: 'owner',
    canActivate: [authGuard, ownerGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/owner/dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent) },
      { path: 'add-property', loadComponent: () => import('./features/owner/add-property/add-property.component').then(m => m.AddPropertyComponent) },
      { path: 'edit-property/:id', loadComponent: () => import('./features/owner/add-property/add-property.component').then(m => m.AddPropertyComponent) },
      { path: 'messages', loadComponent: () => import('./features/messages/chat/chat.component').then(m => m.ChatComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      { path: 'reservations', loadComponent: () => import('./features/user/reservations/reservations.component').then(m => m.ReservationsComponent) },
      { path: 'messages', loadComponent: () => import('./features/messages/chat/chat.component').then(m => m.ChatComponent) },
      { path: '', redirectTo: 'reservations', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
