import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Message, Conversation } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private base = `${environment.messagingApiUrl}/messages`;
  constructor(private http: HttpClient) {}

  send(data: { receiverId: number; receiverName: string; propertyId: number; propertyTitle: string; content: string }): Observable<Message> {
    return this.http.post<Message>(this.base, data);
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}/conversations`);
  }

  getThread(otherUserId: number, propertyId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/${otherUserId}/${propertyId}`);
  }
}
