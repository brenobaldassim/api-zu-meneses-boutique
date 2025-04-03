import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserEntity } from '@modules/user/entities/user.entity';
import { AuthenticatedRequest, JwtPayload } from '@src/@types/auth';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard';
import { UserServiceContract } from '@src/modules/user/services/contracts/user-service.contract';
import { EmailServiceContract } from '@src/modules/email/services/contracts/email-service.contract';
import { AuthServiceContract } from '../services/contracts/auth-service.contract';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthServiceContract;
  let userService: UserServiceContract;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    resetPassword: jest.fn(),
    forgotPassword: jest.fn(),
  };
  const mockUserService = {
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
    findOneByEmailOrThrow: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailService = {
    sendResetPasswordEmail: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthServiceContract, useValue: mockAuthService },
        { provide: UserServiceContract, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailServiceContract, useValue: mockEmailService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthServiceContract>(AuthServiceContract);
    userService = moduleRef.get<UserServiceContract>(UserServiceContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return a user wrapped in UserEntity', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'secret',
      };

      const token = 'token';

      const userPayload = { id: 'iyhuagd181', email: 'test@example.com' };
      (authService.register as jest.Mock).mockResolvedValue({
        user: new UserEntity(userPayload),
        token,
      });
      const result = await authController.register(createUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ user: new UserEntity(userPayload), token });
    });
  });

  describe('login', () => {
    it('should return a LogInDto with token and user', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'secret',
      };
      const userPayload = { id: 'iyhuagd181', email: 'test@example.com' };
      const token = 'token';
      const userAndToken = {
        user: new UserEntity(userPayload),
        token,
      };

      (authService.login as jest.Mock).mockResolvedValue(userAndToken);
      const result = await authController.login(loginUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(userAndToken);
    });
  });

  describe('getProfile', () => {
    it('should return user profile when AuthGuard allows access', async () => {
      const userPayload: JwtPayload = {
        sub: 'iyhuagd181',
        email: 'test@example.com',
      };
      const mockRequest = {
        user: userPayload,
      } as AuthenticatedRequest;

      (userService.findOneByEmailOrThrow as jest.Mock).mockResolvedValue(
        userPayload,
      );
      const result = await authController.getProfile(mockRequest);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOneByEmailOrThrow).toHaveBeenCalledWith(
        userPayload.email,
      );
      expect(result).toEqual(new UserEntity(userPayload));
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const mockRequest = { user: null } as unknown as AuthenticatedRequest;

      await expect(authController.getProfile(mockRequest)).rejects.toThrow();
    });
  });

  describe('forgot-password', () => {
    it('should call authService.forgotPassword and return EmailSentDto', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await authController.forgotPassword(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toEqual({
        message: 'Email sent with sucess',
        to: 'test@example.com',
      });
    });
  });
  describe('reset-password', () => {
    it('should call authService.resetPassword and return UserEntity', async () => {
      const dto: ResetPasswordDto = {
        token: 'valid-token',
        new_password: 'newpassword123',
      };

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
      };

      mockAuthService.resetPassword.mockResolvedValue(updatedUser);

      const result = await authController.resetPassword(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'valid-token',
        'newpassword123',
      );
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject({
        id: '1',
        email: 'test@example.com',
      });
    });
  });
});
