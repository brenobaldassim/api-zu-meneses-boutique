import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { UserModule } from '@modules/user/user.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '@modules/email/email.module';
import { ClientModule } from '../client/client.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    PrismaModule,
    EmailModule,
    UserModule,
    AuthModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global App Auth Guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Global Validation Pipe (class-validator)
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
    },
    // Global Serialization Interceptor (class-transformer)
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
