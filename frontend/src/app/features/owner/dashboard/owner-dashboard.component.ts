import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService, ReservationService } from '../../../core/services/property.service';
import { Property, Reservation } from '../../../core/models/models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard container">
      <div class="dash-header">
        <h1>Owner Dashboard</h1>
        <a routerLink="/owner/add-property" class="btn btn-primary">+ Add Property</a>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🏠</span>
          <div><h3>{{ properties.length }}</h3><p>Properties</p></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📅</span>
          <div><h3>{{ reservations.length }}</h3><p>Total Reservations</p></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div><h3>{{ confirmed }}</h3><p>Confirmed</p></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <div><h3>₹{{ revenue | number }}</h3><p>Total Revenue</p></div>
        </div>
      </div>

      <!-- Properties -->
      <section class="section">
        <h2>My Properties</h2>
        @if (loadingProps) { <div class="spinner"></div> }
        @else if (properties.length === 0) {
          <div class="empty-state">
            <p>No properties yet. <a routerLink="/owner/add-property">Add your first property →</a></p>
          </div>
        } @else {
          <div class="props-table">
            <div class="table-header">
              <span>Property</span><span>Type</span><span>Price/Night</span><span>Status</span><span>Actions</span>
            </div>
            @for (p of properties; track p.id) {
              <div class="table-row">
                <div class="prop-info">
                  <img [src]="p.mainImageUrl || placeholder" alt="" (error)="onImgError($event)" />
                  <div>
                    <strong>{{ p.title }}</strong>
                    <span>{{ p.city }}</span>
                  </div>
                </div>
                <span>{{ p.propertyType }}</span>
                <span>₹{{ p.pricePerNight | number }}</span>
                <span>
                  <span [class]="'badge ' + (p.isAvailable ? 'badge-success' : 'badge-danger')">
                    {{ p.isAvailable ? 'Available' : 'Unavailable' }}
                  </span>
                </span>
                <div class="actions">
                  <a [routerLink]="['/properties', p.id]" class="btn btn-outline btn-sm">View</a>
                  <a [routerLink]="['/owner/edit-property', p.id]" class="btn btn-outline btn-sm">Edit</a>
                  <button class="btn btn-sm" style="background:#FEF2F2;color:#DC2626;border:none" (click)="deleteProperty(p.id)">Delete</button>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Reservations -->
      <section class="section">
        <h2>Incoming Reservations</h2>
        @if (loadingResvs) { <div class="spinner"></div> }
        @else if (reservations.length === 0) {
          <p class="text-gray">No reservations yet.</p>
        } @else {
          <div class="resvs-table">
            <div class="table-header resv-grid">
              <span>Guest</span><span>Property</span><span>Dates</span><span>Total</span><span>Status</span><span>Action</span>
            </div>
            @for (r of reservations; track r.id) {
              <div class="table-row resv-grid">
                <div><strong>{{ r.userName }}</strong><br/><small>{{ r.userEmail }}</small></div>
                <span>{{ r.propertyTitle }}</span>
                <div><small>{{ r.checkIn | date:'MMM d' }} – {{ r.checkOut | date:'MMM d, y' }}</small></div>
                <span>₹{{ r.totalPrice | number }}</span>
                <span><span [class]="statusClass(r.status)">{{ r.status }}</span></span>
                <div class="action-btns">
                  @if (r.status === 'Pending') {
                    <button class="btn btn-sm badge-success" style="border:none;cursor:pointer" (click)="updateStatus(r.id, 'Confirmed')">Confirm</button>
                    <button class="btn btn-sm badge-danger" style="border:none;cursor:pointer" (click)="updateStatus(r.id, 'Cancelled')">Cancel</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px 0 60px; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .dash-header h1 { font-size: 28px; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: white; border-radius: var(--radius); padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow); }
    .stat-icon { font-size: 36px; }
    .stat-card h3 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .stat-card p { font-size: 13px; color: var(--gray); }
    .section { margin-bottom: 48px; }
    .section h2 { font-size: 22px; font-weight: 700; margin-bottom: 20px; }
    .props-table, .resvs-table { border: 1px solid var(--light-gray); border-radius: var(--radius); overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; padding: 14px 20px; background: var(--bg); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray); }
    .resv-grid { grid-template-columns: 1.5fr 1.5fr 1.5fr 1fr 1fr 1fr !important; }
    .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; padding: 16px 20px; border-top: 1px solid var(--light-gray); align-items: center; font-size: 14px; }
    .table-row.resv-grid { grid-template-columns: 1.5fr 1.5fr 1.5fr 1fr 1fr 1fr; }
    .prop-info { display: flex; align-items: center; gap: 12px; }
    .prop-info img { width: 52px; height: 40px; border-radius: 6px; object-fit: cover; }
    .prop-info strong { display: block; font-size: 14px; font-weight: 600; }
    .prop-info span { font-size: 12px; color: var(--gray); }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .action-btns { display: flex; gap: 6px; }
    .text-gray { color: var(--gray); }
    .empty-state { padding: 30px; color: var(--gray); }
    .empty-state a { color: var(--primary); font-weight: 600; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  private propSvc = inject(PropertyService);
  private resvSvc = inject(ReservationService);

  properties: Property[] = [];
  reservations: Reservation[] = [];
  loadingProps = true; loadingResvs = true;
  placeholder = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200';

  get confirmed() { return this.reservations.filter(r => r.status === 'Confirmed').length; }
  get revenue() { return this.reservations.filter(r => r.status === 'Confirmed').reduce((s, r) => s + r.totalPrice, 0); }

  ngOnInit() {
    this.propSvc.getOwnerProperties().subscribe({ next: p => { this.properties = p; this.loadingProps = false; }, error: () => this.loadingProps = false });
    this.resvSvc.getMyReservations().subscribe({ next: r => { this.reservations = r; this.loadingResvs = false; }, error: () => this.loadingResvs = false });
  }

  deleteProperty(id: number) {
    if (!confirm('Delete this property?')) return;
    this.propSvc.delete(id).subscribe({ next: () => this.properties = this.properties.filter(p => p.id !== id) });
  }

  updateStatus(id: number, status: string) {
    this.resvSvc.updateStatus(id, status).subscribe({ next: r => { const idx = this.reservations.findIndex(x => x.id === id); if (idx !== -1) this.reservations[idx] = r; } });
  }

  statusClass(s: string) { return { Pending: 'badge badge-warning', Confirmed: 'badge badge-success', Cancelled: 'badge badge-danger' }[s] || 'badge'; }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = this.placeholder; }
}
