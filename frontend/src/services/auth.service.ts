import api from './api';
import { User } from '../types';

export const login = async (email: string, password: string) => {
  const { data } = await api.post<{ access_token: string; user: User }>(
    '/auth/login',
    { email, password },
  );
  return data;
};