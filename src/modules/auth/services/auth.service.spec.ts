import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import * as argon2 from 'argon2';

jest.mock('@modules/prisma/services/prisma.service');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user if user does not exist', async () => {
      const password = 'password';
      const inputData = { email: 'test@example.com', password: password };
      const hashedPassword = 'hashed-password';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);

      const createdUser = {
        id: 1,
        email: inputData.email,
        password: hashedPassword,
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(inputData);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: inputData.email },
      });
      expect(argon2.hash).toHaveBeenCalledWith(password);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...inputData, password: hashedPassword },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw HttpException if user already exists', async () => {
      const inputData = { email: 'test@example.com', password: 'password' };
      const existingUser = {
        id: 1,
        email: inputData.email,
        password: 'some-hash',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        existingUser,
      );

      await expect(service.create(inputData)).rejects.toThrow(HttpException);
      await expect(service.create(inputData)).rejects.toThrow(
        'User with this email already exist',
      );
    });

    it('should throw HttpException if user is not created', async () => {
      const inputData = { email: 'test@example.com', password: 'password' };
      const hashedPassword = 'hashed-password';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);
      // Simulate failure in user creation.
      (prismaService.user.create as jest.Mock).mockResolvedValue(null);

      await expect(service.create(inputData)).rejects.toThrow(HttpException);
      await expect(service.create(inputData)).rejects.toThrow(
        'User not created',
      );
    });
  });
});
