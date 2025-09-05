export interface User {
  id: number;
  name: string;
  email: string;
  interests: string[];
  location?: string;
  bio?: string;
  profile_image?: string;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface UserSignup {
  name: string;
  email: string;
  password: string;
  interests: string[];
  location?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}