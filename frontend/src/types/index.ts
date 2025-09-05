// ユーザー関連の型
export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  profile_image?: string;
  interests: string[];
  location?: string;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

// 利用可能日程の型
export interface AvailableDate {
  date: string;
  available: boolean;
  price?: number;
}

// 宿主関連の型
export interface Host {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  property_type: string;
  max_guests: number;
  price_per_night: number;
  amenities: string[];
  house_rules: string[];
  photos: string[];
  available_dates: AvailableDate[];
  is_active: boolean;
  created_at: string;
  user?: User;
}

// 予約関連の型
export interface Booking {
  id: number;
  guest_id: number;
  host_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  created_at: string;
  updated_at: string;
  guest?: User;
  host?: Host;
}

// メッセージ関連の型
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  booking_id?: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

// 認証関連の型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  interests?: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// マッチング関連の型
export interface MatchingResult {
  host: Host;
  matching_score: number;
  reasons: string[];
}

// API レスポンス関連の型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// エラー関連の型
export interface ApiError {
  detail: string;
  status_code: number;
}