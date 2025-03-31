import { Injectable } from '@nestjs/common';
import { AddressServiceContract } from '../contracts/address-service.contract';
import { UpdateAddressDto } from '../dtos/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { CreateAddressDto } from '../dtos/create-address.dto';

@Injectable()
export class AddressService implements AddressServiceContract {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAddressDto): Promise<AddressEntity> {
    return await this.prisma.address.create({ data });
  }

  async findManyByClientId(clientId: string): Promise<AddressEntity[] | null> {
    return await this.prisma.address.findMany({ where: { clientId } });
  }

  async update(id: string, data: UpdateAddressDto): Promise<AddressEntity> {
    return await this.prisma.address.update({ where: { id }, data });
  }
}
