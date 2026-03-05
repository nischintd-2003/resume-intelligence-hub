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

export interface RegisterInput extends LoginInput {
  username: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}
