import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Property } from '../../../core/models/models';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <a [routerLink]="['/properties', property.id]" class="property-card">
      <div class="image-wrap">
        <img [src]="property.mainImageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'"
             [alt]="property.title" loading="lazy" (error)="onImgError($event)"/>
        <div class="type-badge">{{ property.propertyType }}</div>
        @if (property.rating >= 4.8) {
          <div class="guest-fav">⭐ Guest Favourite</div>
        }
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <h3 class="prop-title">{{ property.title }}</h3>
          <div class="rating">
            <span class="star">★</span>
            <span>{{ property.rating.toFixed(1) }}</span>
          </div>
        </div>
        <p class="prop-location">{{ property.city }}</p>
        <p class="prop-guests">Up to {{ property.maxGuests }} guests</p>
        <div class="features">
          @for (f of property.features.slice(0, 3); track f) {
            <span class="feature-chip">{{ featureLabel(f) }}</span>
          }
        </div>
        <div class="price-row">
          <span class="price">₹{{ property.pricePerNight | number }}</span>
          <span class="per-night">/night</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .property-card {
      display: block; border-radius: var(--radius); overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
      text-decoration: none; color: inherit;
    }
    .property-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
    .image-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--light-gray); }
    .image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .property-card:hover .image-wrap img { transform: scale(1.04); }
    .type-badge {
      position: absolute; top: 12px; left: 12px;
      background: white; border-radius: 6px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--dark); box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    }
    .guest-fav {
      position: absolute; bottom: 12px; left: 12px;
      background: white; border-radius: 6px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
    }
    .card-body { padding: 14px; }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .prop-title { font-size: 15px; font-weight: 600; line-height: 1.3; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .rating { display: flex; align-items: center; gap: 3px; font-size: 14px; font-weight: 500; white-space: nowrap; }
    .prop-location { font-size: 13px; color: var(--gray); margin-top: 3px; }
    .prop-guests { font-size: 13px; color: var(--gray); }
    .features { display: flex; flex-wrap: wrap; gap: 5px; margin: 8px 0; }
    .feature-chip {
      padding: 3px 8px; background: var(--bg); border-radius: 20px;
      font-size: 11px; font-weight: 500; color: var(--gray);
    }
    .price-row { display: flex; align-items: baseline; gap: 3px; margin-top: 8px; }
    .price { font-size: 16px; font-weight: 700; }
    .per-night { font-size: 13px; color: var(--gray); }
  `]
})
export class PropertyCardComponent {
  @Input() property!: Property;

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600';
  }

  featureLabel(f: string): string {
    const map: Record<string, string> = {
      Pool: '🏊 Pool', BeachFacing: '🌊 Beach', Garden: '🌿 Garden',
      WiFi: '📶 WiFi', AirConditioning: '❄️ AC', Gym: '💪 Gym',
      Parking: '🚗 Parking', PetFriendly: '🐾 Pets'
    };
    return map[f] || f;
  }
}
