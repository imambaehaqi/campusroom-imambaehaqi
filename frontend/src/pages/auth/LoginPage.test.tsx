import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authService from '../../services/auth.service';

vi.mock('../../services/auth.service');

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email and password fields', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    expect(screen.getByPlaceholderText(/admin@campusroom.test/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('should call login service when form is submitted', async () => {
    const mockLogin = vi.mocked(authService.login).mockResolvedValue({
      access_token: 'fake-token',
      user: { id: 1, name: 'Admin', email: 'admin@campusroom.test', role: 'ADMIN' },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/admin@campusroom.test/i), {
      target: { value: 'admin@campusroom.test' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@campusroom.test', 'password123');
    });
  });
});