import * as path from 'path';
import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailServiceContract } from './contracts/email-service.contract';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: Number(configService.get('EMAIL_PORT')),
          secure: false,
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get('EMAIL_FROM')}>`,
        },
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: EmailServiceContract,
      useClass: EmailService,
    },
  ],
  exports: [EmailServiceContract],
})
export class EmailModule {}
