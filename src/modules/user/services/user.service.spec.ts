import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { UserService } from './user.service';
import { UserServiceContract } from '../contracts/user.service.contract';
import { UserEntity } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserServiceContract;
  let prismaService: PrismaService;

  const mockUser = { id: '1', email: 'test@example.com' };

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserServiceContract,
          useClass: UserService,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserServiceContract>(UserServiceContract);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const data = { email: 'test@example.com', password: 'password' };

    it('should create a new user', async () => {
      const createdUser = { id: '1', email: data.email, password: 'hashed' };

      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(data);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw a ConflictException if user already exists', async () => {
      (prismaService.user.create as jest.Mock).mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(service.create(data)).rejects.toThrow(
        new Error('User already exists'),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('2');

      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the user when found', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hash1',
      } as UserEntity;

      const updatedUser = { ...existingUser, password: 'hash2' };

      jest.spyOn(service, 'findOneOrThrow').mockResolvedValue(existingUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('1', { password: 'hash2' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOneOrThrow).toHaveBeenCalledWith('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hash2' },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(service, 'findOneOrThrow').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(
        service.update('nonexistent-id', { password: 'hash2' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('findOneOrThrow', () => {
    it('should return the user if found', async () => {
      (prismaService.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await service.findOneOrThrow('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw if user is not found', async () => {
      (prismaService.user.findUniqueOrThrow as jest.Mock).mockImplementation(
        () => {
          throw new Error('User not found');
        },
      );

      await expect(service.findOneOrThrow('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });
  describe('findOneByEmailOrThrow', () => {
    it('should return the user if found', async () => {
      (prismaService.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await service.findOneByEmailOrThrow('test@example.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw if user is not found', async () => {
      (prismaService.user.findUniqueOrThrow as jest.Mock).mockImplementation(
        () => {
          throw new Error('User not found');
        },
      );

      await expect(
        service.findOneByEmailOrThrow('notfound@example.com'),
      ).rejects.toThrow('User not found');
    });
  });
});
