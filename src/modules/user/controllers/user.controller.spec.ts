import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserEntity } from '../entities/user.entity';
import { UserServiceContract } from '../services/contracts/user-service.contract';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserServiceContract;

  const mockUserService = {
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserServiceContract,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserServiceContract>(UserServiceContract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user wrapped in UserEntity', async () => {
      const userPayload = { id: '1', name: 'John Doe' };

      (userService.findOneOrThrow as jest.Mock).mockResolvedValue(userPayload);

      const result = await userController.findOne('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOneOrThrow).toHaveBeenCalledWith('1');

      expect(result).toEqual(new UserEntity(userPayload));
    });

    it('should propagate NotFoundException when userService.findOne throws', async () => {
      (userService.findOneOrThrow as jest.Mock).mockImplementation(() => {
        throw new Error('User not found');
      });

      await expect(userController.findOne('2')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
