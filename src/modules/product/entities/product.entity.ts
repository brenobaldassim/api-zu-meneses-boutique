export class ProductEntity {
  id: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
