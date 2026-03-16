import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../types/auth.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/errors';

export function useLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: (data) => {
      login(data);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useRegister() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (userData: RegisterInput) => authService.register(userData),
    onSuccess: (data) => {
      login(data);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
