import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { CreateProductRequestDto } from '../dtos/create-product-request.dto';
import { UpdateProductRequestDto } from '../dtos/update-product-request.dto';
import { ProductServiceContract } from '../services/contracts/product-service.contract';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductServiceContract;

  const mockProductService: Partial<ProductServiceContract> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductServiceContract,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductServiceContract>(ProductServiceContract);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call productService.create with the provided DTO and return the created product', async () => {
      const createDto: CreateProductRequestDto = {
        name: 'Test Product',
        price: 100,
        quantity: 10,
      };

      const createdProduct = { id: '1', ...createDto };
      (productService.create as jest.Mock).mockResolvedValue(createdProduct);

      const result = await controller.create(createDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [
        { id: '1', name: 'Product 1', price: 50, quantity: 5 },
        { id: '2', name: 'Product 2', price: 150, quantity: 15 },
      ];
      (productService.findAll as jest.Mock).mockResolvedValue(products);

      const result = await controller.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.findAll).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Product 1', price: 50, quantity: 5 };
      (productService.findOne as jest.Mock).mockResolvedValue(product);

      const result = await controller.findOne('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product and return the updated product', async () => {
      const updateDto: UpdateProductRequestDto = {
        name: 'Updated Product',
        price: 200,
        quantity: 20,
      };

      const updatedProduct = { id: '1', ...updateDto };
      (productService.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await controller.update('1', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product and return the removed product', async () => {
      const removedProduct = {
        id: '1',
        name: 'Product 1',
        price: 50,
        quantity: 5,
      };
      (productService.remove as jest.Mock).mockResolvedValue(removedProduct);

      const result = await controller.remove('1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(removedProduct);
    });
  });
});
