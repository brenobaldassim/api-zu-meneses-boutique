import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '@modules/user/entities/user.entity';

export class LogInDto {
  @IsNotEmpty()
  user: UserEntity;
  @IsNotEmpty()
  token: string;

  constructor(obj: LogInDto) {
    Object.assign(this, obj);
  }
}
