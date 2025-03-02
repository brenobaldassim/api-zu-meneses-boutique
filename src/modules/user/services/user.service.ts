import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
