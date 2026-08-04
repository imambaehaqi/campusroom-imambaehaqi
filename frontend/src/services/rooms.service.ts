import api from './api';
import { Ruang } from '../types';

export const getRooms = async (params?: { search?: string; jenisRuang?: string; namaGedung?: string }) => {
  const { data } = await api.get<Ruang[]>('/rooms', { params });
  return data;
};

export const createRoom = async (payload: Partial<Ruang>) => {
  const { data } = await api.post<Ruang>('/rooms', payload);
  return data;
};

export const updateRoom = async (id: number, payload: Partial<Ruang>) => {
  const { data } = await api.put<Ruang>(`/rooms/${id}`, payload);
  return data;
};

export const deleteRoom = async (id: number) => {
  await api.delete(`/rooms/${id}`);
};

export const syncRooms = async () => {
  const { data } = await api.post('/rooms/sync/webservice');
  return data;
};