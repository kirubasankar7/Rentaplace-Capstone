import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Property, PropertySearch, Reservation } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private base = `${environment.apiUrl}/properties`;
  constructor(private http: HttpClient) {}

  getTopRated(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.base}/top-rated`);
  }

  search(s: PropertySearch): Observable<Property[]> {
    let params = new HttpParams();
    if (s.location) params = params.set('location', s.location);
    if (s.checkIn) params = params.set('checkIn', s.checkIn);
    if (s.checkOut) params = params.set('checkOut', s.checkOut);
    if (s.propertyType) params = params.set('propertyType', s.propertyType);
    if (s.guests) params = params.set('guests', s.guests.toString());
    if (s.minPrice) params = params.set('minPrice', s.minPrice.toString());
    if (s.maxPrice) params = params.set('maxPrice', s.maxPrice.toString());
    if (s.features?.length) s.features.forEach(f => { params = params.append('features', f); });
    return this.http.get<Property[]>(this.base, { params });
  }

  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.base}/${id}`);
  }

  getOwnerProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.base}/owner`);
  }

  create(data: any): Observable<Property> {
    return this.http.post<Property>(this.base, data);
  }

  update(id: number, data: any): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadImages(propertyId: number, files: File[]): Observable<any> {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return this.http.post(`${this.base}/${propertyId}/images`, fd);
  }
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base = `${environment.apiUrl}/reservations`;
  constructor(private http: HttpClient) {}

  create(data: any): Observable<Reservation> {
    return this.http.post<Reservation>(this.base, data);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.base);
  }

  updateStatus(id: number, status: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.base}/${id}/status`, { status });
  }
}
