import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { LoginInput, RegisterInput, AuthResponseDTO } from '../types/auth.types';
import type { ApiResponse } from '../types/response.types';

export const authService = {
  login: async (credentials: LoginInput): Promise<AuthResponseDTO> => {
    const response = await api.post<ApiResponse<AuthResponseDTO>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return response.data.data;
  },

  register: async (userData: RegisterInput): Promise<AuthResponseDTO> => {
    const response = await api.post<ApiResponse<AuthResponseDTO>>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData,
    );
    return response.data.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
