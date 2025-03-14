import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '@src/config/auth';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwt.secret,
      signOptions: jwt.signOptions,
    }),
    UserModule,
  ],
})
export class AuthModule {}
