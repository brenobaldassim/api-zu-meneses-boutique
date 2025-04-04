import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateProductRequestDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'Price cannot be empty' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents: number;

  @IsNotEmpty({ message: 'Quantity cannot be empty' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}
