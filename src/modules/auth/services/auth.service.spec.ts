import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@modules/prisma/services/prisma.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from '../dtos/LogInDto';
import { UserEntity } from '@src/modules/user/entities/user.entity';
import { AuthUserDto } from '../dtos/AuthUserDto';

jest.mock('@modules/prisma/services/prisma.service');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
  };

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user if user does not exist', async () => {
      const password = 'password';
      const inputData: AuthUserDto = {
        email: 'test@example.com',
        password: password,
      };
      const hashedPassword = 'hashed-password';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);

      const createdUser = {
        id: 'yuagyudagyu111',
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
        id: 'yuagyudagyu111',
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

      (prismaService.user.create as jest.Mock).mockResolvedValue(null);

      await expect(service.create(inputData)).rejects.toThrow(HttpException);
      await expect(service.create(inputData)).rejects.toThrow(
        'User not created',
      );
    });
  });
  describe('login', () => {
    const inputEmail = 'test@example.com';
    const inputPassword = 'password';
    const fakeUser = {
      id: 'uaghd871781',
      email: inputEmail,
      password: 'hashed-password',
    };
    const longInInfo: AuthUserDto = {
      email: inputEmail,
      password: inputPassword,
    };

    it('should return a LogInDto with token and user if credentials are correct', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const result: LogInDto = await service.login(longInInfo);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: inputEmail },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        fakeUser.password,
        inputPassword,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: fakeUser.id,
        email: fakeUser.email,
      });
      expect(result).toEqual({
        user: new UserEntity(fakeUser),
        token: 'token',
      });
    });

    it('should throw HttpException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(longInInfo)).rejects.toThrow(HttpException);
      await expect(service.login(longInInfo)).rejects.toThrow(
        'Incorrect email/password combination.',
      );
    });

    it('should throw HttpException if password is invalid', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.login(longInInfo)).rejects.toThrow(HttpException);
      await expect(service.login(longInInfo)).rejects.toThrow(
        'Incorrect email/password combination.',
      );
    });
  });
});
