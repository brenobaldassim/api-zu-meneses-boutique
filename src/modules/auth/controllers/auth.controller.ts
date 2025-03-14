import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { LogInDto } from '../dtos/LogInDto';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from '@src/modules/user/services/user.service';
import { AuthenticatedRequest } from '@src/@types/auth';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
    const user = await this.userService.findOneByEmail(req.user.email);
    return new UserEntity(user);
  }
}
