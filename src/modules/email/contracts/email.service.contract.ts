export interface EmailServiceSendInput {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

abstract class EmailServiceContract {
  public abstract send(input: EmailServiceSendInput): Promise<void>;
  public abstract sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void>;
  public abstract sendWelcomeEmail(email: string): Promise<void>;
}

export { EmailServiceContract };
