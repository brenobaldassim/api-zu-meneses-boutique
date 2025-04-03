import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserServiceContract } from '../services/contracts/user-service.contract';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findOneOrThrow(id);
    return new UserEntity(user);
  }
}
