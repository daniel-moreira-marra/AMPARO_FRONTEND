export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  is_verified: boolean;
  role: 'ELDER' | 'CAREGIVER' | 'FAMILY' | 'PROFESSIONAL' | 'INSTITUTION';
}

export interface Post {
  id: number;
  content: string;
  image?: string;
  tags?: string[];
  author: {
    id: number;
    full_name: string;
    avatar?: string;
    role?: string;
  };
  created_at: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface AuthResponse {
  success: boolean;
  data: {
    access: string;
    refresh: string;
  };
}
