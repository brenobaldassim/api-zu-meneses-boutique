import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserServiceContract } from '../contracts/user.service.contract';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UserServiceContract)
    private readonly userService: UserServiceContract,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findOneOrThrow(id);
    return new UserEntity(user);
  }
}
