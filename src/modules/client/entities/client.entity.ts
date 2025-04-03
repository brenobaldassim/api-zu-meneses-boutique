import { Address } from '@prisma/client';

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

  constructor(partial: Partial<ClientEntity>) {
    Object.assign(this, partial);
  }
}
