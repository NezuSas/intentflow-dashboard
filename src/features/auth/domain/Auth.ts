export interface AuthUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  profile_image_url?: string | null;
  is_active?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: AuthUser;
}

export interface RefreshResponse {
  access: string;
}
