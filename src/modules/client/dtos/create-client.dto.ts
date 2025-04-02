import {
  IsOptional,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from '@src/modules/address/dtos/create-address.dto';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  lastName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @IsNotEmpty({ message: 'CPF cannot be empty' })
  cpf: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'socialMedia must not be an empty string if provided',
  })
  socialMedia: string;

  @IsOptional()
  @IsArray({ message: 'addresses must be an array if provided' })
  @ArrayNotEmpty({
    message: 'addresses must not be an empty array if provided',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];

  constructor(partial: Partial<CreateClientDto>) {
    Object.assign(this, partial);
  }
}
