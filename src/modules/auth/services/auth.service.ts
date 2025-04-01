import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUserDto } from '../dtos/auth-user.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LogInDto } from '../dtos/login.dto';
import { JwtPayload } from '@src/@types/auth';
import { EmailServiceContract } from '@src/modules/email/contracts/email-service.contract';
import { AuthServiceContract } from '../contracts/auth-service.contract';
import { UserServiceContract } from '@src/modules/user/contracts/user-service.contract';

@Injectable()
export class AuthService implements AuthServiceContract {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(EmailServiceContract)
    private readonly emailService: EmailServiceContract,
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  async register(data: AuthUserDto): Promise<LogInDto> {
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

    const payload: JwtPayload = { sub: newUser.id, email: newUser.email };
    const token: string = await this.jwtService.signAsync(payload);

    return {
      user: newUser,
      token,
    };
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
    const token: string = await this.jwtService.signAsync(payload);

    return {
      user,
      token,
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
