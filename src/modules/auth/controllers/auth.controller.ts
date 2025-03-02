import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UserEntity } from '@modules/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserEntity> {
    const user = await this.authService.create(data);

    return new UserEntity(user);
  }
}
