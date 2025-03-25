import { UserEntity } from '@src/modules/user/entities/user.entity';
import { AuthUserDto } from '../dtos/AuthUserDto';
import { LogInDto } from '../dtos/LogInDto';

export abstract class AuthServiceContract {
  public abstract login(data: AuthUserDto): Promise<LogInDto>;
  public abstract create(data: AuthUserDto): Promise<UserEntity>;
  public abstract forgotPassword(email: string): Promise<void>;
  public abstract resetPassword(
    token: string,
    new_password: string,
  ): Promise<UserEntity>;
}
