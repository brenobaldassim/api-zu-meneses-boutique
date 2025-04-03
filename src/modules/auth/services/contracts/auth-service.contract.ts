import { UserEntity } from '@src/modules/user/entities/user.entity';
import { LogInUserResponseDto } from '../../dtos/login-user-response.dto';
import { RegisterUserResponseDto } from '../../dtos/resgister-user-response.dto';
import { RegisterUserRequestDto } from '../../dtos/register-user-request.dto';
import { LoginUserRequestDto } from '../../dtos/login-user-request.dto';

export abstract class AuthServiceContract {
  public abstract login(
    body: LoginUserRequestDto,
  ): Promise<LogInUserResponseDto>;
  public abstract register(
    body: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto>;
  public abstract forgotPassword(email: string): Promise<void>;
  public abstract resetPassword(
    token: string,
    new_password: string,
  ): Promise<UserEntity>;
}
