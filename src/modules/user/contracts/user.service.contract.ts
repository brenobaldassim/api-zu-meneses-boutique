import { Prisma } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

export abstract class UserServiceContract {
  public abstract create(data: Prisma.UserCreateInput): Promise<UserEntity>;
  public abstract findOne(id: string): Promise<UserEntity | null>;
  public abstract findOneByEmail(email: string): Promise<UserEntity | null>;
  public abstract findOneOrThrow(id: string): Promise<UserEntity>;
  public abstract findOneByEmailOrThrow(email: string): Promise<UserEntity>;
  public abstract update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserEntity>;
}
