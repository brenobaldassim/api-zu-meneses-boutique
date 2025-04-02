import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '@modules/user/entities/user.entity';

export class RegisterUserResponseDto {
  @IsNotEmpty()
  user: UserEntity;
  @IsNotEmpty()
  token: string;

  constructor(obj: RegisterUserResponseDto) {
    Object.assign(this, obj);
  }
}
