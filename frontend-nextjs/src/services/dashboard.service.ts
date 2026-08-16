import api from './api';
import type { DashboardSummary } from '../types';

export const getDashboardSummary = async (params?: { from?: string; to?: string }) => {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary', { params });
  return data;
};