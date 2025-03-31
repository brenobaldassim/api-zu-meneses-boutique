import { AddressType } from '@prisma/client';

export class AddressEntity {
  id: string;
  clientId: string;
  street: string;
  city: string;
  state: string;
  cep: string | null;
  number: string;
  type: AddressType;

  constructor(partial: Partial<AddressEntity>) {
    Object.assign(this, partial);
  }
}
