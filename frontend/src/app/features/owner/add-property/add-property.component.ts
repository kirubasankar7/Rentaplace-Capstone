import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-page container">
      <div class="form-card">
        <h1>{{ isEdit ? 'Edit Property' : 'Add New Property' }}</h1>
        <p class="subtitle">{{ isEdit ? 'Update your property details' : 'List your property on RentAPlace' }}</p>

        @if (error) { <div class="alert alert-danger">{{ error }}</div> }
        @if (success) { <div class="alert alert-success">{{ success }}</div> }

        <form (ngSubmit)="onSubmit()">
          <div class="section-title">Basic Information</div>
          <div class="form-group">
            <label>Property Title *</label>
            <input class="form-control" [(ngModel)]="form.title" name="title" placeholder="e.g. Luxury Beachfront Villa" required />
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea class="form-control" [(ngModel)]="form.description" name="description" rows="4" placeholder="Describe your property..." required></textarea>
          </div>
          <div class="two-col">
            <div class="form-group">
              <label>City *</label>
              <input class="form-control" [(ngModel)]="form.city" name="city" placeholder="e.g. Chennai" required />
            </div>
            <div class="form-group">
              <label>Location / Area *</label>
              <input class="form-control" [(ngModel)]="form.location" name="location" placeholder="e.g. Kovalam Beach Road" required />
            </div>
          </div>
          <div class="two-col">
            <div class="form-group">
              <label>Property Type *</label>
              <select class="form-control" [(ngModel)]="form.propertyType" name="propertyType" required>
                <option value="">Select type</option>
                <option>Apartment</option><option>Villa</option><option>House</option><option>Flat</option>
              </select>
            </div>
            <div class="form-group">
              <label>Price Per Night (₹) *</label>
              <input class="form-control" type="number" [(ngModel)]="form.pricePerNight" name="price" min="0" required />
            </div>
          </div>
          <div class="three-col">
            <div class="form-group">
              <label>Max Guests</label>
              <input class="form-control" type="number" [(ngModel)]="form.maxGuests" name="guests" min="1" />
            </div>
            <div class="form-group">
              <label>Bedrooms</label>
              <input class="form-control" type="number" [(ngModel)]="form.bedrooms" name="bedrooms" min="0" />
            </div>
            <div class="form-group">
              <label>Bathrooms</label>
              <input class="form-control" type="number" [(ngModel)]="form.bathrooms" name="bathrooms" min="0" />
            </div>
          </div>
          @if (isEdit) {
            <div class="form-group">
              <label class="check-label" style="flex-direction:row;gap:10px">
                <input type="checkbox" [(ngModel)]="form.isAvailable" name="isAvailable" />
                Property is available for booking
              </label>
            </div>
          }
          <div class="section-title">Amenities & Features</div>
          <div class="features-grid">
            @for (f of allFeatures; track f.value) {
              <label class="feature-toggle" [class.selected]="isSelected(f.value)" (click)="toggleFeature(f.value)">
                <span>{{ f.label }}</span>
              </label>
            }
          </div>
          <div class="section-title">Property Images</div>
          <div class="image-upload-area" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <input #fileInput type="file" multiple accept="image/*" hidden (change)="onFileChange($event)" />
            <p>📷 Click or drag up to 5 images here</p>
            <small>JPG, PNG, WEBP (max 5MB each)</small>
          </div>
          @if (previewUrls.length > 0) {
            <div class="image-previews">
              @for (url of previewUrls; track url; let i = $index) {
                <div class="preview-item">
                  <img [src]="url" alt="preview" />
                  <button type="button" class="remove-img" (click)="removeImg(i)">✕</button>
                </div>
              }
            </div>
          }
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="router.navigate(['/owner/dashboard'])">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Property') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { padding: 40px 0 80px; }
    .form-card { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; padding: 48px; box-shadow: var(--shadow); }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .subtitle { color: var(--gray); margin-bottom: 32px; }
    .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray); margin: 28px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--light-gray); }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 8px; }
    .feature-toggle { padding: 10px 14px; border: 2px solid var(--light-gray); border-radius: 8px; cursor: pointer; text-align: center; font-size: 13px; font-weight: 500; transition: all 0.2s; user-select: none; }
    .feature-toggle.selected { border-color: var(--primary); background: #fff0f3; color: var(--primary); }
    .image-upload-area { border: 2px dashed var(--light-gray); border-radius: var(--radius); padding: 40px; text-align: center; cursor: pointer; transition: border-color 0.2s; color: var(--gray); }
    .image-upload-area:hover { border-color: var(--primary); }
    .image-upload-area p { font-size: 16px; margin-bottom: 6px; }
    .image-previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .preview-item { position: relative; }
    .preview-item img { width: 100px; height: 80px; object-fit: cover; border-radius: 8px; }
    .remove-img { position: absolute; top: -6px; right: -6px; background: var(--primary); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
    @media (max-width: 600px) { .two-col, .three-col, .features-grid { grid-template-columns: 1fr; } }
  `]
})
export class AddPropertyComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private propSvc = inject(PropertyService);

  isEdit = false;
  editId?: number;
  loading = false; error = ''; success = '';
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  form = { title: '', description: '', location: '', city: '', propertyType: '', pricePerNight: 0, maxGuests: 2, bedrooms: 1, bathrooms: 1, isAvailable: true, features: [] as string[] };

  allFeatures = [
    { value: 'Pool', label: '🏊 Pool' }, { value: 'BeachFacing', label: '🌊 Beach' },
    { value: 'Garden', label: '🌿 Garden' }, { value: 'WiFi', label: '📶 WiFi' },
    { value: 'AirConditioning', label: '❄️ AC' }, { value: 'Gym', label: '💪 Gym' },
    { value: 'Parking', label: '🚗 Parking' }, { value: 'PetFriendly', label: '🐾 Pets' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true; this.editId = +id;
      this.propSvc.getById(+id).subscribe((p: any) => {
        this.form = { title: p.title, description: p.description || '', location: p.location, city: p.city, propertyType: p.propertyType, pricePerNight: p.pricePerNight, maxGuests: p.maxGuests, bedrooms: p.bedrooms || 1, bathrooms: p.bathrooms || 1, isAvailable: p.isAvailable, features: p.features };
        if (p.imageUrls) this.previewUrls = p.imageUrls;
      });
    }
  }

  isSelected(v: string) { return this.form.features.includes(v); }
  toggleFeature(v: string) {
    const i = this.form.features.indexOf(v);
    if (i === -1) this.form.features.push(v); else this.form.features.splice(i, 1);
  }

  onFileChange(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    this.addFiles(files);
  }
  onDrop(e: DragEvent) { e.preventDefault(); this.addFiles(Array.from(e.dataTransfer?.files || [])); }
  addFiles(files: File[]) {
    files.slice(0, 5 - this.selectedFiles.length).forEach((f: File) => {
      this.selectedFiles.push(f);
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => this.previewUrls.push(ev.target?.result as string);
      reader.readAsDataURL(f);
    });
  }
  removeImg(i: number) { this.selectedFiles.splice(i, 1); this.previewUrls.splice(i, 1); }

  onSubmit() {
    this.error = ''; this.loading = true;
    if (this.isEdit) {
      this.propSvc.update(this.editId!, this.form).subscribe({
        next: () => this.handleAfterSave(this.editId!),
        error: (e: any) => { this.error = e.error?.message || 'Failed to save property'; this.loading = false; }
      });
    } else {
      this.propSvc.create(this.form).subscribe({
        next: (res: any) => this.handleAfterSave(res.id),
        error: (e: any) => { this.error = e.error?.message || 'Failed to save property'; this.loading = false; }
      });
    }
  }

  private handleAfterSave(propId: number) {
    if (this.selectedFiles.length > 0) {
      this.propSvc.uploadImages(propId, this.selectedFiles).subscribe({
        next: () => { this.success = 'Property saved!'; this.loading = false; setTimeout(() => this.router.navigate(['/owner/dashboard']), 1200); },
        error: () => { this.success = 'Property saved (image upload failed).'; this.loading = false; setTimeout(() => this.router.navigate(['/owner/dashboard']), 1500); }
      });
    } else {
      this.success = 'Property saved!'; this.loading = false;
      setTimeout(() => this.router.navigate(['/owner/dashboard']), 1000);
    }
  }
}
