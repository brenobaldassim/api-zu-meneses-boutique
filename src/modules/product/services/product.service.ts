import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductRequestDto } from '../dtos/create-product-request.dto';
import { UpdateProductRequestDto } from '../dtos/update-product-request.dto';
import { ProductServiceContract } from './contracts/product-service.contract';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductService implements ProductServiceContract {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async create(body: CreateProductRequestDto): Promise<ProductEntity> {
    return await this.prisma.product.create({ data: body });
  }

  async findAll(): Promise<ProductEntity[]> {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string): Promise<ProductEntity> {
    return await this.prisma.product.findUniqueOrThrow({ where: { id } });
  }

  async update(
    id: string,
    body: UpdateProductRequestDto,
  ): Promise<ProductEntity> {
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: body,
    });

    if (!updatedProduct) {
      throw new InternalServerErrorException('Error updating product');
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<ProductEntity> {
    const removedProduct = await this.prisma.product.delete({ where: { id } });

    if (!removedProduct) {
      throw new InternalServerErrorException('Error removing product');
    }

    return removedProduct;
  }
}
