import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserService } from '@src/modules/user/services/user.service';
import { AuthenticatedRequest, JwtPayload } from '@src/@types/auth';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockAuthService = {
    create: jest.fn(),
    login: jest.fn(),
  };
  const mockUserService = {
    findOneByEmail: jest.fn(),
  };
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return a user wrapped in UserEntity', async () => {
      const createUserDto: AuthUserDto = {
        email: 'test@example.com',
        password: 'secret',
      } as AuthUserDto;

      const userPayload = { id: 'iyhuagd181', email: 'test@example.com' };
      (authService.create as jest.Mock).mockResolvedValue(userPayload);
      const result = await authController.create(createUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(new UserEntity(userPayload));
    });
  });

  describe('login', () => {
    it('should return a LogInDto with token and user', async () => {
      const loginUserDto: AuthUserDto = {
        email: 'test@example.com',
        password: 'secret',
      } as AuthUserDto;
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

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(userPayload);
      const result = await authController.getProfile(mockRequest);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        userPayload.email,
      );
      expect(result).toEqual(new UserEntity(userPayload));
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const mockRequest = { user: null } as unknown as AuthenticatedRequest;

      await expect(authController.getProfile(mockRequest)).rejects.toThrow();
    });
  });
});
