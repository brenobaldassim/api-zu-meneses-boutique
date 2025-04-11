import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleRequestDto } from './create-sale-request.dto';

export class UpdateSaleRequestDto extends PartialType(CreateSaleRequestDto) {}
