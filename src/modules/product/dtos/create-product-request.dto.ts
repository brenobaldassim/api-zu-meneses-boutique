import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateProductRequestDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;
  @IsNotEmpty({ message: 'Price cannot be empty' })
  @Type(() => Number)
  @IsInt()
  priceCents: number;
  @IsNotEmpty({ message: 'Quantity cannot be empty' })
  @Type(() => Number)
  @IsInt()
  quantity: number;
}
