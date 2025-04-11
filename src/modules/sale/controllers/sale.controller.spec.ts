import { Test, TestingModule } from '@nestjs/testing';
import { SaleController } from './sale.controller';
import { SaleServiceContract } from '../services/contract/sale-service.contract';
import { CreateSaleRequestDto } from '../dtos/create-sale-request.dto';
import { UpdateSaleRequestDto } from '../dtos/update-sale-request.dto';

describe('SaleController', () => {
  let controller: SaleController;

  const mockSaleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleController],
      providers: [
        {
          provide: SaleServiceContract,
          useValue: mockSaleService,
        },
      ],
    }).compile();

    controller = module.get<SaleController>(SaleController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sale', async () => {
      const createDto: CreateSaleRequestDto = {
        clientId: '1',
        products: [
          { productId: '1', quantity: 2 },
          { productId: '2', quantity: 1 },
        ],
        saleDate: new Date(),
      };

      const expectedResult = {
        id: '1',
        ...createDto,
        totalAmountCents: 4000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSaleService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(mockSaleService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of sales', async () => {
      const expectedResult = [
        {
          id: '1',
          clientId: '1',
          products: [{ productId: '1', quantity: 2 }],
          totalAmountCents: 2000,
          saleDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSaleService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockSaleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single sale', async () => {
      const expectedResult = {
        id: '1',
        clientId: '1',
        products: [{ productId: '1', quantity: 2 }],
        totalAmountCents: 2000,
        saleDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSaleService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(mockSaleService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a sale', async () => {
      const updateDto: UpdateSaleRequestDto = {
        clientId: '1',
        products: [{ productId: '1', quantity: 3 }],
        saleDate: new Date(),
      };

      const expectedResult = {
        id: '1',
        ...updateDto,
        totalAmountCents: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSaleService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(mockSaleService.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a sale', async () => {
      const expectedResult = {
        id: '1',
        clientId: '1',
        products: [{ productId: '1', quantity: 2 }],
        totalAmountCents: 2000,
        saleDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSaleService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(mockSaleService.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });
});
