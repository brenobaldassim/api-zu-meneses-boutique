import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { ClientService } from './client.service';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { UpdateClientRequestDto } from '../dtos/update-client-request.dto';
import { ClientEntity } from '../entities/client.entity';

describe('ClientService', () => {
  let service: ClientService;
  let prisma: PrismaService;

  const mockPrisma = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreateClientDto: CreateClientRequestDto = {
      name: 'Test Client',
      lastName: 'Smith',
      email: 'client@example.com',
      cpf: '123.456.789-00',
      socialMedia: 'https://example.com',
      addresses: [
        {
          street: '123 Main St',
          city: 'Testville',
          state: 'CA',
          cep: '12345-678',
          type: 'HOME',
          number: '123',
        },
        {
          street: '456 Side St',
          city: 'Testopolis',
          state: 'CA',
          cep: '12345-678',
          type: 'WORK',
          number: '123',
        },
      ],
    };

    it('should create a new client with addresses', async () => {
      const createdClient = {
        id: 'client-id',
        name: mockCreateClientDto.name,
        email: mockCreateClientDto.email,
        addresses: mockCreateClientDto.addresses,
      };

      (prisma.client.create as jest.Mock).mockResolvedValue(createdClient);

      const result = await service.create(mockCreateClientDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateClientDto,
          addresses: { create: mockCreateClientDto.addresses },
        },
        include: { addresses: true },
      });
      expect(result).toEqual(createdClient);
    });
    it('should throw HttpException if client already exists', async () => {
      const existingClient = {
        id: 'existing-client-id',
        name: mockCreateClientDto.name,
        email: mockCreateClientDto.email,
        addresses: [],
      };

      // Simulate an existing client found by email.
      (prisma.client.findUnique as jest.Mock).mockResolvedValue(existingClient);

      await expect(service.create(mockCreateClientDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.create(mockCreateClientDto)).rejects.toThrow(
        'Client already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of clients', async () => {
      const clients = [
        { id: '1', name: 'Client 1', addresses: [] },
        { id: '2', name: 'Client 2', addresses: [] },
      ];

      (prisma.client.findMany as jest.Mock).mockResolvedValue(clients);

      const result = await service.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { addresses: true },
      });
      expect(result).toEqual(clients);
    });
  });

  describe('findUniqueOrThrow', () => {
    it('should return a client by id', async () => {
      const client = { id: '1', name: 'Client 1', addresses: [] };

      (prisma.client.findUniqueOrThrow as jest.Mock).mockResolvedValue(client);

      const result = await service.findUniqueOrThrow('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
        include: { addresses: true },
      });
      expect(result).toEqual(client);
    });
  });

  describe('update', () => {
    it('should throw an error if id is not provided', async () => {
      await expect(
        service.update('', {} as UpdateClientRequestDto),
      ).rejects.toThrow(HttpException);
    });

    it('should update client successfully when addresses have an id', async () => {
      const updatedDate = new Date();
      const id = '1';
      const UpdateClientRequestDto: UpdateClientRequestDto = {
        name: 'Updated Client',
        addresses: [
          {
            id: 'a1',
            clientId: id,
            street: 'Updated Street',
            city: 'New City',
          },
        ],
      };

      (prisma.address.findMany as jest.Mock).mockResolvedValue([{ id: 'a1' }]);

      const updatedClient = {
        id,
        name: 'Updated Client',
        updatedAt: updatedDate,
        addresses: [
          {
            id: 'a1',
            clientId: id,
            street: 'Updated Street',
            city: 'New City',
          },
        ],
      };

      (prisma.client.update as jest.Mock).mockResolvedValue(updatedClient);

      const result = await service.update(id, UpdateClientRequestDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.address.findMany).toHaveBeenCalledWith({
        where: { clientId: id },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: 'Updated Client',
          updatedAt: updatedDate,
          addresses: {
            update: [
              {
                where: { id: 'a1' },
                data: {
                  id: 'a1',
                  clientId: id,
                  street: 'Updated Street',
                  city: 'New City',
                },
              },
            ],
            create: [],
          },
        },
        include: { addresses: true },
      });
      expect(result).toEqual(updatedClient);
    });

    it('should throw an error if a new address is provided without an id when old addresses exist', async () => {
      const id = '1';
      const UpdateClientRequestDto: UpdateClientRequestDto = {
        addresses: [{ street: 'New Street', clientId: id, city: 'New City' }],
      };

      // Simulate that there is at least one existing address
      (prisma.address.findMany as jest.Mock).mockResolvedValue([
        { id: 'existing-address' },
      ]);

      await expect(service.update(id, UpdateClientRequestDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should create a new address if none exist and id is not provided', async () => {
      const updatedDate = new Date();
      const id = '1';
      const UpdateClientRequestDto: UpdateClientRequestDto = {
        name: 'Client With New Address',
        addresses: [{ street: 'New Street', clientId: id, city: 'New City' }],
      };

      (prisma.address.findMany as jest.Mock).mockResolvedValue([]);

      const updatedClient = new ClientEntity({
        id,
        name: 'Client With New Address',
        updatedAt: updatedDate,
        addresses: [
          {
            street: 'New Street',
            clientId: id,
            state: 'CA',
            city: 'New City',
            id: '123',
            type: 'HOME',
            number: '123',
            cep: null,
          },
        ],
      });

      (prisma.client.update as jest.Mock).mockResolvedValue(updatedClient);

      const result = await service.update(id, UpdateClientRequestDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.address.findMany).toHaveBeenCalledWith({
        where: { clientId: id },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: 'Client With New Address',
          updatedAt: updatedDate,
          addresses: {
            update: [
              {
                where: { id: undefined },
                data: { street: 'New Street', clientId: id, city: 'New City' },
              },
            ],
            create: [{ street: 'New Street', clientId: id, city: 'New City' }],
          },
        },
        include: { addresses: true },
      });
      expect(result).toEqual(updatedClient);
    });
  });

  describe('softDelete', () => {
    it('should throw an error if id is not provided', async () => {
      await expect(service.softDelete('')).rejects.toThrow(HttpException);
    });

    it('should soft delete a client', async () => {
      const id = '1';
      const softDeletedClient = {
        id,
        deletedAt: new Date(),
        addresses: [],
      };

      (prisma.client.update as jest.Mock).mockResolvedValue(softDeletedClient);

      const result = await service.softDelete(id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { deletedAt: expect.any(Date) },
        include: { addresses: true },
      });
      expect(result).toEqual(softDeletedClient);
    });
  });
});
