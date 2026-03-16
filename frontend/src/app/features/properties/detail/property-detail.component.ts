import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService, ReservationService } from '../../../core/services/property.service';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models/models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (loading) { <div class="page-loader"><div class="spinner"></div></div> }
    @else if (property) {
      <div class="detail-page container">

        <div class="detail-header">
          <h1>{{ property.title }}</h1>
          <div class="header-meta">
            <span class="star">★</span>
            <strong>{{ property.rating.toFixed(1) }}</strong>
            <span class="gray">({{ property.reviewCount }} reviews)</span>
            <span class="sep">·</span>
            <span class="location">{{ property.location }}, {{ property.city }}</span>
          </div>
        </div>

        <!-- Image Gallery -->
        <div class="gallery">
          <div class="gallery-main" (click)="openGallery(0)">
            <img [src]="property.imageUrls?.[0] || property.mainImageUrl || placeholder"
                 alt="main" (error)="onImgError($event)" />
          </div>
          <div class="gallery-side">
            @for (img of (property.imageUrls || []).slice(1, 5); track img; let i = $index) {
              <div class="gallery-thumb" (click)="openGallery(i+1)">
                <img [src]="img" alt="img" (error)="onImgError($event)" />
                @if (i === 3 && (property.imageUrls?.length || 0) > 5) {
                  <div class="more-overlay">+{{ (property.imageUrls?.length || 0) - 5 }} more</div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Lightbox -->
        @if (lightboxOpen) {
          <div class="lightbox" (click)="lightboxOpen = false">
            <button class="lb-close" (click)="lightboxOpen = false">✕</button>
            <button class="lb-prev" (click)="prevImg($event)">‹</button>
            <img [src]="property.imageUrls?.[lightboxIdx]" alt="gallery" (click)="$event.stopPropagation()" />
            <button class="lb-next" (click)="nextImg($event)">›</button>
          </div>
        }

        <div class="detail-body">
          <div class="detail-main">
            <div class="property-meta">
              <div class="meta-item"><strong>{{ property.propertyType }}</strong><span>Type</span></div>
              <div class="meta-item"><strong>{{ property.maxGuests }}</strong><span>Guests</span></div>
              <div class="meta-item"><strong>{{ property.bedrooms }}</strong><span>Bedrooms</span></div>
              <div class="meta-item"><strong>{{ property.bathrooms }}</strong><span>Bathrooms</span></div>
            </div>
            <hr class="divider" />
            <div class="hosted-by">
              <div class="host-avatar">{{ property.ownerName[0] }}</div>
              <div>
                <strong>Hosted by {{ property.ownerName }}</strong>
                <p class="gray" style="font-size:13px">Property owner</p>
              </div>
            </div>
            <hr class="divider" />
            <h3>About this place</h3>
            <p class="description">{{ property.description }}</p>
            <hr class="divider" />
            <h3>What this place offers</h3>
            <div class="amenities">
              @for (f of property.features; track f) {
                <div class="amenity">{{ featureLabel(f) }}</div>
              }
            </div>

            <!-- Message Owner -->
            @if (auth.isLoggedIn && !auth.isOwner) {
              <hr class="divider" />
              <h3>Message the owner</h3>
              @if (msgSuccess) { <div class="alert alert-success">Message sent successfully!</div> }
              <div class="message-form">
                <textarea class="form-control" [(ngModel)]="messageText" rows="3"
                  placeholder="Hi, I'm interested in booking this property..."></textarea>
                <button class="btn btn-outline" (click)="sendMessage()">Send Message</button>
              </div>
            }
          </div>

          <!-- Booking Card -->
          <div class="booking-card">
            <div class="price-header">
              <span class="big-price">₹{{ property.pricePerNight | number }}</span>
              <span class="gray">/night</span>
            </div>
            <div class="rating-sm">
              <span class="star">★</span> {{ property.rating.toFixed(1) }}
              <span class="gray">({{ property.reviewCount }})</span>
            </div>

            @if (bookingSuccess) {
              <div class="alert alert-success" style="margin-top:16px">Reservation created! <a routerLink="/user/reservations">View trips</a></div>
            } @else if (bookingError) {
              <div class="alert alert-danger">{{ bookingError }}</div>
            }

            @if (!auth.isLoggedIn) {
              <a routerLink="/login" class="btn btn-primary" style="width:100%;margin-top:16px">Log in to book</a>
            } @else if (!auth.isOwner) {
              <div class="booking-form">
                <div class="date-inputs">
                  <div class="date-field">
                    <label>CHECK-IN</label>
                    <input type="date" [(ngModel)]="checkIn" [min]="today" (change)="calcTotal()" />
                  </div>
                  <div class="date-field">
                    <label>CHECK-OUT</label>
                    <input type="date" [(ngModel)]="checkOut" [min]="checkIn||today" (change)="calcTotal()" />
                  </div>
                </div>
                <div class="guests-input">
                  <label>GUESTS</label>
                  <input type="number" [(ngModel)]="guests" min="1" [max]="property.maxGuests" (change)="calcTotal()" />
                </div>
                @if (nights > 0) {
                  <div class="price-breakdown">
                    <div class="pb-row"><span>₹{{ property.pricePerNight | number }} × {{ nights }} nights</span><span>₹{{ totalPrice | number }}</span></div>
                    <hr/><div class="pb-row total"><span>Total</span><span>₹{{ totalPrice | number }}</span></div>
                  </div>
                }
                <button class="btn btn-primary" style="width:100%" [disabled]="!checkIn || !checkOut || bookingLoading" (click)="reserve()">
                  {{ bookingLoading ? 'Reserving...' : 'Reserve' }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-page { padding: 28px 0 60px; }
    .detail-header { margin-bottom: 20px; }
    .detail-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header-meta { display: flex; align-items: center; gap: 6px; font-size: 15px; }
    .sep { color: var(--gray); }
    .gray { color: var(--gray); }

    .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-radius: var(--radius); overflow: hidden; height: 420px; margin-bottom: 32px; }
    .gallery-main { cursor: pointer; overflow: hidden; }
    .gallery-main img { width:100%; height:100%; object-fit:cover; transition: transform 0.3s; }
    .gallery-main:hover img { transform: scale(1.03); }
    .gallery-side { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .gallery-thumb { cursor: pointer; overflow: hidden; position: relative; }
    .gallery-thumb img { width:100%; height:100%; object-fit:cover; transition: transform 0.3s; }
    .gallery-thumb:hover img { transform: scale(1.03); }
    .more-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px; }

    .lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .lightbox img { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:8px; }
    .lb-close { position:absolute; top:20px; right:24px; background:none; border:none; color:white; font-size:28px; cursor:pointer; }
    .lb-prev, .lb-next { position:absolute; background:rgba(255,255,255,0.15); border:none; color:white; font-size:36px; cursor:pointer; padding:8px 16px; border-radius:8px; top:50%; transform:translateY(-50%); }
    .lb-prev { left:16px; } .lb-next { right:16px; }

    .detail-body { display: grid; grid-template-columns: 1fr 380px; gap: 48px; align-items: start; }
    .property-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .meta-item { display: flex; flex-direction: column; align-items: center; background: var(--bg); border-radius: 10px; padding: 16px; }
    .meta-item strong { font-size: 22px; font-weight: 700; }
    .meta-item span { font-size: 12px; color: var(--gray); margin-top: 4px; }
    .divider { border: none; border-top: 1px solid var(--light-gray); margin: 24px 0; }
    .hosted-by { display: flex; align-items: center; gap: 16px; }
    .host-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
    .description { color: var(--gray); line-height: 1.7; }
    .amenities { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .amenity { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .message-form { display: flex; flex-direction: column; gap: 10px; }

    .booking-card { background: white; border: 1px solid var(--light-gray); border-radius: 16px; padding: 28px; position: sticky; top: 100px; box-shadow: var(--shadow); }
    .price-header { display: flex; align-items: baseline; gap: 6px; }
    .big-price { font-size: 26px; font-weight: 700; }
    .rating-sm { font-size: 14px; margin-top: 4px; margin-bottom: 16px; }
    .booking-form { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .date-inputs { display: grid; grid-template-columns: 1fr 1fr; border: 1.5px solid var(--light-gray); border-radius: var(--radius-sm); overflow: hidden; }
    .date-field { padding: 10px 12px; }
    .date-field:first-child { border-right: 1px solid var(--light-gray); }
    .date-field label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; color: var(--dark); }
    .date-field input { border: none; outline: none; font-size: 14px; width: 100%; }
    .guests-input { border: 1.5px solid var(--light-gray); border-radius: var(--radius-sm); padding: 10px 12px; }
    .guests-input label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
    .guests-input input { border: none; outline: none; font-size: 14px; width: 100%; }
    .price-breakdown { background: var(--bg); border-radius: 8px; padding: 14px; }
    .pb-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
    .pb-row.total { font-weight: 700; font-size: 16px; margin-top: 8px; }

    @media (max-width: 900px) {
      .detail-body { grid-template-columns: 1fr; }
      .gallery { height: 280px; }
      .property-meta { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propSvc = inject(PropertyService);
  private resvSvc = inject(ReservationService);
  private msgSvc = inject(MessageService);
  auth = inject(AuthService);

  property?: Property;
  loading = true;
  lightboxOpen = false;
  lightboxIdx = 0;
  checkIn = ''; checkOut = ''; guests = 1;
  nights = 0; totalPrice = 0;
  bookingLoading = false; bookingSuccess = false; bookingError = '';
  messageText = ''; msgSuccess = false;
  today = new Date().toISOString().split('T')[0];
  placeholder = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.propSvc.getById(id).subscribe({
      next: p => { this.property = p; this.loading = false; },
      error: () => this.router.navigate(['/'])
    });
  }

  openGallery(i: number) { this.lightboxIdx = i; this.lightboxOpen = true; }
  prevImg(e: Event) { e.stopPropagation(); this.lightboxIdx = Math.max(0, this.lightboxIdx - 1); }
  nextImg(e: Event) { e.stopPropagation(); this.lightboxIdx = Math.min((this.property?.imageUrls?.length || 1) - 1, this.lightboxIdx + 1); }
  onImgError(e: Event) { (e.target as HTMLImageElement).src = this.placeholder; }

  calcTotal() {
    if (this.checkIn && this.checkOut) {
      this.nights = Math.max(0, (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / 86400000);
      this.totalPrice = this.nights * (this.property?.pricePerNight || 0);
    }
  }

  reserve() {
    this.bookingError = ''; this.bookingLoading = true;
    this.resvSvc.create({ propertyId: this.property!.id, checkIn: this.checkIn, checkOut: this.checkOut, guests: this.guests }).subscribe({
      next: () => { this.bookingSuccess = true; this.bookingLoading = false; },
      error: (e) => { this.bookingError = e.error?.message || 'Booking failed'; this.bookingLoading = false; }
    });
  }

  sendMessage() {
    if (!this.messageText.trim()) return;
    this.msgSvc.send({ receiverId: this.property!.ownerId, receiverName: this.property!.ownerName, propertyId: this.property!.id, propertyTitle: this.property!.title, content: this.messageText }).subscribe({
      next: () => { this.msgSuccess = true; this.messageText = ''; },
      error: () => {}
    });
  }

  featureLabel(f: string) {
    const map: Record<string, string> = { Pool: '🏊 Pool', BeachFacing: '🌊 Beach Facing', Garden: '🌿 Garden', WiFi: '📶 WiFi', AirConditioning: '❄️ Air Conditioning', Gym: '💪 Gym', Parking: '🚗 Parking', PetFriendly: '🐾 Pet Friendly' };
    return map[f] || f;
  }
}
