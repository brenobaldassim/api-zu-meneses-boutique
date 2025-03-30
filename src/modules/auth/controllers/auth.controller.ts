import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { AuthUserDto } from '../dtos/auth-user.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { LogInDto } from '../dtos/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AuthenticatedRequest } from '@src/@types/auth';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { EmailSentDto } from '../dtos/email-sent.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UserServiceContract } from '@src/modules/user/contracts/user-service.contract';
import { AuthServiceContract } from '../contracts/auth-service.contract';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthServiceContract)
    private readonly authService: AuthServiceContract,
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  @Post()
  async create(@Body() data: AuthUserDto): Promise<UserEntity> {
    const user = await this.authService.create(data);
    return new UserEntity(user);
  }

  @Post('login')
  async login(@Body() data: AuthUserDto): Promise<LogInDto> {
    const userAndToken = await this.authService.login(data);
    return new LogInDto(userAndToken);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<UserEntity> {
    const user = await this.userService.findOneByEmailOrThrow(req.user.email);
    return new UserEntity(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto): Promise<EmailSentDto> {
    const { email } = data;
    await this.authService.forgotPassword(email);

    return new EmailSentDto({
      message: 'Email sent with sucess',
      to: data.email,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    const { token, new_password } = data;
    const updatedUser = await this.authService.resetPassword(
      token,
      new_password,
    );

    return new UserEntity(updatedUser);
  }
}
