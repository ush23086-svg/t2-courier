import { CourierProfile } from './courier';

export interface AuthSession {
  token: string;
  refreshToken?: string;
  courier: CourierProfile;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  pin: string;
}

export interface AuthResponse {
  session: AuthSession;
}
