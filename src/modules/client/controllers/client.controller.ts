import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { UpdateClientRequestDto } from '../dtos/update-client-request.dto';
import { ClientServiceContract } from '../services/contracts/client-service.contract';
import { AuthGuard } from '@src/modules/auth/guards/auth.guard';
import { ClientEntity } from '../entities/client.entity';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('clients')
export class ClientController {
  constructor(
    @Inject(ClientServiceContract)
    private readonly clientService: ClientServiceContract,
  ) {}

  @Post()
  async create(@Body() body: CreateClientRequestDto): Promise<ClientEntity> {
    const client = await this.clientService.create(body);
    return new ClientEntity(client);
  }

  @Get()
  async findAll(): Promise<ClientEntity[]> {
    const clients = await this.clientService.findAll();
    return clients.map((client) => new ClientEntity(client));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ClientEntity> {
    const client = await this.clientService.findUniqueOrThrow(id);
    return new ClientEntity(client);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateClientRequestDto,
  ): Promise<ClientEntity> {
    const client = await this.clientService.update(id, body);
    return new ClientEntity(client);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ClientEntity> {
    const deletedCLient = await this.clientService.softDelete(id);
    return new ClientEntity(deletedCLient);
  }
}
