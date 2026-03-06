import axios from 'axios';
import { AUTH_COPY } from '../constants/auth.constants';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.length > 0) {
      return serverMessage;
    }
  }
  return AUTH_COPY.ERRORS.GENERIC;
}
