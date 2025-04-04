import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { CreateProductRequestDto } from '../dtos/create-product-request.dto';
import { UpdateProductRequestDto } from '../dtos/update-product-request.dto';
import { ProductEntity } from '../entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto: CreateProductRequestDto = {
        name: 'Test Product',
        price: 100,
        quantity: 10,
      };

      const createdProduct: ProductEntity = {
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(createdProduct);

      const result = await service.create(createDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.product.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          price: 50,
          quantity: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Product 2',
          price: 150,
          quantity: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(products);

      const result = await service.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product: ProductEntity = {
        id: '1',
        name: 'Product 1',
        price: 50,
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        product,
      );

      const result = await service.findOne('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.product.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto: UpdateProductRequestDto = {
        name: 'Updated Product',
        price: 200,
        quantity: 20,
      };

      const updatedProduct: ProductEntity = {
        id: '1',
        name: 'Updated Product',
        price: 200,
        quantity: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw an error if update fails', async () => {
      const updateDto: UpdateProductRequestDto = {
        name: 'Updated Product',
        price: 200,
        quantity: 20,
      };

      // Simulate failure by returning null
      (prisma.product.update as jest.Mock).mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.update('1', updateDto)).rejects.toThrow(
        'Error updating product',
      );
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const removedProduct: ProductEntity = {
        id: '1',
        name: 'Product 1',
        price: 50,
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.delete as jest.Mock).mockResolvedValue(removedProduct);

      const result = await service.remove('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(removedProduct);
    });

    it('should throw an error if removal fails', async () => {
      // Simulate failure by returning null
      (prisma.product.delete as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.remove('1')).rejects.toThrow(
        'Error removing product',
      );
    });
  });
});
