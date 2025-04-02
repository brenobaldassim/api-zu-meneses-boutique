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
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { ClientServiceContract } from '../contracts/client-service.contract';
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
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientService.create(createClientDto);
    return new ClientEntity(client);
  }

  @Get()
  async findAll() {
    const clients = await this.clientService.findAll();
    return clients.map((client) => new ClientEntity(client));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.clientService.findUniqueOrThrow(id);
    return new ClientEntity(client);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientEntity> {
    const client = await this.clientService.update(id, updateClientDto);
    return new ClientEntity(client);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ClientEntity> {
    const deletedCLient = await this.clientService.softDelete(id);
    return new ClientEntity(deletedCLient);
  }
}
