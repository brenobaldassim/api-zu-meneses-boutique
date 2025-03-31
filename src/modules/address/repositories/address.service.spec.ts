import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { AddressService } from './address.service';
import { AddressServiceContract } from '../contracts/address-service.contract';
import { AddressEntity } from '../entities/address.entity';
import { CreateAddressDto } from '../dtos/create-address.dto';
import { UpdateAddressDto } from '../dtos/update-address.dto';

describe('AddressService', () => {
  let service: AddressServiceContract;
  let prismaService: PrismaService;

  const mockAddress: AddressEntity = {
    id: '1',
    clientId: 'client-1',
    street: 'Street 1',
    city: 'City 1',
    state: 'State 1',
    cep: '12345-678',
    number: '123',
    type: 'HOME',
  };

  const prismaServiceMock = {
    address: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AddressServiceContract,
          useClass: AddressService,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<AddressServiceContract>(AddressServiceContract);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new address', async () => {
      const createDto: CreateAddressDto = {
        clientId: 'client-12412',
        street: 'Street 141',
        city: 'City 12412',
        state: 'State 12341',
        cep: '12345-678',
        number: '123',
        type: 'HOME',
      };

      const createdAddress: AddressEntity = { id: '1', ...createDto };
      (prismaService.address.create as jest.Mock).mockResolvedValue(
        createdAddress,
      );

      const result = await service.create(createDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.address.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(createdAddress);
    });
  });

  describe('findByClientId', () => {
    it('should return an address when found', async () => {
      (prismaService.address.findFirst as jest.Mock).mockResolvedValue(
        mockAddress,
      );

      const result = await service.findByClientId('client-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.address.findFirst).toHaveBeenCalledWith({
        where: { clientId: 'client-1' },
      });
      expect(result).toEqual(mockAddress);
    });

    it('should return null if address is not found', async () => {
      (prismaService.address.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findByClientId('non-existent-client');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the address when found', async () => {
      const updateDto: UpdateAddressDto = {
        clientId: 'client-1',
        street: 'Updated Street',
      };

      const updatedAddress: AddressEntity = {
        ...mockAddress,
        clientId: 'client-1',
        street: 'Updated Street',
      };

      (prismaService.address.update as jest.Mock).mockResolvedValue(
        updatedAddress,
      );

      const result = await service.update('1', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.address.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedAddress);
    });

    it('should throw an error if address does not exist', async () => {
      const updateDto: UpdateAddressDto = {
        // update properties
      };

      (prismaService.address.update as jest.Mock).mockRejectedValue(
        new Error('Address not found'),
      );

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow('Address not found');
    });
  });
});
