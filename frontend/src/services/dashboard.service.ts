import api from './api';

export const getDashboardSummary = async (params?: { from?: string; to?: string }) => {
  const { data } = await api.get('/dashboard/summary', { params });
  return data;
};