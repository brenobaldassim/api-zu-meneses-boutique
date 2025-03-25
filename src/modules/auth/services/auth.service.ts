import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from '../dtos/LogInDto';
import { JwtPayload } from '@src/@types/auth';
import { EmailServiceContract } from '@modules/email/contracts/email.service.contract';
import { AuthServiceContract } from '../contracts/auth.service.contract';
import { UserServiceContract } from '@src/modules/user/contracts/user.service.contract';

@Injectable()
export class AuthService implements AuthServiceContract {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(EmailServiceContract)
    private readonly emailService: EmailServiceContract,
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  async create(data: AuthUserDto): Promise<UserEntity> {
    const userExistent = await this.userService.findOneByEmail(data.email);

    if (userExistent) {
      throw new HttpException('User with this email already exist.', 400);
    }

    const { password } = data;
    data.password = await argon2.hash(password);

    const newUser = await this.userService.create(data);
    if (!newUser) {
      throw new HttpException('User not created.', 500);
    }

    return newUser;
  }

  async login(data: AuthUserDto): Promise<LogInDto> {
    const { email, password } = data;
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new HttpException('Incorrect email/password combination.', 401);
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new HttpException('Incorrect email/password combination.', 401);
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      user: new UserEntity(user),
      token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found for corresponding email.');
    }

    const token = await this.jwtService.signAsync(
      { email: user.email },
      { expiresIn: '15m' },
    );
    await this.emailService.sendResetPasswordEmail(email, token);
  }

  async resetPassword(
    token: string,
    new_password: string,
  ): Promise<UserEntity> {
    const payload: JwtPayload = await this.jwtService.verifyAsync(token);
    const user = await this.userService.findOneByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('User not found for corresponding email.');
    }

    const hashedPassword = await argon2.hash(new_password);
    const updatedUser = await this.userService.update(user.id, {
      password: hashedPassword,
    });

    return updatedUser;
  }
}
