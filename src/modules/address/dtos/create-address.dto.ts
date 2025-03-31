import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  clientId: string;
  street: string;
  city: string;
  state: string;
  cep: string | null;
  number: string;
  type: AddressType;
}
