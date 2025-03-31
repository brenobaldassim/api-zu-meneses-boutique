import { CreateAddressDto } from '../dtos/create-address.dto';
import { UpdateAddressDto } from '../dtos/update-address.dto';
import { AddressEntity } from '../entities/address.entity';

export abstract class AddressServiceContract {
  public abstract create(data: CreateAddressDto): Promise<AddressEntity>;
  public abstract findByClientId(
    clientId: string,
  ): Promise<AddressEntity | null>;
  public abstract update(
    id: string,
    data: UpdateAddressDto,
  ): Promise<AddressEntity>;
}
