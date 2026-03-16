export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  location: string;
  city: string;
  propertyType: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  mainImageUrl?: string;
  imageUrls?: string[];
  ownerId: number;
  ownerName: string;
  features: string[];
}

export interface PropertySearch {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  propertyType?: string;
  features?: string[];
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface Reservation {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage?: string;
  userId: number;
  userName: string;
  userEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  propertyId: number;
  propertyTitle: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface Conversation {
  otherId: number;
  otherName: string;
  propertyId: number;
  propertyTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
