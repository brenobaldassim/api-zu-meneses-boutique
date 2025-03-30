import { IsEmail } from 'class-validator';

export class EmailSentDto {
  message: string;

  @IsEmail()
  to: string;

  constructor(obj: EmailSentDto) {
    Object.assign(this, obj);
  }
}
