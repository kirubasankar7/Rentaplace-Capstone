import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { Property } from '../../../core/models/models';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent],
  template: `
    <div class="list-page">
      <aside class="filters-panel">
        <h3>Filters</h3>

        <div class="filter-group">
          <label>Location</label>
          <input class="form-control" [(ngModel)]="filters.location" placeholder="City or area" (change)="search()" />
        </div>

        <div class="filter-group">
          <label>Check-in</label>
          <input class="form-control" type="date" [(ngModel)]="filters.checkIn" [min]="today" (change)="search()" />
        </div>

        <div class="filter-group">
          <label>Check-out</label>
          <input class="form-control" type="date" [(ngModel)]="filters.checkOut" [min]="filters.checkIn || today" (change)="search()" />
        </div>

        <div class="filter-group">
          <label>Guests</label>
          <input class="form-control" type="number" [(ngModel)]="filters.guests" min="1" max="20" (change)="search()" />
        </div>

        <div class="filter-group">
          <label>Property Type</label>
          <select class="form-control" [(ngModel)]="filters.propertyType" (change)="search()">
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Features</label>
          <div class="feature-checkboxes">
            @for (f of allFeatures; track f.value) {
              <label class="check-label">
                <input type="checkbox" [value]="f.value" (change)="onFeatureToggle(f.value, $event)" />
                {{ f.label }}
              </label>
            }
          </div>
        </div>

        <div class="filter-group">
          <label>Price per night</label>
          <div class="price-range">
            <input class="form-control" type="number" [(ngModel)]="filters.minPrice" placeholder="Min ₹" (change)="search()" />
            <span>–</span>
            <input class="form-control" type="number" [(ngModel)]="filters.maxPrice" placeholder="Max ₹" (change)="search()" />
          </div>
        </div>

        <button class="btn btn-outline" style="width:100%" (click)="clearFilters()">Clear Filters</button>
      </aside>

      <main class="results">
        <div class="results-header">
          <div class="view-toggle">
            <button class="view-btn" [class.active]="viewMode==='grid'" (click)="viewMode='grid'">⊞ Grid</button>
            <button class="view-btn" [class.active]="viewMode==='list'" (click)="viewMode='list'">☰ List</button>
          </div>
          @if (!loading) {
            <p class="results-count">{{ properties.length }} properties found</p>
          }
        </div>

        @if (loading) {
          <div class="page-loader"><div class="spinner"></div></div>
        } @else if (properties.length === 0) {
          <div class="empty-state">
            <p style="font-size:48px">🔍</p>
            <h3>No properties found</h3>
            <p>Try adjusting your filters</p>
          </div>
        } @else {
          <div [class]="viewMode === 'grid' ? 'props-grid' : 'props-list'">
            @for (p of properties; track p.id) {
              <app-property-card [property]="p" />
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .list-page { display: flex; min-height: calc(100vh - 80px); }
    .filters-panel { width: 280px; flex-shrink: 0; padding: 24px; border-right: 1px solid var(--light-gray); position: sticky; top: 80px; height: calc(100vh - 80px); overflow-y: auto; }
    .filters-panel h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
    .filter-group { margin-bottom: 20px; }
    .filter-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--dark); }
    .price-range { display: flex; align-items: center; gap: 8px; }
    .feature-checkboxes { display: flex; flex-direction: column; gap: 8px; }
    .check-label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
    .check-label input { accent-color: var(--primary); }

    .results { flex: 1; padding: 24px; }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .results-count { color: var(--gray); font-size: 14px; }
    .view-toggle { display: flex; gap: 4px; }
    .view-btn { padding: 7px 14px; border: 1.5px solid var(--light-gray); background: white; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .view-btn.active { border-color: var(--dark); background: var(--dark); color: white; }

    .props-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .props-list { display: flex; flex-direction: column; gap: 16px; }
    .props-list app-property-card { display: block; }

    .empty-state { text-align: center; padding: 80px 24px; color: var(--gray); }
    .empty-state h3 { font-size: 20px; font-weight: 700; color: var(--dark); margin: 12px 0 8px; }

    @media (max-width: 768px) {
      .list-page { flex-direction: column; }
      .filters-panel { width: 100%; position: static; height: auto; border-right: none; border-bottom: 1px solid var(--light-gray); }
    }
  `]
})
export class PropertyListComponent implements OnInit {
  private propSvc = inject(PropertyService);
  private route = inject(ActivatedRoute);

  properties: Property[] = [];
  loading = true;
  viewMode: 'grid' | 'list' = 'grid';
  today = new Date().toISOString().split('T')[0];
  selectedFeatures: string[] = [];

  filters = { location: '', checkIn: '', checkOut: '', guests: 1, propertyType: '', minPrice: undefined as number | undefined, maxPrice: undefined as number | undefined };

  allFeatures = [
    { value: 'Pool', label: '🏊 Pool' }, { value: 'BeachFacing', label: '🌊 Beach' },
    { value: 'Garden', label: '🌿 Garden' }, { value: 'WiFi', label: '📶 WiFi' },
    { value: 'AirConditioning', label: '❄️ AC' }, { value: 'Gym', label: '💪 Gym' },
    { value: 'Parking', label: '🚗 Parking' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['location']) this.filters.location = p['location'];
      if (p['checkIn']) this.filters.checkIn = p['checkIn'];
      if (p['checkOut']) this.filters.checkOut = p['checkOut'];
      if (p['guests']) this.filters.guests = +p['guests'];
      this.search();
    });
  }

  search() {
    this.loading = true;
    this.propSvc.search({ ...this.filters, features: this.selectedFeatures.length ? this.selectedFeatures : undefined }).subscribe({
      next: props => { this.properties = props; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onFeatureToggle(val: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) this.selectedFeatures.push(val);
    else this.selectedFeatures = this.selectedFeatures.filter(f => f !== val);
    this.search();
  }

  clearFilters() {
    this.filters = { location: '', checkIn: '', checkOut: '', guests: 1, propertyType: '', minPrice: undefined, maxPrice: undefined };
    this.selectedFeatures = [];
    this.search();
  }
}
