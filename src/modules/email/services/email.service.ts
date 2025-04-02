import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  EmailServiceContract,
  EmailServiceSendInput,
} from './contracts/email-service.contract';

@Injectable()
export class EmailService implements EmailServiceContract {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  public async send(input: EmailServiceSendInput): Promise<void> {
    await this.mailService.sendMail({
      ...input,
      from: this.configService.get('EMAIL_FROM'),
    });
  }

  public async sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const tokenUrl = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;

    await this.send({
      to: email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        token: tokenUrl,
      },
    });
  }
}
