import api from './api';
import type { Peminjaman, StatusPengajuan } from '../types';

export const getLoans = async (params?: { status?: StatusPengajuan; search?: string }) => {
  const { data } = await api.get<Peminjaman[]>('/loans', { params });
  return data;
};

export const createLoan = async (payload: {
  ruangId: number;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}) => {
  const { data } = await api.post<Peminjaman>('/loans', payload);
  return data;
};

export const updateLoanStatus = async (id: number, status: StatusPengajuan, catatanAdmin?: string) => {
  const { data } = await api.patch<Peminjaman>(`/loans/${id}/status`, { status, catatanAdmin });
  return data;
};

export const cancelLoan = async (id: number) => {
  await api.patch(`/loans/${id}/cancel`);
};