import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailServiceContract } from './contracts/email-service.contract';

describe('EmailService', () => {
  let service: EmailServiceContract;
  let mailerService: MailerService;
  let configService: ConfigService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        EMAIL_FROM: 'no-reply@example.com',
        EMAIL_RESET_PASSWORD_URL: 'https://example.com/reset-password',
      };
      return config[key] as string;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EmailServiceContract, useClass: EmailService },
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailServiceContract>(EmailServiceContract);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should call mailerService.sendMail with the correct parameters', async () => {
      const input = {
        to: 'user@example.com',
        subject: 'Test Subject',
        template: 'test-template',
        context: { foo: 'bar' },
      };

      await service.send(input);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(configService.get).toHaveBeenCalledWith('EMAIL_FROM');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        ...input,
        from: 'no-reply@example.com',
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should build the reset password email and call send', async () => {
      const email = 'user@example.com';
      const token = '123abc';
      const expectedUrl = 'https://example.com/reset-password?token=123abc';

      const sendSpy = jest.spyOn(service, 'send').mockResolvedValue();

      await service.sendResetPasswordEmail(email, token);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'EMAIL_RESET_PASSWORD_URL',
      );
      expect(sendSpy).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset your password',
        template: 'reset-password',
        context: {
          token: expectedUrl,
        },
      });
    });
  });
});
