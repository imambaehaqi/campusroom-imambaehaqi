import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, hydrated: false });
  });

  it('should have null user and token initially', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should set auth data and persist to localStorage', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@campusroom.test', role: 'ADMIN' as const };
    useAuthStore.getState().setAuth(mockUser, 'fake-token');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('fake-token');
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('should clear auth data on logout', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@campusroom.test', role: 'ADMIN' as const };
    useAuthStore.getState().setAuth(mockUser, 'fake-token');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should hydrate state from localStorage', () => {
    const mockUser = { id: 2, name: 'Dosen A', email: 'dosen@campusroom.test', role: 'DOSEN' as const };
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.token).toBe('stored-token');
    expect(state.user).toEqual(mockUser);
    expect(state.hydrated).toBe(true);
  });
});