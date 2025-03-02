import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
