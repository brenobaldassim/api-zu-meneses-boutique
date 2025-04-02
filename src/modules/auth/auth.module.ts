import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '@modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from '@src/config/auth';
import { EmailModule } from '@modules/email/email.module';
import { AuthServiceContract } from './services/contracts/auth-service.contract';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwt.secret,
      signOptions: jwt.signOptions,
    }),
    EmailModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthServiceContract,
      useClass: AuthService,
    },
  ],
  exports: [AuthServiceContract],
})
export class AuthModule {}
