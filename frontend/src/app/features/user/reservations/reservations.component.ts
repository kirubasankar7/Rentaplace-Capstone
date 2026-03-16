import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/property.service';
import { Reservation } from '../../../core/models/models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trips-page container">
      <h1>My Trips</h1>
      <p class="subtitle">Your upcoming and past reservations</p>

      @if (loading) { <div class="page-loader"><div class="spinner"></div></div> }
      @else if (reservations.length === 0) {
        <div class="empty">
          <p style="font-size:64px">✈️</p>
          <h3>No trips yet</h3>
          <p>Start exploring and book your first stay!</p>
          <a routerLink="/properties" class="btn btn-primary" style="margin-top:16px">Explore Properties</a>
        </div>
      } @else {
        <div class="trips-grid">
          @for (r of reservations; track r.id) {
            <div class="trip-card">
              <div class="trip-image">
                <img [src]="r.propertyImage || placeholder" alt="" (error)="onImgError($event)" />
                <span [class]="statusClass(r.status)">{{ r.status }}</span>
              </div>
              <div class="trip-body">
                <h3>{{ r.propertyTitle }}</h3>
                <p class="location">📍 {{ r.propertyLocation }}</p>
                <div class="trip-dates">
                  <div class="date-box">
                    <span>Check-in</span>
                    <strong>{{ r.checkIn | date:'MMM d, y' }}</strong>
                  </div>
                  <div class="arrow">→</div>
                  <div class="date-box">
                    <span>Check-out</span>
                    <strong>{{ r.checkOut | date:'MMM d, y' }}</strong>
                  </div>
                </div>
                <div class="trip-footer">
                  <div>
                    <span class="guests">👥 {{ r.guests }} guests</span>
                    <span class="total">₹{{ r.totalPrice | number }}</span>
                  </div>
                  <a [routerLink]="['/properties', r.propertyId]" class="btn btn-outline btn-sm">View Property</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .trips-page { padding: 40px 0 80px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .subtitle { color: var(--gray); margin-bottom: 32px; }
    .empty { text-align: center; padding: 80px 0; color: var(--gray); }
    .empty h3 { font-size: 22px; font-weight: 700; color: var(--dark); margin: 12px 0 8px; }
    .trips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
    .trip-card { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
    .trip-image { position: relative; }
    .trip-image img { width: 100%; height: 200px; object-fit: cover; }
    .trip-image span { position: absolute; top: 12px; right: 12px; }
    .trip-body { padding: 20px; }
    .trip-body h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
    .location { font-size: 13px; color: var(--gray); margin-bottom: 16px; }
    .trip-dates { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 14px; background: var(--bg); border-radius: 8px; }
    .date-box span { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gray); letter-spacing: 0.5px; display: block; }
    .date-box strong { font-size: 14px; }
    .arrow { font-size: 18px; color: var(--gray); }
    .trip-footer { display: flex; justify-content: space-between; align-items: center; }
    .guests { font-size: 13px; color: var(--gray); margin-right: 12px; }
    .total { font-size: 16px; font-weight: 700; }
  `]
})
export class ReservationsComponent implements OnInit {
  private resvSvc = inject(ReservationService);
  reservations: Reservation[] = [];
  loading = true;
  placeholder = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600';

  ngOnInit() {
    this.resvSvc.getMyReservations().subscribe({ next: r => { this.reservations = r; this.loading = false; }, error: () => this.loading = false });
  }
  statusClass(s: string) { return { Pending: 'badge badge-warning', Confirmed: 'badge badge-success', Cancelled: 'badge badge-danger' }[s] || 'badge'; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = this.placeholder; }
}
