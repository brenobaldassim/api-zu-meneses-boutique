import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    create: jest.fn(),
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
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret',
      } as CreateUserDto;
      const userPayload = { id: '1', username: 'testuser' };
      (authService.create as jest.Mock).mockResolvedValue(userPayload);
      const result = await authController.create(createUserDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(new UserEntity(userPayload));
    });
  });
});
