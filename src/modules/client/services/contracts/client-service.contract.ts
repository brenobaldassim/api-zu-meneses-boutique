import { CreateClientRequestDto } from '../../dtos/create-client-request.dto';
import { UpdateClientRequestDto } from '../../dtos/update-client-request.dto';
import { ClientEntity } from '../../entities/client.entity';

export abstract class ClientServiceContract {
  public abstract create(body: CreateClientRequestDto): Promise<ClientEntity>;
  public abstract findAll(): Promise<ClientEntity[]>;
  public abstract findUniqueOrThrow(id: string): Promise<ClientEntity>;
  public abstract update(
    id: string,
    body: UpdateClientRequestDto,
  ): Promise<ClientEntity>;
  public abstract softDelete(id: string): Promise<ClientEntity>;
}
