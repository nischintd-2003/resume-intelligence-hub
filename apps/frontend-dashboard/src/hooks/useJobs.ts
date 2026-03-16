import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type { JobDTO, CreateJobFormValues, ToggleJobInput } from '../types/job.types';
import { JOB_QUERY_KEYS } from '../constants/job.constants';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/errors';

// useJobs

export function useJobs() {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.list(),
    queryFn: ({ signal }) => jobService.getAll({ signal }),
    staleTime: 30_000,
  });
}

// useCreateJob

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobFormValues) => jobService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.list() });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

// useToggleJob

export function useToggleJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToggleJobInput) => jobService.toggle(input),

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: JOB_QUERY_KEYS.list() });

      const previous = queryClient.getQueryData<JobDTO[]>(JOB_QUERY_KEYS.list());

      queryClient.setQueryData<JobDTO[]>(JOB_QUERY_KEYS.list(), (old = []) =>
        old.map((job) => (job.id === id ? { ...job, isActive } : job)),
      );

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(JOB_QUERY_KEYS.list(), context.previous);
      }
      toast.error('Failed to update job status');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.list() });
    },
  });
}

// useDeleteJob

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.list() });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
