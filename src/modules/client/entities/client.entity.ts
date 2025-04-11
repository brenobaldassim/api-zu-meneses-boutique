import { Address } from '@prisma/client';
import { SaleEntity } from '@src/modules/sale/entities/sale.entity';

export class ClientEntity {
  id: string;
  name: string;
  lastName: string;
  email: string;
  cpf: string;
  socialMedia: string;
  createdAt: Date;
  updatedAt: Date;
  addresses?: Address[];
  sales?: SaleEntity[];

  constructor(partial: Partial<ClientEntity>) {
    Object.assign(this, partial);
  }
}
