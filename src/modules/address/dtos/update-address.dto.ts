import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsOptional()
  id?: string;

  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;
}
