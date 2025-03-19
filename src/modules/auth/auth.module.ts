import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '@src/config/auth';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      global: true,
      secret: jwt.secret,
      signOptions: jwt.signOptions,
    }),
    PrismaModule,
    EmailModule,
    UserModule,
  ],
})
export class AuthModule {}
