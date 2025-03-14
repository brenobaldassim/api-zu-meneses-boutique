import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthUserDto } from '../dtos/AuthUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { LogInDto } from '../dtos/LogInDto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
