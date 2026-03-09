import { useQuery } from '@tanstack/react-query';
import { resumeService } from '../services/resume.service';
import { RESUME_QUERY_KEYS } from '../constants/resume.constants';

export function useResumes(page = 1, limit = 10) {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.paginated(page, limit),
    queryFn: () => resumeService.getPaginated(page, limit),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useResumeMatches(resumeId: string | null) {
  return useQuery({
    queryKey: RESUME_QUERY_KEYS.matches(resumeId ?? ''),
    queryFn: () => resumeService.getMatches(resumeId!),
    enabled: !!resumeId,
    staleTime: 60_000,
  });
}
