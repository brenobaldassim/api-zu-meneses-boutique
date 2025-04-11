export class SaleProductsEntity {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SaleProductsEntity>) {
    Object.assign(this, partial);
  }
}
