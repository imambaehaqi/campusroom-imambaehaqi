import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  const mockUser = {
    id: 1,
    name: 'Admin Utama',
    email: 'admin@campusroom.test',
    password: '',
    role: 'ADMIN' as const,
  };

  beforeAll(async () => {
    mockUser.password = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('fake.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.validateUser(
      'admin@campusroom.test',
      'password123',
    );

    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('admin@campusroom.test');
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      service.validateUser('admin@campusroom.test', 'passwordsalah'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-existent email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.validateUser('tidakada@campusroom.test', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return access_token and user data on successful login', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'admin@campusroom.test',
      password: 'password123',
    });

    expect(result).toHaveProperty('access_token', 'fake.jwt.token');
    expect(result.user.role).toBe('ADMIN');
  });
});
