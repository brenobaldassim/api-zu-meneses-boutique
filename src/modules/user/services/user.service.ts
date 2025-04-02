import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { UserServiceContract } from './contracts/user-service.contract';

@Injectable()
export class UserService implements UserServiceContract {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: UserEntity): Promise<UserEntity> {
    return await this.prisma.user.create({ data });
  }

  async findOne(id: string): Promise<UserEntity | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findOneOrThrow(id: string): Promise<UserEntity> {
    return await this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findOneByEmailOrThrow(email: string): Promise<UserEntity> {
    return await this.prisma.user.findUniqueOrThrow({ where: { email } });
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findOneOrThrow(id);
    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return userUpdated;
  }
}
