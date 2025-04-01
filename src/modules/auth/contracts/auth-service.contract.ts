import { UserEntity } from '@src/modules/user/entities/user.entity';
import { AuthUserDto } from '../dtos/auth-user.dto';
import { LogInDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/resgister.dto';

export abstract class AuthServiceContract {
  public abstract login(data: AuthUserDto): Promise<LogInDto>;
  public abstract register(data: AuthUserDto): Promise<RegisterDto>;
  public abstract forgotPassword(email: string): Promise<void>;
  public abstract resetPassword(
    token: string,
    new_password: string,
  ): Promise<UserEntity>;
}
