import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateClientRequestDto } from './create-client-request.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAddressDto } from '@src/modules/address/dtos/update-address.dto';

export class UpdateClientRequestDto extends PartialType(
  OmitType(CreateClientRequestDto, ['addresses'] as const),
) {
  @IsOptional()
  @IsArray({ message: 'addresses must be an array if provided' })
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: UpdateAddressDto[];
}
