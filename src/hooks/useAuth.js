// src/hooks/useAuth.js (example)
import api from '../lib/apiClient';

export async function login(email, password) {
  const res = await api.post('/api/auth/login', { email, password }, { skipAuth: true });
  // res: { accessToken, refreshToken, user }
  localStorage.setItem('accessToken', res.accessToken);
  // optional: localStorage.setItem('refreshToken', res.refreshToken);
  return res.user;
}

export function logout() {
  localStorage.removeItem('accessToken');
  // localStorage.removeItem('refreshToken');
}
