import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import type { CreateUserDto } from '../dtos/CreateUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const userExistent = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExistent) {
      throw new HttpException('User with this email already exist', 400);
    }

    const { password } = data;
    data.password = await argon2.hash(password);

    const newUser = await this.prisma.user.create({ data });
    if (!newUser) {
      throw new HttpException('User not created', 500);
    }

    return newUser;
  }
}
