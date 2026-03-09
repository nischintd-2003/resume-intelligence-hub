import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse, ResumeResponseDTO } from '../types/response.types';

export const resumeService = {
  register: async (minioPath: string): Promise<ResumeResponseDTO> => {
    const response = await api.post<ApiResponse<ResumeResponseDTO>>(API_ENDPOINTS.RESUMES.BASE, {
      minioPath,
    });
    return response.data.data;
  },

  getAll: async (): Promise<ResumeResponseDTO[]> => {
    const response = await api.get<ApiResponse<ResumeResponseDTO[]>>(API_ENDPOINTS.RESUMES.BASE);
    return response.data.data;
  },
};
