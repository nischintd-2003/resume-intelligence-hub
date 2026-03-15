import { AUTH_STORAGE_KEYS } from '../constants/auth.constants';

export function isTokenExpired(): boolean {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
