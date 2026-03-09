import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse, PaginatedResumesResponse } from '../types/response.types';
import type { MatchResultDTO, PaginatedResult, ResumeDTO } from '../types/resume.types';

export const resumeService = {
  register: async (minioPath: string): Promise<ResumeDTO> => {
    const response = await api.post<ApiResponse<ResumeDTO>>(API_ENDPOINTS.RESUMES.BASE, {
      minioPath,
    });
    return response.data.data;
  },

  getPaginated: async (page = 1, limit = 10): Promise<PaginatedResult<ResumeDTO>> => {
    const response = await api.get<PaginatedResumesResponse>(API_ENDPOINTS.RESUMES.BASE, {
      params: { page, limit },
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<ResumeDTO> => {
    const response = await api.get<ApiResponse<ResumeDTO>>(`${API_ENDPOINTS.RESUMES.BASE}/${id}`);
    return response.data.data;
  },

  getMatches: async (id: string): Promise<MatchResultDTO[]> => {
    const response = await api.get<ApiResponse<MatchResultDTO[]>>(
      `${API_ENDPOINTS.RESUMES.BASE}/${id}/matches`,
    );
    return response.data.data;
  },
};
