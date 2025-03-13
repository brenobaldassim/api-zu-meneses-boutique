import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { UserEntity } from '../entities/user.entity';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user wrapped in UserEntity', async () => {
      const userPayload = { id: '1', name: 'John Doe' };

      (userService.findOne as jest.Mock).mockResolvedValue(userPayload);

      const result = await userController.findOne('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.findOne).toHaveBeenCalledWith('1');

      expect(result).toEqual(new UserEntity(userPayload));
    });

    it('should propagate NotFoundException when userService.findOne throws', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(userController.findOne('2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
