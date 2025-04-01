import { AddressType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Number is required' })
  number: string;

  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;

  @IsNotEmpty({ message: 'Street is required' })
  street: string;

  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsOptional()
  @IsNotEmpty({ message: 'CEP must not be an empty string if provided' })
  cep: string | null;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(AddressType, { message: 'Invalid address type' })
  type: AddressType;

  constructor(partial: Partial<CreateAddressDto>) {
    Object.assign(this, partial);
  }
}
