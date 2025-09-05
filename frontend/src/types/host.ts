export interface Host {
  id: number;
  title: string;
  description: string;
  location: string;
  property_type: string;
  max_guests: number;
  amenities: string[];
  house_rules: string[];
  photos: string[];
  price_per_night: number;
  available_dates: AvailableDate[];
  is_active: boolean;
  created_at: string;
  host_user: {
    id: number;
    name: string;
    interests: string[];
    rating: number;
    review_count: number;
  };
  match_rate?: number;
  match_reason?: string;
}

export interface AvailableDate {
  start_date: string;
  end_date: string;
  status: 'available' | 'partially_available' | 'unavailable';
}