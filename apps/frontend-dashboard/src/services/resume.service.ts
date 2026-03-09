import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse } from '../types/response.types';

export interface ResumeResponseDTO {
  id: string;
  minioPath: string;
  status: string;
  createdAt: string;
}

export const resumeService = {
  /**
   * Register a resume that has already been uploaded to MinIO via TUS.
   * Triggers the OCR queue on the backend.
   *
   * @param minioPath  The object path returned by TUS, e.g. `files/{id}`
   */
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
