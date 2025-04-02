import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInUserResponseDto } from '../dtos/login-user-response.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { RegisterUserRequestDto } from '../dtos/register-user-request.dto';
import { AuthServiceContract } from './contracts/auth-service.contract';
import { EmailServiceContract } from '@src/modules/email/services/contracts/email-service.contract';
import { UserServiceContract } from '@src/modules/user/services/contracts/user-service.contract';
import { LoginUserRequestDto } from '../dtos/login-user-request.dto';

jest.mock('@modules/prisma/services/prisma.service');

describe('AuthService', () => {
  let service: AuthServiceContract;
  let jwtService: JwtService;
  let userService: UserServiceContract;
  let emailService: EmailServiceContract;

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
    verifyAsync: jest.fn(),
  };

  const mockEmailService = {
    sendResetPasswordEmail: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneByEmail: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthServiceContract, useClass: AuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailServiceContract, useValue: mockEmailService },
        { provide: UserServiceContract, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthServiceContract>(AuthServiceContract);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserServiceContract>(UserServiceContract);
    emailService = module.get<EmailServiceContract>(EmailServiceContract);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user if user does not exist', async () => {
      const password = 'password';
      const inputData: RegisterUserRequestDto = {
        email: 'test@example.com',
        password: password,
      };
      const hashedPassword = 'hashed-password';

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);

      const createdUser = new UserEntity({
        id: 'yuagyudagyu111',
        email: inputData.email,
        password: hashedPassword,
      });

      const token = 'token';
      (userService.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.register(inputData);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOneByEmail).toHaveBeenCalledWith(inputData.email);
      expect(argon2.hash).toHaveBeenCalledWith(password);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.create).toHaveBeenCalledWith({
        ...inputData,
        password: hashedPassword,
      });
      expect(result).toEqual({
        user: createdUser,
        token,
      });
    });

    it('should throw HttpException if user already exists', async () => {
      const inputData = { email: 'test@example.com', password: 'password' };
      const existingUser = {
        id: 'yuagyudagyu111',
        email: inputData.email,
        password: 'some-hash',
      };
      (userService.findOneByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(service.register(inputData)).rejects.toThrow(HttpException);
      await expect(service.register(inputData)).rejects.toThrow(
        'User with this email already exist',
      );
    });

    it('should throw HttpException if user is not created', async () => {
      const inputData = { email: 'test@example.com', password: 'password' };
      const hashedPassword = 'hashed-password';

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);

      (userService.create as jest.Mock).mockResolvedValue(null);

      await expect(service.register(inputData)).rejects.toThrow(HttpException);
      await expect(service.register(inputData)).rejects.toThrow(
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
    const longInInfo: LoginUserRequestDto = {
      email: inputEmail,
      password: inputPassword,
    };

    it('should return a LogInDto with token and user if credentials are correct', async () => {
      (userService.findOneByEmail as jest.Mock).mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const result: LogInUserResponseDto = await service.login(longInInfo);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOneByEmail).toHaveBeenCalledWith(inputEmail);
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
      (userService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(longInInfo)).rejects.toThrow(HttpException);
      await expect(service.login(longInInfo)).rejects.toThrow(
        'Incorrect email/password combination.',
      );
    });

    it('should throw HttpException if password is invalid', async () => {
      (userService.findOneByEmail as jest.Mock).mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.login(longInInfo)).rejects.toThrow(HttpException);
      await expect(service.login(longInInfo)).rejects.toThrow(
        'Incorrect email/password combination.',
      );
    });
  });

  describe('forgot-password', () => {
    it('should send a reset password email when user exists', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      jest
        .spyOn(userService, 'findOneByEmail')
        .mockResolvedValue(mockUser as UserEntity);

      const sendEmailMock = jest
        .spyOn(emailService, 'sendResetPasswordEmail')
        .mockResolvedValue();

      await service.forgotPassword('test@example.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { email: mockUser.email },
        { expiresIn: '15m' },
      );
      expect(sendEmailMock).toHaveBeenCalledWith(mockUser.email, 'token');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      await expect(
        service.forgotPassword('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('reset-password', () => {
    it('should update user password and return updated user', async () => {
      const token = 'valid-token';
      const payload = { email: 'test@example.com' };
      const user = { id: '1', email: payload.email } as UserEntity;
      const hashedPassword = 'hashed-password';
      const updatedUser = { ...user, password: hashedPassword };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(argon2, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

      const result = await service.resetPassword(token, 'newPassword');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(argon2.hash).toHaveBeenCalledWith('newPassword');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.update).toHaveBeenCalledWith(user.id, {
        password: hashedPassword,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user from token payload does not exist', async () => {
      const token = 'token';
      const payload = { email: 'test@example.com' };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.resetPassword(token, 'newPassword')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
