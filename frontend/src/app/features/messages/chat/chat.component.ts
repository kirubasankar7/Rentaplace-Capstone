import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversation, Message } from '../../../core/models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-page">
      <div class="conversations-panel">
        <h2>Messages</h2>
        @if (loadingConvs) { <div class="spinner"></div> }
        @else if (conversations.length === 0) {
          <div class="empty-convs">
            <p>💬</p>
            <p>No conversations yet</p>
          </div>
        } @else {
          @for (c of conversations; track (c.otherId + '-' + c.propertyId)) {
            <div class="conv-item" [class.active]="isActive(c)" (click)="openConversation(c)">
              <div class="conv-avatar">{{ c.otherName[0] }}</div>
              <div class="conv-info">
                <div class="conv-name-row">
                  <strong>{{ c.otherName }}</strong>
                  <small>{{ c.lastMessageAt | date:'MMM d' }}</small>
                </div>
                <span class="conv-property">{{ c.propertyTitle }}</span>
                <p class="conv-preview">{{ c.lastMessage }}</p>
              </div>
              @if (c.unreadCount > 0) {
                <span class="unread-badge">{{ c.unreadCount }}</span>
              }
            </div>
          }
        }
      </div>

      <div class="chat-panel">
        @if (!activeConv) {
          <div class="no-chat">
            <p style="font-size:48px">💬</p>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the left to start messaging</p>
          </div>
        } @else {
          <div class="chat-header">
            <div class="chat-avatar">{{ activeConv.otherName[0] }}</div>
            <div>
              <strong>{{ activeConv.otherName }}</strong>
              <p>Re: {{ activeConv.propertyTitle }}</p>
            </div>
          </div>
          <div class="messages-area" #msgArea>
            @if (loadingMsgs) { <div class="spinner"></div> }
            @else {
              @for (m of messages; track m.id) {
                <div class="msg-row" [class.mine]="m.senderId === currentUserId">
                  @if (m.senderId !== currentUserId) {
                    <div class="msg-avatar">{{ m.senderName[0] }}</div>
                  }
                  <div class="msg-bubble" [class.bubble-mine]="m.senderId === currentUserId">
                    <p>{{ m.content }}</p>
                    <small>{{ m.sentAt | date:'h:mm a' }}</small>
                  </div>
                </div>
              }
            }
          </div>
          <div class="chat-input-area">
            <textarea [(ngModel)]="newMessage" placeholder="Type a message..." rows="2"
              (keydown.enter)="$event.preventDefault(); sendMessage()"></textarea>
            <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim()">Send →</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-page { display: flex; height: calc(100vh - 80px); }
    .conversations-panel { width: 320px; flex-shrink: 0; border-right: 1px solid var(--light-gray); display: flex; flex-direction: column; overflow: hidden; }
    .conversations-panel h2 { padding: 20px; font-size: 20px; font-weight: 700; border-bottom: 1px solid var(--light-gray); }
    .empty-convs { text-align: center; padding: 60px 20px; color: var(--gray); font-size: 14px; }
    .empty-convs p:first-child { font-size: 40px; margin-bottom: 8px; }
    .conv-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; cursor: pointer; border-bottom: 1px solid var(--bg); transition: background 0.15s; position: relative; }
    .conv-item:hover, .conv-item.active { background: var(--bg); }
    .conv-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .conv-info { flex: 1; min-width: 0; }
    .conv-name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .conv-name-row strong { font-size: 14px; }
    .conv-name-row small { font-size: 11px; color: var(--gray); }
    .conv-property { font-size: 12px; color: var(--primary); display: block; margin-bottom: 2px; }
    .conv-preview { font-size: 13px; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .unread-badge { background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }

    .chat-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--gray); text-align: center; }
    .no-chat h3 { font-size: 20px; font-weight: 700; color: var(--dark); margin: 12px 0 8px; }
    .chat-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--light-gray); background: white; }
    .chat-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .chat-header strong { display: block; font-size: 15px; }
    .chat-header p { font-size: 12px; color: var(--gray); margin: 0; }
    .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); }
    .msg-row { display: flex; align-items: flex-end; gap: 8px; }
    .msg-row.mine { flex-direction: row-reverse; }
    .msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--secondary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .msg-bubble { max-width: 60%; background: white; border-radius: 18px 18px 18px 4px; padding: 10px 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .bubble-mine { background: var(--primary); color: white; border-radius: 18px 18px 4px 18px; }
    .msg-bubble p { font-size: 14px; line-height: 1.5; margin-bottom: 4px; }
    .msg-bubble small { font-size: 11px; opacity: 0.7; }
    .chat-input-area { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--light-gray); background: white; }
    .chat-input-area textarea { flex: 1; border: 1.5px solid var(--light-gray); border-radius: 12px; padding: 10px 14px; font-size: 14px; resize: none; outline: none; transition: border-color 0.2s; }
    .chat-input-area textarea:focus { border-color: var(--primary); }

    @media (max-width: 700px) {
      .conversations-panel { width: 100%; position: absolute; z-index: 10; background: white; }
    }
  `]
})
export class ChatComponent implements OnInit {
  private msgSvc = inject(MessageService);
  private auth = inject(AuthService);
  @ViewChild('msgArea') msgArea!: ElementRef;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  activeConv?: Conversation;
  loadingConvs = true; loadingMsgs = false;
  newMessage = '';
  get currentUserId() { return this.auth.userId; }

  ngOnInit() {
    this.msgSvc.getConversations().subscribe({ next: c => { this.conversations = c; this.loadingConvs = false; }, error: () => this.loadingConvs = false });
  }

  isActive(c: Conversation) { return this.activeConv?.otherId === c.otherId && this.activeConv?.propertyId === c.propertyId; }

  openConversation(c: Conversation) {
    this.activeConv = c; this.loadingMsgs = true;
    this.msgSvc.getThread(c.otherId, c.propertyId).subscribe({ next: msgs => { this.messages = msgs; this.loadingMsgs = false; setTimeout(() => this.scrollBottom(), 100); }, error: () => this.loadingMsgs = false });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeConv) return;
    const user = this.auth.currentUser()!;
    this.msgSvc.send({ receiverId: this.activeConv.otherId, receiverName: this.activeConv.otherName, propertyId: this.activeConv.propertyId, propertyTitle: this.activeConv.propertyTitle, content: this.newMessage }).subscribe({
      next: msg => { this.messages.push(msg); this.newMessage = ''; this.activeConv!.lastMessage = msg.content; setTimeout(() => this.scrollBottom(), 50); },
      error: () => {}
    });
  }

  scrollBottom() {
    if (this.msgArea) this.msgArea.nativeElement.scrollTop = this.msgArea.nativeElement.scrollHeight;
  }
}
