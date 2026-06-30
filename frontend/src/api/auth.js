import { api } from './client';

export const registerUser = (name, email, password) =>
  api('/auth/register', { method: 'POST', body: { name, email, password }, auth: false });

export const loginUser = (email, password) =>
  api('/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const fetchMe = () => api('/auth/me');
