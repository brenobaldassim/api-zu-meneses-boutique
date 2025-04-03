import { Body, Controller, Get, Post, Request, Inject } from '@nestjs/common';
import { RegisterUserRequestDto } from '../dtos/register-user-request.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { AuthenticatedRequest } from '@src/@types/auth';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { EmailSentDto } from '../dtos/email-sent.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UserServiceContract } from '@src/modules/user/services/contracts/user-service.contract';
import { AuthServiceContract } from '../services/contracts/auth-service.contract';
import { LoginUserRequestDto } from '../dtos/login-user-request.dto';
import { LogInUserResponseDto } from '../dtos/login-user-response.dto';
import { RegisterUserResponseDto } from '../dtos/resgister-user-response.dto';
import { Public } from '@src/shared/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthServiceContract)
    private readonly authService: AuthServiceContract,
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  @Public()
  @Post()
  async register(
    @Body() body: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    const { user, token } = await this.authService.register(body);
    return new RegisterUserResponseDto({ user: new UserEntity(user), token });
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginUserRequestDto,
  ): Promise<LogInUserResponseDto> {
    const { user, token } = await this.authService.login(body);
    return new LogInUserResponseDto({ user: new UserEntity(user), token });
  }

  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<UserEntity> {
    const user = await this.userService.findOneByEmailOrThrow(req.user.email);
    return new UserEntity(user);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<EmailSentDto> {
    const { email } = body;
    await this.authService.forgotPassword(email);

    return new EmailSentDto({
      message: 'Email sent with sucess',
      to: body.email,
    });
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { token, new_password } = body;
    const updatedUser = await this.authService.resetPassword(
      token,
      new_password,
    );

    return new UserEntity(updatedUser);
  }
}
