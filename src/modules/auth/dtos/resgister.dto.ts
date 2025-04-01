import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '@modules/user/entities/user.entity';

export class RegisterDto {
  @IsNotEmpty()
  user: UserEntity;
  @IsNotEmpty()
  token: string;

  constructor(obj: RegisterDto) {
    Object.assign(this, obj);
  }
}
