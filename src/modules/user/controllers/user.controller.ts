import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserServiceContract } from '../services/contracts/user-service.contract';

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
