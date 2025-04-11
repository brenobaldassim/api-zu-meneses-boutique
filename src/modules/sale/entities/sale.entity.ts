import { SaleProductsEntity } from '@src/modules/saleProducts/entities/sale-products.etity';

export class SaleEntity {
  id: string;
  clientId: string;
  totalAmountCents: number;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
  saleProducts?: SaleProductsEntity[];

  constructor(partial: Partial<SaleEntity>) {
    Object.assign(this, partial);
  }
}
