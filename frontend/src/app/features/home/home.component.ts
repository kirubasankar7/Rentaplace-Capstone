import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { Property } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PropertyCardComponent],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Find your perfect place to stay</h1>
        <p>Discover amazing homes, villas, and apartments for every occasion</p>
        <div class="search-bar">
          <div class="search-field">
            <label>Where</label>
            <input [(ngModel)]="searchLocation" placeholder="Search destinations..." />
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <label>Check in</label>
            <input type="date" [(ngModel)]="checkIn" [min]="today" />
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <label>Check out</label>
            <input type="date" [(ngModel)]="checkOut" [min]="checkIn || today" />
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <label>Guests</label>
            <input type="number" [(ngModel)]="guests" min="1" max="20" placeholder="1" />
          </div>
          <button class="search-btn" (click)="onSearch()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </div>
    </section>

    <!-- Category filters -->
    <section class="categories container">
      @for (cat of categories; track cat.label) {
        <button class="cat-btn" [class.active]="activeType === cat.type" (click)="filterByType(cat.type)">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      }
    </section>

    <!-- Top Rated -->
    <section class="properties-section container">
      <div class="section-header">
        <h2>{{ activeType ? activeType + 's' : 'Top Rated Stays' }}</h2>
        <a routerLink="/properties" class="see-all">See all →</a>
      </div>

      @if (loading) {
        <div class="page-loader"><div class="spinner"></div></div>
      } @else if (properties.length === 0) {
        <div class="empty-state">
          <p>No properties found. Try a different category.</p>
        </div>
      } @else {
        <div class="properties-grid">
          @for (p of filteredProperties; track p.id) {
            <app-property-card [property]="p" />
          }
        </div>
      }
    </section>

    <!-- Why RentAPlace -->
    <section class="features-section">
      <div class="container">
        <h2>Why RentAPlace?</h2>
        <div class="features-grid">
          @for (f of features; track f.title) {
            <div class="feature-card">
              <span class="feature-icon">{{ f.icon }}</span>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #FF385C 0%, #BD1E59 100%);
      padding: 80px 24px;
      text-align: center;
      color: white;
    }
    .hero-content { max-width: 900px; margin: 0 auto; }
    .hero h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 800; margin-bottom: 12px; letter-spacing: -1px; }
    .hero p { font-size: 18px; opacity: 0.9; margin-bottom: 40px; }

    .search-bar {
      background: white; border-radius: 60px; display: flex; align-items: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.2); overflow: hidden;
      flex-wrap: wrap;
    }
    .search-field { flex: 1; padding: 14px 20px; min-width: 120px; }
    .search-field label { display: block; font-size: 11px; font-weight: 700; color: var(--dark); text-transform: uppercase; letter-spacing: 0.5px; }
    .search-field input { border: none; outline: none; font-size: 14px; color: var(--dark); width: 100%; padding: 0; background: transparent; }
    .search-divider { width: 1px; height: 36px; background: var(--light-gray); flex-shrink: 0; }
    .search-btn {
      display: flex; align-items: center; gap: 8px;
      background: var(--primary); color: white; border: none;
      margin: 6px; padding: 14px 24px; border-radius: 50px;
      font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;
      flex-shrink: 0;
    }
    .search-btn:hover { background: var(--primary-dark); }

    .categories {
      display: flex; gap: 8px; overflow-x: auto; padding: 24px 0 12px;
      scrollbar-width: none;
    }
    .categories::-webkit-scrollbar { display: none; }
    .cat-btn {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 12px 20px; border: 2px solid transparent; border-radius: 12px;
      background: transparent; cursor: pointer; transition: all 0.2s;
      white-space: nowrap; font-size: 13px; font-weight: 500; color: var(--gray);
    }
    .cat-btn.active, .cat-btn:hover { border-color: var(--dark); color: var(--dark); }
    .cat-icon { font-size: 22px; }

    .properties-section { padding: 20px 0 60px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .section-header h2 { font-size: 24px; font-weight: 700; }
    .see-all { font-size: 14px; font-weight: 600; color: var(--primary); }
    .properties-grid {
      display: grid; gap: 24px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    .empty-state { text-align: center; padding: 60px; color: var(--gray); }

    .features-section { background: var(--bg); padding: 64px 0; }
    .features-section h2 { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 40px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .feature-card { background: white; border-radius: var(--radius); padding: 28px 24px; text-align: center; box-shadow: var(--shadow); }
    .feature-icon { font-size: 36px; display: block; margin-bottom: 14px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; color: var(--gray); line-height: 1.6; }
  `]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private propSvc = inject(PropertyService);

  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = true;
  searchLocation = '';
  checkIn = '';
  checkOut = '';
  guests = 1;
  activeType = '';
  today = new Date().toISOString().split('T')[0];

  categories = [
    { icon: '🏠', label: 'All', type: '' },
    { icon: '🏢', label: 'Apartments', type: 'Apartment' },
    { icon: '🏡', label: 'Villas', type: 'Villa' },
    { icon: '🏘️', label: 'Houses', type: 'House' },
    { icon: '🏗️', label: 'Flats', type: 'Flat' },
  ];

  features = [
    { icon: '🔒', title: 'Safe & Secure', desc: 'All properties are verified and secure for your stay.' },
    { icon: '💳', title: 'Easy Booking', desc: 'Reserve in just a few clicks with instant confirmation.' },
    { icon: '🌟', title: 'Top Rated', desc: 'Browse thousands of 5-star reviewed properties.' },
    { icon: '💬', title: '24/7 Support', desc: 'Chat directly with owners for any questions.' },
  ];

  ngOnInit() {
    this.propSvc.getTopRated().subscribe({
      next: props => { this.properties = props; this.filteredProperties = props; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterByType(type: string) {
    this.activeType = type;
    this.filteredProperties = type ? this.properties.filter(p => p.propertyType === type) : this.properties;
  }

  onSearch() {
    this.router.navigate(['/properties'], {
      queryParams: {
        location: this.searchLocation || undefined,
        checkIn: this.checkIn || undefined,
        checkOut: this.checkOut || undefined,
        guests: this.guests > 1 ? this.guests : undefined
      }
    });
  }
}
