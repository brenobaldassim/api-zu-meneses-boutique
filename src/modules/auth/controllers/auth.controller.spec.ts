import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    create: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
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
});
