import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserServiceContract } from './contracts/user.service.contract';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    {
      provide: UserServiceContract,
      useClass: UserService,
    },
  ],
  exports: [UserServiceContract],
})
export class UserModule {}
