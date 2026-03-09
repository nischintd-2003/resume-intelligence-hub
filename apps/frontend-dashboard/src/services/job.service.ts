import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse } from '../types/response.types';
import type { JobDTO, CreateJobFormValues, ToggleJobInput } from '../types/job.types';

export const jobService = {
  getAll: async (): Promise<JobDTO[]> => {
    const response = await api.get<ApiResponse<JobDTO[]>>(API_ENDPOINTS.JOBS.BASE);
    return response.data.data;
  },

  create: async (input: CreateJobFormValues): Promise<JobDTO> => {
    const response = await api.post<ApiResponse<JobDTO>>(API_ENDPOINTS.JOBS.BASE, input);
    return response.data.data;
  },

  toggle: async ({ id, isActive }: ToggleJobInput): Promise<JobDTO> => {
    const response = await api.patch<ApiResponse<JobDTO>>(`${API_ENDPOINTS.JOBS.BASE}/${id}`, {
      isActive,
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.JOBS.BASE}/${id}`);
  },
};
