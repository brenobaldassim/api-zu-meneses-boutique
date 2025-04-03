import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientServiceContract } from '../services/contracts/client-service.contract';
import { ClientEntity } from '../entities/client.entity';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { UpdateClientRequestDto } from '../dtos/update-client-request.dto';
import { HttpException } from '@nestjs/common';
import { AuthGuard } from '@src/modules/auth/guards/auth.guard';

describe('ClientController', () => {
  let controller: ClientController;
  let clientService: ClientServiceContract;

  const mockClientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientServiceContract,
          useValue: mockClientService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ClientController>(ClientController);
    clientService = module.get<ClientServiceContract>(ClientServiceContract);
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

    it('should create and return a new client', async () => {
      const clientData = {
        ...mockCreateClientDto,
        id: '1',
        addresses: [
          { id: 'a1', clientId: '1', ...mockCreateClientDto.addresses[0] },
          { id: 'a2', clientId: '1', ...mockCreateClientDto.addresses[1] },
        ],
      };

      (clientService.create as jest.Mock).mockResolvedValue(clientData);

      const result = await controller.create(mockCreateClientDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientService.create).toHaveBeenCalledWith(mockCreateClientDto);
      expect(result).toEqual(new ClientEntity(clientData));
    });

    it('should throw an error if the service throws an error', async () => {
      (clientService.create as jest.Mock).mockRejectedValue(
        new HttpException('Client already exists', 400),
      );

      await expect(controller.create(mockCreateClientDto)).rejects.toThrow(
        'Client already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of clients', async () => {
      const clientsData = [
        {
          id: '1',
          name: 'Client 1',
          email: 'client1@example.com',
          addresses: [],
        },
        {
          id: '2',
          name: 'Client 2',
          email: 'client2@example.com',
          addresses: [],
        },
      ];
      (clientService.findAll as jest.Mock).mockResolvedValue(clientsData);

      const result = await controller.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientService.findAll).toHaveBeenCalled();
      expect(result).toEqual(
        clientsData.map((client) => new ClientEntity(client)),
      );
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const clientData = {
        id: '1',
        name: 'Client 1',
        email: 'client1@example.com',
        addresses: [],
      };
      (clientService.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        clientData,
      );

      const result = await controller.findOne('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientService.findUniqueOrThrow).toHaveBeenCalledWith('1');
      expect(result).toEqual(new ClientEntity(clientData));
    });
  });

  describe('update', () => {
    it('should update and return the updated client', async () => {
      const UpdateClientRequestDto: UpdateClientRequestDto = {
        name: 'Updated Client',
        addresses: [
          {
            id: 'addr1',
            street: 'Updated Street',
          },
        ],
      };

      const updatedData: ClientEntity = {
        id: '1',
        name: 'Updated Client',
        lastName: 'Smith',
        cpf: '123.456.789-00',
        email: 'client@example.com',
        socialMedia: 'https://example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        addresses: [
          {
            id: 'addr1',
            clientId: '1',
            street: 'Updated Street',
            city: 'New City',
            state: 'CA',
            cep: '12345-678',
            type: 'HOME',
            number: '123',
          },
        ],
      };

      (clientService.update as jest.Mock).mockResolvedValue(
        new ClientEntity(updatedData),
      );

      const result = await controller.update('1', UpdateClientRequestDto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientService.update).toHaveBeenCalledWith(
        '1',
        UpdateClientRequestDto,
      );
      expect(result).toEqual(new ClientEntity(updatedData));
    });
  });

  describe('remove', () => {
    it('should soft delete and return the deleted client', async () => {
      const clientData = {
        id: '1',
        name: 'Client 1',
        email: 'client1@example.com',
        addresses: [],
      };
      (clientService.softDelete as jest.Mock).mockResolvedValue(clientData);

      const result = await controller.remove('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientService.softDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(new ClientEntity(clientData));
    });
  });
});
