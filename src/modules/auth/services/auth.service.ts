import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/modules/prisma/services/prisma.service';
import type { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from '../dtos/LogInDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: AuthUserDto): Promise<UserEntity> {
    const userExistent = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExistent) {
      throw new HttpException('User with this email already exist.', 400);
    }

    const { password } = data;
    data.password = await argon2.hash(password);

    const newUser = await this.prisma.user.create({ data });
    if (!newUser) {
      throw new HttpException('User not created.', 500);
    }

    return newUser;
  }

  async login(data: AuthUserDto): Promise<LogInDto> {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('Incorrect email/password combination.', 401);
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new HttpException('Incorrect email/password combination.', 401);
    }

    const payload = { sub: user.id, email: user.email };

    return {
      user: new UserEntity(user),
      token: await this.jwtService.signAsync(payload),
    };
  }
}
