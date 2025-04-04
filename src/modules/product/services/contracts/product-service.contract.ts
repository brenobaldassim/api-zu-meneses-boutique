import { CreateProductRequestDto } from '../../dtos/create-product-request.dto';
import { UpdateProductRequestDto } from '../../dtos/update-product-request.dto';
import { ProductEntity } from '../../entities/product.entity';

export abstract class ProductServiceContract {
  abstract create(body: CreateProductRequestDto): Promise<ProductEntity>;
  abstract findAll(): Promise<ProductEntity[]>;
  abstract findOne(id: string): Promise<ProductEntity>;
  abstract update(
    id: string,
    body: UpdateProductRequestDto,
  ): Promise<ProductEntity>;
  abstract remove(id: string): Promise<ProductEntity>;
}
