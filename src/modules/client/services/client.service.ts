import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { UpdateClientRequestDto } from '../dtos/update-client-request.dto';
import { ClientServiceContract } from './contracts/client-service.contract';
import { ClientEntity } from '../entities/client.entity';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAddressDto } from '@src/modules/address/dtos/create-address.dto';

@Injectable()
export class ClientService implements ClientServiceContract {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async create(body: CreateClientRequestDto): Promise<ClientEntity> {
    const { addresses, ...data } = body;

    const client = await this.prisma.client.findUnique({
      where: { email: data.email },
    });

    if (client) {
      throw new HttpException('Client already exists', 400);
    }

    const newClient = await this.prisma.client.create({
      data: {
        ...data,
        addresses: {
          create: addresses,
        },
      },
      include: {
        addresses: true,
      },
    });
    return newClient;
  }

  async findAll(): Promise<ClientEntity[]> {
    return await this.prisma.client.findMany({
      where: { deletedAt: null },
      include: { addresses: true },
    });
  }

  async findUniqueOrThrow(id: string): Promise<ClientEntity> {
    return await this.prisma.client.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: { addresses: true },
    });
  }

  async update(
    id: string,
    body: UpdateClientRequestDto,
  ): Promise<ClientEntity> {
    if (!id) {
      throw new HttpException('Id is required', 400);
    }

    const { addresses, ...data } = body;

    const updateOps: Prisma.AddressUpdateWithWhereUniqueWithoutClientInput[] =
      [];
    const createOps: Prisma.AddressCreateWithoutClientInput[] = [];

    const oldAddresses = await this.prisma.address.findMany({
      where: { clientId: id },
    });

    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        if (!address.id) {
          if (oldAddresses.length > 0) {
            throw new HttpException('Id is required', 400);
          }
          const newAddress = new CreateAddressDto(address);
          createOps.push(newAddress);
        }
        updateOps.push({
          where: { id: address.id },
          data: address,
        });
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        ...data,
        addresses: {
          update: updateOps,
          create: createOps,
        },
      },
      include: { addresses: true },
    });

    return updatedClient;
  }

  async softDelete(id: string): Promise<ClientEntity> {
    if (!id) {
      throw new HttpException('Id is required', 400);
    }

    const softDeletedClient = await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { addresses: true },
    });

    return softDeletedClient;
  }
}
