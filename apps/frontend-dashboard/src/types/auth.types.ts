import type { LoginFormValues, RegisterFormValues } from '@/validations/auth.schemas';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponseDTO {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isValidating: boolean;
  login: (data: AuthResponseDTO) => void;
  logout: () => void;
}

export interface BootstrapResult {
  user: User | null;
  isAuthenticated: boolean;
}

export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export type RegisterFieldErrors = Partial<Record<keyof RegisterFormValues, string>>;
