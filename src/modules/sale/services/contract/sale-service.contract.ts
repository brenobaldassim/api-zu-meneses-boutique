import { CreateSaleRequestDto } from '../../dtos/create-sale-request.dto';
import { UpdateSaleRequestDto } from '../../dtos/update-sale-request.dto';
import { SaleEntity } from '../../entities/sale.entity';

export abstract class SaleServiceContract {
  abstract create(body: CreateSaleRequestDto): Promise<SaleEntity>;
  abstract findAll(): Promise<SaleEntity[]>;
  abstract findOne(id: string): Promise<SaleEntity>;
  abstract update(id: string, body: UpdateSaleRequestDto): Promise<SaleEntity>;
  abstract remove(id: string): Promise<SaleEntity>;
}
