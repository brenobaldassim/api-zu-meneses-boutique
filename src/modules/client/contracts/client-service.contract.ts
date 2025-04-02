import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { ClientEntity } from '../entities/client.entity';

export abstract class ClientServiceContract {
  public abstract create(data: CreateClientDto): Promise<ClientEntity>;
  public abstract findAll(): Promise<ClientEntity[]>;
  public abstract findUniqueOrThrow(id: string): Promise<ClientEntity>;
  public abstract update(
    id: string,
    data: UpdateClientDto,
  ): Promise<ClientEntity>;
  public abstract softDelete(id: string): Promise<ClientEntity>;
}
