import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SaleService } from './sale.service';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { CreateSaleRequestDto } from '../dtos/create-sale-request.dto';
import { UpdateSaleRequestDto } from '../dtos/update-sale-request.dto';

describe('SaleService', () => {
  let service: SaleService;

  const mockPrisma = {
    sale: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SaleService>(SaleService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sale successfully', async () => {
      const createDto: CreateSaleRequestDto = {
        clientId: '1',
        products: [
          { productId: '1', quantity: 2 },
          { productId: '2', quantity: 1 },
        ],
        saleDate: new Date(),
      };

      const mockClient = {
        id: '1',
        name: 'Test Client',
      };

      const mockProducts = [
        { id: '1', priceCents: 1000, name: 'Product 1' },
        { id: '2', priceCents: 2000, name: 'Product 2' },
      ];

      const mockCreatedSale = {
        id: '1',
        clientId: '1',
        totalAmountCents: 4000, // (1000 * 2) + (2000 * 1)
        saleDate: createDto.saleDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.client.findUnique.mockResolvedValue(mockClient);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.sale.create.mockResolvedValue(mockCreatedSale);

      const result = await service.create(createDto);

      expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.clientId },
      });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2'] } },
      });
      expect(mockPrisma.sale.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedSale);
    });

    it('should throw NotFoundException when client is not found', async () => {
      const createDto: CreateSaleRequestDto = {
        clientId: '1',
        products: [{ productId: '1', quantity: 1 }],
        saleDate: new Date(),
      };

      mockPrisma.client.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Client not found',
      );
    });

    it('should throw NotFoundException when products are not found', async () => {
      const createDto: CreateSaleRequestDto = {
        clientId: '1',
        products: [
          { productId: '1', quantity: 1 },
          { productId: '2', quantity: 1 },
        ],
        saleDate: new Date(),
      };

      mockPrisma.client.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.product.findMany.mockResolvedValue([{ id: '1' }]); // Only one product found

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of sales', async () => {
      const mockSales = [
        {
          id: '1',
          clientId: '1',
          totalAmountCents: 1000,
          saleDate: new Date(),
          client: { id: '1', name: 'Client 1' },
          saleProducts: [],
        },
      ];

      mockPrisma.sale.findMany.mockResolvedValue(mockSales);

      const result = await service.findAll();

      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith({
        include: {
          client: true,
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          saleDate: 'desc',
        },
      });
      expect(result).toEqual(mockSales);
    });
  });

  describe('findOne', () => {
    it('should return a sale by id', async () => {
      const mockSale = {
        id: '1',
        clientId: '1',
        totalAmountCents: 1000,
        saleDate: new Date(),
        client: { id: '1', name: 'Client 1' },
        saleProducts: [],
      };

      mockPrisma.sale.findUnique.mockResolvedValue(mockSale);

      const result = await service.findOne('1');

      expect(mockPrisma.sale.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          client: true,
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(mockSale);
    });

    it('should throw NotFoundException when sale is not found', async () => {
      mockPrisma.sale.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('1')).rejects.toThrow('Sale not found');
    });
  });

  describe('update', () => {
    it('should update a sale successfully', async () => {
      const updateDto: UpdateSaleRequestDto = {
        clientId: '1',
        products: [{ productId: '1', quantity: 2 }],
        saleDate: new Date(),
      };

      const mockProducts = [{ id: '1', priceCents: 1000 }];
      const mockUpdatedSale = {
        id: '1',
        clientId: '1',
        totalAmountCents: 2000,
        saleDate: updateDto.saleDate,
      };

      mockPrisma.sale.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.sale.update.mockResolvedValue(mockUpdatedSale);

      const result = await service.update('1', updateDto);

      expect(mockPrisma.sale.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedSale);
    });
  });

  describe('remove', () => {
    it('should remove a sale successfully', async () => {
      const mockSale = {
        id: '1',
        clientId: '1',
        totalAmountCents: 1000,
        saleDate: new Date(),
      };

      mockPrisma.sale.findUnique.mockResolvedValue(mockSale);
      mockPrisma.sale.delete.mockResolvedValue(mockSale);

      const result = await service.remove('1');

      expect(mockPrisma.sale.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          client: true,
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(mockSale);
    });

    it('should throw NotFoundException when trying to remove non-existent sale', async () => {
      mockPrisma.sale.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      await expect(service.remove('1')).rejects.toThrow('Sale not found');
    });
  });
});
