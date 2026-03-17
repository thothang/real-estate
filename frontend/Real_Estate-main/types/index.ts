export type PropertyType = 'house' | 'apartment' | 'villa' | 'townhouse' | 'land' | 'office';
export type ListingType = 'sale' | 'rent';
export type LegalStatus = 'red_book' | 'pink_book' | 'contract' | 'unknown';
export type Direction = 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
export type ListingStatus = 'draft' | 'published' | 'sold' | 'rented';
export type ContactStatus = 'new' | 'contacted' | 'resolved';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  timestamp: string;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  direction?: Direction;
  legal_status: LegalStatus;
  description: string;
  status: ListingStatus;
  address: {
    full_address: string;
    ward: string;
    district: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  structure: {
    floors: number;
    bedrooms: number;
    bathrooms: number;
    living_rooms: number;
    kitchens: number;
    mezzanine: boolean;
    balcony: boolean;
  };
  area: {
    width?: number;
    length?: number;
    land_area: number;
    usable_area?: number;
  };
  features: { id: string; name: string }[];
  images: { id: string; url: string; is_primary: boolean }[];
  contact?: {
    name: string;
    phone: string;
    zalo_phone: string;
  };
}

export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface ContactRequest {
  id: string;
  property_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
  status: ContactStatus;
  notes?: string;
  property?: {
    id: string;
    title: string;
  };
  created_at: string;
}

export interface PropertyFormPayload {
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  direction?: Direction;
  legal_status: LegalStatus;
  description: string;
  status: ListingStatus;
  address: {
    full_address: string;
    district: string;
    city: string;
    ward?: string;
  };
  structure: {
    floors: number;
    bedrooms: number;
    bathrooms: number;
    balcony: boolean;
  };
  area: {
    land_area: number;
    usable_area: number;
  };
  feature_ids: string[];
}
