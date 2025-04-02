import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAddressDto } from '@src/modules/address/dtos/update-address.dto';

export class UpdateClientDto extends PartialType(
  OmitType(CreateClientDto, ['addresses'] as const),
) {
  @IsOptional()
  @IsArray({ message: 'addresses must be an array if provided' })
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: UpdateAddressDto[];
}
